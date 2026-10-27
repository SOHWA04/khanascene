/**
 * KhanaScene — Supabase Edge Function: `delete-account`
 *
 * Deletes the authenticated caller's account and cascades deletion across
 * `profiles`, `saved_places`, `user_reviews`, `review_reports`, and `restaurant_submissions`.
 *
 * Security:
 * - Never trusts a client-supplied user ID.
 * - Verifies the caller's JWT using the Authorization header first.
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

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server configuration incomplete' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Verify the caller's token with the anon client
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid or expired authentication session' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Delete the verified user via Admin API (cascades to all user tables)
  const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return new Response(JSON.stringify({ error: 'Failed to delete user account' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ deleted: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
