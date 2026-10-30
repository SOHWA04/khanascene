import {
  calculateBillEstimate,
  formatBillSplitWhatsAppMessage,
} from '@/utils/billEstimator';

describe('Bill & Tax Estimator Utilities', () => {
  it('calculates subtotal, standard 16% GST and zero discount correctly', () => {
    const result = calculateBillEstimate({
      restaurantName: 'Asian Wok',
      items: [
        { id: '1', name: 'Kung Pao Chicken', pricePkr: 1800, quantity: 2 },
        { id: '2', name: 'Egg Fried Rice', pricePkr: 900, quantity: 1 },
      ],
      taxPercentage: 16,
      serviceChargePercentage: 0,
      splitCount: 1,
    });

    expect(result.subtotalPkr).toBe(4500); // (1800 * 2) + 900
    expect(result.discountAmountPkr).toBe(0);
    expect(result.discountedSubtotalPkr).toBe(4500);
    expect(result.taxAmountPkr).toBe(720); // 16% of 4500
    expect(result.serviceChargeAmountPkr).toBe(0);
    expect(result.totalPkr).toBe(5220); // 4500 + 720
    expect(result.perPersonPkr).toBe(5220);
  });

  it('applies bank card discount percentage with max cap', () => {
    const result = calculateBillEstimate({
      restaurantName: 'Tuscany Courtyard',
      items: [
        { id: '1', name: 'Steak', pricePkr: 4000, quantity: 3 }, // 12,000
      ],
      bankDiscountPercentage: 25, // 25% of 12,000 = 3,000
      maxDiscountPkr: 2500, // Capped at 2,500
      taxPercentage: 16,
      serviceChargePercentage: 5,
      splitCount: 4,
    });

    expect(result.subtotalPkr).toBe(12000);
    expect(result.discountAmountPkr).toBe(2500); // Capped at 2500
    expect(result.discountedSubtotalPkr).toBe(9500);
    expect(result.taxAmountPkr).toBe(1520); // 16% of 9500
    expect(result.serviceChargeAmountPkr).toBe(475); // 5% of 9500
    expect(result.totalPkr).toBe(11495); // 9500 + 1520 + 475
    expect(result.splitCount).toBe(4);
    expect(result.perPersonPkr).toBe(2874); // 11495 / 4 = 2873.75 -> 2874
  });

  it('handles custom amount input gracefully', () => {
    const result = calculateBillEstimate({
      restaurantName: 'Street 1 Cafe',
      items: [],
      customAmount: 3500,
      taxPercentage: 16,
      splitCount: 2,
    });

    expect(result.subtotalPkr).toBe(3500);
    expect(result.taxAmountPkr).toBe(560); // 16% of 3500
    expect(result.totalPkr).toBe(4060);
    expect(result.perPersonPkr).toBe(2030);
  });

  it('formats clean WhatsApp split message with bank discount', () => {
    const result = calculateBillEstimate({
      restaurantName: 'Monal Pir Sohawa',
      items: [{ id: '1', name: 'Buffet', pricePkr: 3200, quantity: 4 }],
      bankDiscountPercentage: 20,
      taxPercentage: 16,
      splitCount: 4,
    });

    const msg = formatBillSplitWhatsAppMessage('Monal Pir Sohawa', result, 'Meezan Bank');

    expect(msg).toContain('KhanaScene Dawat Bill Split');
    expect(msg).toContain('Monal Pir Sohawa');
    expect(msg).toContain('Food Subtotal');
    expect(msg).toContain('Meezan Bank 20%');
    expect(msg).toContain('Sales Tax (16% GST)');
    expect(msg).toContain('Total Estimated Bill');
    expect(msg).toContain('Split between 4 people');
    expect(msg).toContain('KhanaScene');
  });

  it('formats contri message with Nayapay / Sadapay handle', () => {
    const result = calculateBillEstimate({
      restaurantName: 'Cheezious F-7',
      items: [{ id: '1', name: 'Pizza', pricePkr: 2000, quantity: 2 }],
      bankDiscountPercentage: 15,
      taxPercentage: 16,
      splitCount: 4,
    });

    const msg = formatBillSplitWhatsAppMessage(
      'Cheezious F-7',
      result,
      'Meezan Bank',
      '03001234567 (Nayapay)'
    );

    expect(msg).toContain('Contri Alert');
    expect(msg).toContain('03001234567');
  });
});
