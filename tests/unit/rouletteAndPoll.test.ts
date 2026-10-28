import { Linking } from 'react-native';
import {
  buildGroupVoteMessage,
  buildRoulettePickMessage,
  openWhatsAppShare,
} from '@/utils/whatsapp';

describe('Khana Roulette & Group Vote WhatsApp Share', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('buildGroupVoteMessage', () => {
    it('formats a clear, structured voting poll message for WhatsApp groups', () => {
      const candidates = [
        {
          name: 'Monal Restaurant',
          neighbourhood: 'Pir Sohawa',
          rating: 4.6,
          cardDealSummary: 'Meezan Bank 20% Off',
          hasValet: true,
          heroDishes: ['Chicken Karahi', 'Cheese Naan'],
        },
        {
          name: 'Kabul Restaurant',
          neighbourhood: 'F-7 Markaz',
          rating: 4.4,
          cardDealSummary: null,
          hasValet: false,
          heroDishes: ['Kabuli Pulao'],
        },
      ];

      const message = buildGroupVoteMessage(candidates);

      expect(message).toContain('KhanaScene Group Scene Decider: Kahan khana hai?');
      expect(message).toContain('1️⃣ *Monal Restaurant* (Pir Sohawa)');
      expect(message).toContain('★ 4.6');
      expect(message).toContain('🚗 Valet Parking');
      expect(message).toContain('🏷️ Meezan Bank 20% Off');
      expect(message).toContain('Famous: Chicken Karahi, Cheese Naan');
      expect(message).toContain('2️⃣ *Kabul Restaurant* (F-7 Markaz)');
      expect(message).toContain('Reply with 1, 2, or 3 to vote!');
      expect(message).toContain('khanascene.pk');
    });

    it('handles candidates with missing optional fields gracefully', () => {
      const candidates = [
        {
          name: 'Simple Chai Dhabba',
          neighbourhood: null,
          rating: null,
          cardDealSummary: null,
          hasValet: null,
          heroDishes: null,
        },
      ];

      const message = buildGroupVoteMessage(candidates);
      expect(message).toContain('1️⃣ *Simple Chai Dhabba*');
      expect(message).toContain('Reply with 1, 2, or 3 to vote!');
    });
  });

  describe('buildRoulettePickMessage', () => {
    it('formats an announcement message with hero dish, card deal, and directions', () => {
      const pick = {
        name: 'Savour Foods',
        neighbourhood: 'Blue Area',
        rating: 4.5,
        heroDishes: ['Pulao Kabab', 'Zarda'],
        cardDealSummary: 'HBL 15% Off',
        hasValet: true,
        mapsUrl: 'https://maps.google.com/?cid=123',
      };

      const message = buildRoulettePickMessage(pick);

      expect(message).toContain('🎲 *KhanaScene Roulette: Settle the scene!*');
      expect(message).toContain('📍 *Savour Foods* (Blue Area)');
      expect(message).toContain('★ 4.5 / 5');
      expect(message).toContain('*Must-Try Dish:* Pulao Kabab, Zarda');
      expect(message).toContain('*Card Deal:* HBL 15% Off');
      expect(message).toContain('*Parking:* Valet Available 🚗');
      expect(message).toContain('Directions: https://maps.google.com/?cid=123');
      expect(message).toContain('Koi objection ya chalen? 🚗💨');
      expect(message).toContain('khanascene.pk');
    });
  });

  describe('openWhatsAppShare', () => {
    it('opens whatsapp:// scheme when available', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(true);
      (Linking.openURL as jest.Mock).mockResolvedValueOnce(true);

      const success = await openWhatsAppShare('Test Message');

      expect(success).toBe(true);
      expect(Linking.canOpenURL).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp://send?text=Test%20Message')
      );
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('whatsapp://send?text=Test%20Message')
      );
    });

    it('falls back to web WhatsApp if scheme cannot be opened', async () => {
      (Linking.canOpenURL as jest.Mock).mockResolvedValueOnce(false);
      (Linking.openURL as jest.Mock).mockResolvedValueOnce(true);

      const success = await openWhatsAppShare('Hello World');

      expect(success).toBe(true);
      expect(Linking.openURL).toHaveBeenCalledWith(
        expect.stringContaining('https://api.whatsapp.com/send?text=Hello%20World')
      );
    });
  });
});
