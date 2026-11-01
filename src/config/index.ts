import { CityConfig, CitySlug, CuisineCategory } from '@/types/restaurant';

export const APP_CONFIG = {
  appName: 'KhanaScene',
  tagline: 'Khana kahan? Scene yahan.',
  description: "Pakistan's restaurant discovery guide.",
  version: '1.0.0',
  defaultCity: (process.env.EXPO_PUBLIC_DEFAULT_CITY as CitySlug) || 'islamabad',
  dataMode: (process.env.EXPO_PUBLIC_DATA_MODE as 'mock' | 'live') || 'mock',
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  maxComparisonItems: 3,
} as const;

export const INITIAL_CITIES: Record<CitySlug, CityConfig> = {
  islamabad: {
    id: 'islamabad',
    name: 'Islamabad',
    countryCode: 'PK',
    isActive: true,
    center: {
      latitude: 33.6844,
      longitude: 73.0479,
    },
    areas: [
      { id: 'isb-f6', cityId: 'islamabad', name: 'F-6 Markaz', isActive: true },
      { id: 'isb-f7', cityId: 'islamabad', name: 'F-7 Markaz', isActive: true },
      { id: 'isb-f8', cityId: 'islamabad', name: 'F-8 Markaz', isActive: true },
      { id: 'isb-f10', cityId: 'islamabad', name: 'F-10 Markaz', isActive: true },
      { id: 'isb-f11', cityId: 'islamabad', name: 'F-11 Markaz', isActive: true },
      { id: 'isb-blue-area', cityId: 'islamabad', name: 'Blue Area', isActive: true },
      { id: 'isb-i8', cityId: 'islamabad', name: 'I-8 Markaz', isActive: true },
      { id: 'isb-e7', cityId: 'islamabad', name: 'E-7', isActive: true },
      { id: 'isb-daman-e-koh', cityId: 'islamabad', name: 'Margalla Hills', isActive: true },
      { id: 'isb-nust', cityId: 'islamabad', name: '🎓 NUST (H-12/H-13)', isActive: true },
      { id: 'isb-fast', cityId: 'islamabad', name: '🎓 FAST (H-9/I-9)', isActive: true },
      { id: 'isb-comsats', cityId: 'islamabad', name: '🎓 COMSATS (Park Rd)', isActive: true },
      { id: 'isb-bahria-air', cityId: 'islamabad', name: '🎓 Bahria & Air (E-8/E-9)', isActive: true },
    ],
  },
  rawalpindi: {
    id: 'rawalpindi',
    name: 'Rawalpindi',
    countryCode: 'PK',
    isActive: true,
    center: {
      latitude: 33.5651,
      longitude: 73.0169,
    },
    areas: [
      { id: 'rwp-saddar', cityId: 'rawalpindi', name: 'Saddar', isActive: true },
      { id: 'rwp-bahria', cityId: 'rawalpindi', name: 'Bahria Town', isActive: true },
      { id: 'rwp-dha', cityId: 'rawalpindi', name: 'DHA', isActive: true },
      { id: 'rwp-commercial', cityId: 'rawalpindi', name: 'Commercial Market', isActive: true },
      { id: 'rwp-peshawar-rd', cityId: 'rawalpindi', name: 'Peshawar Road', isActive: true },
      { id: 'rwp-chaklala', cityId: 'rawalpindi', name: 'Chaklala Scheme 3', isActive: true },
      { id: 'rwp-commercial-campus', cityId: 'rawalpindi', name: '🎓 Commercial Market Hub', isActive: true },
      { id: 'rwp-ayub-park', cityId: 'rawalpindi', name: '🌳 Ayub Park Hub', isActive: true },
    ],
  },
};

export interface CampusHub {
  id: string;
  name: string;
  shortName: string;
  cityId: CitySlug;
  areaId: string;
  popularSpotsHint: string;
}

export const CAMPUS_HUBS: CampusHub[] = [
  {
    id: 'nust',
    name: 'NUST Islamabad',
    shortName: 'NUST (H-12)',
    cityId: 'islamabad',
    areaId: 'isb-nust',
    popularSpotsHint: 'H-13 Gates, C1/C2 & G-11 late runs',
  },
  {
    id: 'fast',
    name: 'FAST NUCES',
    shortName: 'FAST (H-9)',
    cityId: 'islamabad',
    areaId: 'isb-fast',
    popularSpotsHint: 'I-8 Markaz & I-9 student chai spots',
  },
  {
    id: 'comsats',
    name: 'COMSATS University',
    shortName: 'COMSATS',
    cityId: 'islamabad',
    areaId: 'isb-comsats',
    popularSpotsHint: 'Park Road shawarmas & Chak Shahzad',
  },
  {
    id: 'bahria-air',
    name: 'Bahria & Air University',
    shortName: 'Bahria / Air',
    cityId: 'islamabad',
    areaId: 'isb-bahria-air',
    popularSpotsHint: 'F-8 & Beverly Center hangs',
  },
  {
    id: 'pindi-campus',
    name: 'Rawalpindi Student Hub',
    shortName: 'Commercial Mkt',
    cityId: 'rawalpindi',
    areaId: 'rwp-commercial-campus',
    popularSpotsHint: 'Commercial Market rolls & chaat',
  },
];

export const CUISINE_CATEGORIES: CuisineCategory[] = [
  { id: 'pakistani', name: 'Pakistani', slug: 'pakistani', iconName: 'restaurant-outline', searchQuery: 'Pakistani restaurants', isActive: true },
  { id: 'biryani', name: 'Biryani', slug: 'biryani', iconName: 'flame-outline', searchQuery: 'Biryani', isActive: true },
  { id: 'karahi', name: 'Karahi', slug: 'karahi', iconName: 'bonfire-outline', searchQuery: 'Karahi', isActive: true },
  { id: 'bbq', name: 'BBQ', slug: 'bbq', iconName: 'flame', searchQuery: 'BBQ tikka kabab', isActive: true },
  { id: 'burgers', name: 'Burgers', slug: 'burgers', iconName: 'fast-food-outline', searchQuery: 'Burgers', isActive: true },
  { id: 'pizza', name: 'Pizza', slug: 'pizza', iconName: 'pizza-outline', searchQuery: 'Pizza', isActive: true },
  { id: 'chinese', name: 'Chinese', slug: 'chinese', iconName: 'nutrition-outline', searchQuery: 'Chinese food', isActive: true },
  { id: 'turkish', name: 'Turkish', slug: 'turkish', iconName: ' skewer-outline', searchQuery: 'Turkish restaurant', isActive: true },
  { id: 'middle-eastern', name: 'Middle Eastern', slug: 'middle-eastern', iconName: 'earth-outline', searchQuery: 'Middle Eastern Arabic food', isActive: true },
  { id: 'cafes', name: 'Cafés', slug: 'cafes', iconName: 'cafe-outline', searchQuery: 'Cafes and coffee', isActive: true },
  { id: 'desserts', name: 'Desserts', slug: 'desserts', iconName: 'ice-cream-outline', searchQuery: 'Desserts mithai bakery', isActive: true },
  { id: 'breakfast', name: 'Breakfast & Brunch', slug: 'breakfast-brunch', iconName: 'sunny-outline', searchQuery: 'Halwa puri breakfast brunch', isActive: true },
  { id: 'street-food', name: 'Street Food', slug: 'street-food', iconName: 'storefront-outline', searchQuery: 'Street food chaat samosa', isActive: true },
];
