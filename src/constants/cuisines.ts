import { Ionicons } from '@expo/vector-icons';

export interface CuisineVisual {
  emoji: string;
  bg: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const CUISINE_VISUALS: Record<string, CuisineVisual> = {
  pakistani: { emoji: '🥘', bg: '#FEF3C7', color: '#B45309', icon: 'restaurant' },
  biryani: { emoji: '🍛', bg: '#FEE2E2', color: '#B91C1C', icon: 'flame' },
  karahi: { emoji: '🍲', bg: '#FFEDD5', color: '#C2410C', icon: 'bonfire' },
  bbq: { emoji: '🍢', bg: '#FEE2E2', color: '#DC2626', icon: 'flame' },
  burgers: { emoji: '🍔', bg: '#FEF9C3', color: '#A16207', icon: 'fast-food' },
  pizza: { emoji: '🍕', bg: '#FFEDD5', color: '#EA580C', icon: 'pizza' },
  chinese: { emoji: '🥢', bg: '#FEE2E2', color: '#991B1B', icon: 'nutrition' },
  turkish: { emoji: '🥙', bg: '#EDE9FE', color: '#6D28D9', icon: 'restaurant' },
  'middle-eastern': { emoji: '🧆', bg: '#FEF3C7', color: '#92400E', icon: 'earth' },
  cafes: { emoji: '☕', bg: '#ECFDF5', color: '#047857', icon: 'cafe' },
  desserts: { emoji: '🍰', bg: '#FCE7F3', color: '#BE185D', icon: 'ice-cream' },
  'breakfast-brunch': { emoji: '🍳', bg: '#FEF08A', color: '#854D0E', icon: 'sunny' },
  breakfast: { emoji: '🍳', bg: '#FEF08A', color: '#854D0E', icon: 'sunny' },
  'street-food': { emoji: '🫓', bg: '#F0FDF4', color: '#166534', icon: 'storefront' },
  steaks: { emoji: '🥩', bg: '#FFE4E6', color: '#9F1239', icon: 'flame' },
  shinwari: { emoji: '🍖', bg: '#FEF3C7', color: '#78350F', icon: 'bonfire' },
  'tea-chai': { emoji: '🫖', bg: '#FEF3C7', color: '#B45309', icon: 'cafe' },
  'ice-cream': { emoji: '🍨', bg: '#FDF2F8', color: '#DB2777', icon: 'ice-cream' },
  continental: { emoji: '🍽️', bg: '#E0F2FE', color: '#0369A1', icon: 'restaurant' },
  mandi: { emoji: '🍗', bg: '#FEF3C7', color: '#B45309', icon: 'flame' },
};

export function getCuisineVisual(slug?: string | null): CuisineVisual {
  if (!slug) {
    return { emoji: '🍽️', bg: '#EAF4F0', color: '#126149', icon: 'restaurant' };
  }
  const clean = slug.toLowerCase().trim();
  return (
    CUISINE_VISUALS[clean] || {
      emoji: '🍽️',
      bg: '#EAF4F0',
      color: '#126149',
      icon: 'restaurant',
    }
  );
}

export function detectRestaurantEmoji(name: string, category?: string | null, cuisines?: string[]): string {
  const text = `${name} ${category ?? ''} ${(cuisines ?? []).join(' ')}`.toLowerCase();
  if (text.includes('biryani') || text.includes('pulao')) return '🍛';
  if (text.includes('karahi') || text.includes('handi')) return '🍲';
  if (text.includes('bbq') || text.includes('tikka') || text.includes('kabab') || text.includes('kebab')) return '🍢';
  if (text.includes('burger') || text.includes('smash') || text.includes('bazinga')) return '🍔';
  if (text.includes('pizza')) return '🍕';
  if (text.includes('steak') || text.includes('beef') || text.includes('grill')) return '🥩';
  if (text.includes('chinese') || text.includes('wok') || text.includes('szechuan') || text.includes('noodle')) return '🥢';
  if (text.includes('cafe') || text.includes('coffee') || text.includes('roast') || text.includes('brew')) return '☕';
  if (text.includes('tea') || text.includes('chai') || text.includes('doodh patti')) return '🫖';
  if (text.includes('bakery') || text.includes('bakers') || text.includes('cake') || text.includes('brownie')) return '🍰';
  if (text.includes('ice cream') || text.includes('gelato') || text.includes('kulfi') || text.includes('falooda')) return '🍨';
  if (text.includes('halwa puri') || text.includes('nashta') || text.includes('nihari') || text.includes('paye')) return '🍳';
  if (text.includes('shinwari') || text.includes('namkeen') || text.includes('rosh') || text.includes('dumba')) return '🍖';
  if (text.includes('mandi') || text.includes('madfoon')) return '🍗';
  if (text.includes('chaat') || text.includes('dahi bhallay') || text.includes('samosa') || text.includes('bun kabab')) return '🫓';
  return '🍽️';
}
