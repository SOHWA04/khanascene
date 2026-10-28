import {
  buildTableInquiryMessage,
  buildWhatsAppUrl,
  formatPakistanWhatsAppNumber,
} from '@/utils/whatsapp';

describe('WhatsApp Utilities', () => {
  describe('formatPakistanWhatsAppNumber', () => {
    it('normalizes mobile numbers starting with local 0', () => {
      expect(formatPakistanWhatsAppNumber('0300-1234567')).toBe('923001234567');
      expect(formatPakistanWhatsAppNumber('0345 9876543')).toBe('923459876543');
    });

    it('normalizes landline numbers in Islamabad/Rawalpindi', () => {
      expect(formatPakistanWhatsAppNumber('051-2650953')).toBe('92512650953');
      expect(formatPakistanWhatsAppNumber('(051) 111-222-333')).toBe('9251111222333');
    });

    it('preserves existing international prefix with or without +', () => {
      expect(formatPakistanWhatsAppNumber('+92 300 1234567')).toBe('923001234567');
      expect(formatPakistanWhatsAppNumber('923001234567')).toBe('923001234567');
    });

    it('handles 10-digit numbers missing leading zero', () => {
      expect(formatPakistanWhatsAppNumber('3001234567')).toBe('923001234567');
    });

    it('returns null for empty or invalid numbers', () => {
      expect(formatPakistanWhatsAppNumber('')).toBeNull();
      expect(formatPakistanWhatsAppNumber('abc')).toBeNull();
      expect(formatPakistanWhatsAppNumber('123')).toBeNull();
      expect(formatPakistanWhatsAppNumber(null)).toBeNull();
      expect(formatPakistanWhatsAppNumber(undefined)).toBeNull();
    });
  });

  describe('buildTableInquiryMessage', () => {
    it('formats message with restaurant name, party size, and KhanaScene attribution', () => {
      const msg = buildTableInquiryMessage({
        restaurantName: 'Monal Restaurant',
        partySize: 4,
        dateTime: 'Tonight at 8:30 PM',
        seatingPreference: 'Outdoor / Rooftop Terrace',
        notes: 'Need high chair',
      });

      expect(msg).toContain('Assalam-o-Alaikum!');
      expect(msg).toContain('KhanaScene');
      expect(msg).toContain('*Monal Restaurant*');
      expect(msg).toContain('4 people');
      expect(msg).toContain('Tonight at 8:30 PM');
      expect(msg).toContain('Outdoor / Rooftop Terrace');
      expect(msg).toContain('Need high chair');
      expect(msg).toContain('Shukriya!');
    });

    it('handles singular person properly', () => {
      const msg = buildTableInquiryMessage({
        restaurantName: 'Roasters Coffee House',
        partySize: 1,
        dateTime: 'Tomorrow at 1:00 PM',
      });

      expect(msg).toContain('1 person');
      expect(msg).toContain('Any available seating');
    });
  });

  describe('buildWhatsAppUrl', () => {
    it('returns a valid wa.me URL with encoded message', () => {
      const url = buildWhatsAppUrl('0300-1234567', 'Hello from KhanaScene');
      expect(url).toBe('https://wa.me/923001234567?text=Hello%20from%20KhanaScene');
    });

    it('returns null if phone number cannot be formatted', () => {
      const url = buildWhatsAppUrl('invalid', 'Hello');
      expect(url).toBeNull();
    });
  });
});
