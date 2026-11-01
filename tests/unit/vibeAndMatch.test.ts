import {
  filterAndSortRestaurants,
} from '@/repositories/restaurantRepository';
import { DEV_RESTAURANT_FIXTURES } from '@/services/google-places/devFixtures';
import {
  buildRoulettePickMessage,
  buildStorySceneShareMessage,
} from '@/utils/whatsapp';
import {
  formatFriendNudgeWhatsAppMessage,
} from '@/utils/billEstimator';

describe('Gen Z & College Student Features', () => {
  describe('Vibe Checks & Campus Hub Filtering', () => {
    it('filters restaurants by Broke Mode (< Rs. 600)', () => {
      const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
        query: '',
        cityId: 'islamabad',
        areaId: null,
        cuisineSlug: null,
        minRating: null,
        minReviewCount: null,
        budgetOnly: false,
        openNowOnly: false,
        familyFriendlyOnly: false,
        nearMeOnly: false,
        vibe: 'broke',
        sortBy: 'relevance',
      });

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.googleData.name);
      // Cheezious F-11 and Quetta Tea should match broke mode
      expect(names.some((n) => n.includes('Cheezious') || n.includes('Quetta'))).toBe(true);
    });

    it('filters restaurants by Late Night 2 AM Chai scene', () => {
      const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
        query: '',
        cityId: 'islamabad',
        areaId: null,
        cuisineSlug: null,
        minRating: null,
        minReviewCount: null,
        budgetOnly: false,
        openNowOnly: false,
        familyFriendlyOnly: false,
        nearMeOnly: false,
        vibe: 'latenight',
        sortBy: 'relevance',
      });

      expect(results.length).toBeGreaterThan(0);
      const names = results.map((r) => r.googleData.name);
      expect(names.some((n) => n.includes('Quetta Karak Tea') || n.includes('Cheezious'))).toBe(true);
    });

    it('filters restaurants by Campus Hub (NUST)', () => {
      const results = filterAndSortRestaurants(DEV_RESTAURANT_FIXTURES, {
        query: '',
        cityId: 'islamabad',
        areaId: null,
        cuisineSlug: null,
        minRating: null,
        minReviewCount: null,
        budgetOnly: false,
        openNowOnly: false,
        familyFriendlyOnly: false,
        nearMeOnly: false,
        campusId: 'nust',
        sortBy: 'relevance',
      });

      expect(results.length).toBeGreaterThan(0);
      // F-11 Markaz (Cheezious) is in NUST gate zone
      expect(results.some((r) => r.googleData.neighbourhood === 'F-11 Markaz')).toBe(true);
    });
  });

  describe('Party Stakes & Dares for Roulette', () => {
    it('includes group dare in WhatsApp announcement message when selected', () => {
      const msg = buildRoulettePickMessage({
        name: 'Cheezious F-11 Markaz',
        neighbourhood: 'F-11 Markaz',
        rating: 4.6,
        heroDishes: ['Crown Crust Pizza', 'Loaded Fries'],
        dare: 'Loser buys the chai / karak tea ☕',
      });

      expect(msg).toContain('KhanaScene Roulette');
      expect(msg).toContain('Cheezious F-11 Markaz');
      expect(msg).toContain('GROUP DARE / STAKE:');
      expect(msg).toContain('Loser buys the chai / karak tea ☕');
    });
  });

  describe('Story Scene Card Formatter', () => {
    it('creates formatted aesthetic card for Instagram / WhatsApp stories', () => {
      const story = buildStorySceneShareMessage({
        restaurantName: 'Quetta Karak Tea & Cafe',
        neighbourhood: 'I-8 Markaz',
        vibeText: 'Late Night 2 AM Scene 🌙',
        heroDish: 'Karak Doodh Patti & Cheese Paratha',
        organizerOrFriends: 'Saad, Hamza & Fatima',
        dare: 'Quietest friend takes group photo dump 📸',
      });

      expect(story).toContain('𝗧𝗢𝗡𝗜𝗚𝗛𝗧\'𝗦 𝗦𝗖𝗘𝗡𝗘');
      expect(story).toContain('Quetta Karak Tea & Cafe');
      expect(story).toContain('I-8 Markaz');
      expect(story).toContain('Late Night 2 AM Scene 🌙');
      expect(story).toContain('Saad, Hamza & Fatima');
      expect(story).toContain('Quietest friend takes group photo dump');
      expect(story).toContain('khanascene.netlify.app');
    });
  });

  describe('Meme-Powered Bill Splitter Nudges', () => {
    it('formats meme tone with playful banter', () => {
      const msg = formatFriendNudgeWhatsAppMessage({
        friendName: 'Hamza',
        dawatTitle: 'Cheezious F-11',
        sharePkr: 550,
        paymentAccountSummary: 'Easypaisa 03001234567 (Ali Khan)',
        tone: 'meme',
      });

      expect(msg).toContain('Oye Hamza! 💀');
      expect(msg).toContain('Rs 550');
      expect(msg).toContain('warna dosti khatam samjho 😂');
      expect(msg).toContain('Easypaisa 03001234567');
      expect(msg).toContain('screenshot group me daal de');
    });

    it('formats hostel emergency tone', () => {
      const msg = formatFriendNudgeWhatsAppMessage({
        friendName: 'Saad',
        dawatTitle: 'Hostel Biryani Night',
        sharePkr: 420,
        paymentAccountSummary: 'SadaPay 03211234567',
        tone: 'hostel',
      });

      expect(msg).toContain('Aray Saad bhai! 🚨');
      expect(msg).toContain('Hostel ka budget khatam');
      expect(msg).toContain('canteen wale ne bahar rok lia hai');
      expect(msg).toContain('Rs 420');
      expect(msg).toContain('SadaPay 03211234567');
    });

    it('formats sarcastic tone', () => {
      const msg = formatFriendNudgeWhatsAppMessage({
        friendName: 'Bilal',
        dawatTitle: 'Kallisto Phase 4',
        sharePkr: 1200,
        tone: 'sarcastic',
      });

      expect(msg).toContain('Wah Bilal sahab wah! 👑');
      expect(msg).toContain('Rs 1,200');
      expect(msg).toContain('internet doob gaya?');
    });

    it('defaults to polite tone when no tone specified', () => {
      const msg = formatFriendNudgeWhatsAppMessage({
        friendName: 'Ayesha',
        dawatTitle: 'Chaaye Khana',
        sharePkr: 750,
      });

      expect(msg).toContain('Salam Ayesha! 👋');
      expect(msg).toContain('Rs 750');
      expect(msg).toContain('Shabash jaldi send kardo');
    });
  });
});
