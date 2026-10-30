import {
  calculateQuickSplit,
  formatContriStatusWhatsAppMessage,
  formatFriendNudgeWhatsAppMessage,
} from '@/utils/billEstimator';

describe('Easy Bill Splitter & Contri Reminders', () => {
  it('calculates quick split evenly for friends', () => {
    const result = calculateQuickSplit(4800, 4);
    expect(result.totalPkr).toBe(4800);
    expect(result.splitCount).toBe(4);
    expect(result.perPersonPkr).toBe(1200);
  });

  it('rounds up per-person share to avoid under-collecting', () => {
    const result = calculateQuickSplit(5000, 3);
    expect(result.totalPkr).toBe(5000);
    expect(result.splitCount).toBe(3);
    expect(result.perPersonPkr).toBe(1667); // Math.ceil(5000/3)
  });

  it('formats personalized friend WhatsApp nudge', () => {
    const message = formatFriendNudgeWhatsAppMessage({
      friendName: 'Saad',
      dawatTitle: 'Cheezious Midnight Dawat',
      sharePkr: 1200,
      paymentAccountSummary: 'Easypaisa: 0300-1234567 (Ali Khan)',
    });

    expect(message).toContain('Salam Saad!');
    expect(message).toContain('Cheezious Midnight Dawat');
    expect(message).toContain('Rs 1,200');
    expect(message).toContain('Easypaisa: 0300-1234567 (Ali Khan)');
    expect(message).toContain('KhanaScene');
  });

  it('formats group contri status update report', () => {
    const message = formatContriStatusWhatsAppMessage({
      dawatTitle: 'F-7 Hot n Spicy',
      totalPkr: 3000,
      perPersonPkr: 1000,
      friends: [
        { name: 'Ali (Organizer)', isPaid: true, sharePkr: 1000 },
        { name: 'Hamza', isPaid: true, sharePkr: 1000 },
        { name: 'Usama', isPaid: false, sharePkr: 1000 },
      ],
      paymentAccountSummary: 'SadaPay: @alikhan',
    });

    expect(message).toContain('KhanaScene Contri Update — F-7 Hot n Spicy');
    expect(message).toContain('2/3 paid');
    expect(message).toContain('✅ *Ali (Organizer)* (Paid)');
    expect(message).toContain('⏳ *Usama* — Pending Rs 1,000');
    expect(message).toContain('SadaPay: @alikhan');
  });
});
