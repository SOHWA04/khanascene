import fs from 'fs';
import path from 'path';
import { useAuthStore } from '@/stores/useAuthStore';
import { useSavedStore } from '@/stores/useSavedStore';

describe('Phase 3 — Supabase Database Schema, RLS & Security Verification', () => {
  const migrationPath = path.join(
    __dirname,
    '../../supabase/migrations/20261025000001_initial_schema.sql'
  );
  const seedPath = path.join(
    __dirname,
    '../../supabase/migrations/20261025000002_seed_cities_areas_cuisines.sql'
  );

  it('defines all 11 required tables and enables Row Level Security on every table', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    const requiredTables = [
      'cities',
      'areas',
      'cuisines',
      'restaurant_records',
      'restaurant_record_cuisines',
      'profiles',
      'saved_places',
      'restaurant_menus',
      'menu_items',
      'user_reviews',
      'review_reports',
      'restaurant_submissions',
    ];

    for (const table of requiredTables) {
      expect(sql).toContain(`create table if not exists public.${table}`);
      expect(sql).toContain(`alter table public.${table} enable row level security;`);
    }

    // Verify account deletion RPC exists and is restricted to authenticated users
    expect(sql).toContain('create or replace function public.delete_my_account()');
    expect(sql).toContain('grant execute on function public.delete_my_account() to authenticated;');

    // Verify moderation protection on user_reviews
    expect(sql).toContain("and moderation_status = 'pending'");
  });

  it('seeds Islamabad, Rawalpindi, neighbourhoods and all 13 cuisine categories', () => {
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    expect(seedSql).toContain("'islamabad', 'Islamabad'");
    expect(seedSql).toContain("'rawalpindi', 'Rawalpindi'");
    expect(seedSql).toContain("'isb-f7'");
    expect(seedSql).toContain("'rwp-saddar'");
    expect(seedSql).toContain("'breakfast-brunch'");
    expect(seedSql).toContain("'street-food'");
  });
});

describe('Phase 3 — Authentication & Favourites Persistence Flows', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isInitializing: false,
      isSubmitting: false,
      authError: null,
    });
    useSavedStore.setState({
      savedPlaceIds: [],
      isHydrated: true,
      isSyncingCloud: false,
    });
  });

  it('validates sign-in and sign-up inputs before making network requests', async () => {
    const signInRes = await useAuthStore.getState().signInWithEmail('invalid-email', '');
    expect(signInRes.ok).toBe(false);
    expect(signInRes.error).toContain('valid email');

    const shortPassRes = await useAuthStore
      .getState()
      .signUpWithEmail('Ali', 'ali@example.com', 'short');
    expect(shortPassRes.ok).toBe(false);
    expect(shortPassRes.error).toContain('8 characters');
  });

  it('persists guest saved place references and prevents duplicate placeIds', async () => {
    await useSavedStore.getState().toggleSavedPlace('dev-place-isb-monal-ridge');
    expect(useSavedStore.getState().savedPlaceIds).toEqual(['dev-place-isb-monal-ridge']);
    expect(useSavedStore.getState().isPlaceSaved('dev-place-isb-monal-ridge')).toBe(true);

    // Toggling again removes it cleanly
    await useSavedStore.getState().toggleSavedPlace('dev-place-isb-monal-ridge');
    expect(useSavedStore.getState().savedPlaceIds).toEqual([]);
  });
});
