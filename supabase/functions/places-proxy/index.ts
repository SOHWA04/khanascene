/**
 * KhanaScene — Controlled Google Places API (New) Proxy Edge Function (`places-proxy`)
 *
 * Implements the 3-Layer "Zero-Cost Until Revenue" & Policy Compliance Architecture:
 * 1. Validates request payloads and enforces per-IP rate limiting (max 15 requests/minute).
 * 2. Atomically checks the PostgreSQL Free-Tier Circuit Breaker (`consume_places_quota`)
 *    BEFORE calling Google Places API (New). Hard-stops at 850 calls/month per SKU
 *    (safely inside Google's 1,000 free monthly allowance).
 * 3. Uses a secret server-side API key (`GOOGLE_PLACES_API_KEY`) from Supabase Vault/Secrets.
 * 4. Enforces strict minimal `X-Goog-FieldMask` headers for Text Search (New) and Place Details (New).
 * 5. Never stores restricted Google Places content in the database.
 */

// @ts-expect-error Deno runtime imports are resolved by Supabase Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Strict minimal FieldMasks to control SKU tier & payload size
export const TEXT_SEARCH_FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.shortFormattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.primaryTypeDisplayName',
  'places.currentOpeningHours.openNow',
  'places.location',
  'places.googleMapsUri',
].join(',');

export const PLACE_DETAILS_FIELD_MASK = [
  'id',
  'displayName',
  'formattedAddress',
  'shortFormattedAddress',
  'rating',
  'userRatingCount',
  'priceLevel',
  'primaryTypeDisplayName',
  'currentOpeningHours.openNow',
  'regularOpeningHours.weekdayDescriptions',
  'nationalPhoneNumber',
  'websiteUri',
  'location',
  'googleMapsUri',
  'reviews',
].join(',');

// Lightweight in-memory per-IP rate limiter (15 req / 60s window per isolate)
const ipRateWindows = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 15;

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const entry = ipRateWindows.get(clientIp);
  if (!entry || now > entry.resetAt) {
    ipRateWindows.set(clientIp, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  entry.count += 1;
  return true;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please wait a moment before searching again.',
        rateLimited: true,
      }),
      {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY') ?? '';
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!googleApiKey || !supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        error: 'Google Places proxy secrets are not configured on the server yet.',
        unconfigured: true,
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  let body: {
    action?: 'textSearch' | 'placeDetails';
    textQuery?: string;
    cityId?: 'islamabad' | 'rawalpindi';
    placeId?: string;
    openNow?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

  // ---------------------------------------------------------------------------
  // Action 1: Text Search (New)
  // ---------------------------------------------------------------------------
  if (body.action === 'textSearch') {
    const rawQuery = (body.textQuery ?? '').trim();
    if (rawQuery.length < 2 || rawQuery.length > 120) {
      return new Response(
        JSON.stringify({ error: 'Search query must be between 2 and 120 characters.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check Free-Tier Circuit Breaker BEFORE calling Google
    const { data: quotaRows, error: quotaError } = await adminClient.rpc(
      'consume_places_quota',
      {
        p_sku_key: 'places_text_search_enterprise',
        p_default_limit: 850,
      }
    );

    const quota = Array.isArray(quotaRows) ? quotaRows[0] : quotaRows;
    if (quotaError || !quota?.allowed) {
      return new Response(
        JSON.stringify({
          places: [],
          quotaPaused: true,
          message:
            'Monthly free Google Places API allowance reached ($0.00 cost protection active). Showing verified KhanaScene listings and free Google Maps deep links.',
          quota,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const cityName = body.cityId === 'rawalpindi' ? 'Rawalpindi' : 'Islamabad';
    const fullQuery = rawQuery.toLowerCase().includes(cityName.toLowerCase())
      ? `${rawQuery}, Pakistan`
      : `${rawQuery} in ${cityName}, Pakistan`;

    const googleRes = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': googleApiKey,
        'X-Goog-FieldMask': TEXT_SEARCH_FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: fullQuery,
        regionCode: 'PK',
        languageCode: 'en',
        maxResultCount: 10,
        ...(body.openNow ? { openNow: true } : {}),
      }),
    });

    if (!googleRes.ok) {
      return new Response(
        JSON.stringify({
          error: `Google Places Text Search failed with status ${googleRes.status}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const payload = await googleRes.json();
    return new Response(
      JSON.stringify({
        places: payload.places ?? [],
        quotaPaused: false,
        quota,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  // ---------------------------------------------------------------------------
  // Action 2: Place Details (New)
  // ---------------------------------------------------------------------------
  if (body.action === 'placeDetails') {
    const placeId = (body.placeId ?? '').trim();
    if (!placeId || placeId.length > 200 || /[^a-zA-Z0-9_-]/.test(placeId)) {
      return new Response(JSON.stringify({ error: 'Invalid placeId parameter' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check Free-Tier Circuit Breaker BEFORE calling Google
    const { data: quotaRows, error: quotaError } = await adminClient.rpc(
      'consume_places_quota',
      {
        p_sku_key: 'places_details_enterprise',
        p_default_limit: 850,
      }
    );

    const quota = Array.isArray(quotaRows) ? quotaRows[0] : quotaRows;
    if (quotaError || !quota?.allowed) {
      return new Response(
        JSON.stringify({
          place: null,
          quotaPaused: true,
          message:
            'Monthly free Google Places API allowance reached ($0.00 cost protection active). Open on Google Maps for live details.',
          quota,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const googleRes = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en&regionCode=PK`,
      {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': googleApiKey,
          'X-Goog-FieldMask': PLACE_DETAILS_FIELD_MASK,
        },
      }
    );

    if (!googleRes.ok) {
      return new Response(
        JSON.stringify({
          error: `Google Place Details failed with status ${googleRes.status}`,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const place = await googleRes.json();
    return new Response(
      JSON.stringify({
        place,
        quotaPaused: false,
        quota,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  return new Response(JSON.stringify({ error: 'Unsupported action' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
