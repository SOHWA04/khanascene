import { Linking } from 'react-native';

export interface BillItem {
  id: string;
  name: string;
  pricePkr: number;
  quantity: number;
}

export interface BillEstimatorParams {
  restaurantName: string;
  items: BillItem[];
  customAmount?: number;
  bankDiscountPercentage?: number;
  bankName?: string;
  maxDiscountPkr?: number;
  taxPercentage?: number; // e.g. 16 for 16% ICT / PRA GST
  serviceChargePercentage?: number; // e.g. 5, 7.5, 10
  splitCount?: number; // number of diners
}

export interface BillEstimateResult {
  subtotalPkr: number;
  discountPercentage: number;
  discountAmountPkr: number;
  discountedSubtotalPkr: number;
  taxPercentage: number;
  taxAmountPkr: number;
  serviceChargePercentage: number;
  serviceChargeAmountPkr: number;
  totalPkr: number;
  splitCount: number;
  perPersonPkr: number;
  totalSavedPkr: number;
}

/**
 * Calculates a complete dining bill breakdown taking into account
 * food subtotal, bank card discount caps, Pakistani provincial/ICT sales tax (16% GST),
 * service charges, and per-person split.
 */
export function calculateBillEstimate(params: BillEstimatorParams): BillEstimateResult {
  const itemsTotal = params.items.reduce(
    (acc, item) => acc + Math.max(0, item.pricePkr) * Math.max(0, item.quantity),
    0
  );
  const customTotal = Math.max(0, params.customAmount ?? 0);
  const subtotalPkr = Math.round(itemsTotal + customTotal);

  // Bank discount calculation
  const discountPercentage = Math.max(0, Math.min(100, params.bankDiscountPercentage ?? 0));
  let discountAmountPkr = Math.round(subtotalPkr * (discountPercentage / 100));

  if (params.maxDiscountPkr && params.maxDiscountPkr > 0) {
    discountAmountPkr = Math.min(discountAmountPkr, params.maxDiscountPkr);
  }

  const discountedSubtotalPkr = Math.max(0, subtotalPkr - discountAmountPkr);

  // In Pakistan, restaurant tax (ICT GST in Islamabad or PRA GST in Punjab) is typically applied
  // on the food bill after discount, or on the gross. Standard consumer practice calculates on the net.
  const taxPercentage = Math.max(0, params.taxPercentage ?? 16);
  const taxAmountPkr = Math.round(discountedSubtotalPkr * (taxPercentage / 100));

  // Service charge (usually 5% to 10% where applicable)
  const serviceChargePercentage = Math.max(0, params.serviceChargePercentage ?? 0);
  const serviceChargeAmountPkr = Math.round(
    discountedSubtotalPkr * (serviceChargePercentage / 100)
  );

  const totalPkr = Math.round(
    discountedSubtotalPkr + taxAmountPkr + serviceChargeAmountPkr
  );

  const splitCount = Math.max(1, Math.round(params.splitCount ?? 1));
  const perPersonPkr = Math.round(totalPkr / splitCount);

  return {
    subtotalPkr,
    discountPercentage,
    discountAmountPkr,
    discountedSubtotalPkr,
    taxPercentage,
    taxAmountPkr,
    serviceChargePercentage,
    serviceChargeAmountPkr,
    totalPkr,
    splitCount,
    perPersonPkr,
    totalSavedPkr: discountAmountPkr,
  };
}

/**
 * Formats a clean, readable bill breakdown ready to share in a WhatsApp group.
 */
export function formatBillSplitWhatsAppMessage(
  restaurantName: string,
  result: BillEstimateResult,
  bankName?: string,
  paymentAccountNote?: string
): string {
  const {
    subtotalPkr,
    discountPercentage,
    discountAmountPkr,
    taxPercentage,
    taxAmountPkr,
    serviceChargePercentage,
    serviceChargeAmountPkr,
    totalPkr,
    splitCount,
    perPersonPkr,
  } = result;

  let msg = `🍽️ *KhanaScene Dawat Bill Split — ${restaurantName.trim()}*\n`;
  msg += `---------------------------------\n`;
  msg += `• *Food Subtotal:* Rs ${subtotalPkr.toLocaleString('en-PK')}\n`;

  if (discountAmountPkr > 0) {
    const bankLabel = bankName ? ` (${bankName.trim()} ${discountPercentage}%)` : ` (${discountPercentage}%)`;
    msg += `• *Card Discount${bankLabel}:* -Rs ${discountAmountPkr.toLocaleString('en-PK')}\n`;
  }

  if (taxAmountPkr > 0) {
    msg += `• *Sales Tax (${taxPercentage}% GST):* +Rs ${taxAmountPkr.toLocaleString('en-PK')}\n`;
  }

  if (serviceChargeAmountPkr > 0) {
    msg += `• *Service Charge (${serviceChargePercentage}%):* +Rs ${serviceChargeAmountPkr.toLocaleString('en-PK')}\n`;
  }

  msg += `---------------------------------\n`;
  msg += `💰 *Total Estimated Bill:* Rs ${totalPkr.toLocaleString('en-PK')}\n`;

  if (splitCount > 1) {
    msg += `👥 *Split between ${splitCount} people:* *Rs ${perPersonPkr.toLocaleString('en-PK')} / person*\n\n`;
    msg += `💸 *Contri Alert:* ${splitCount} log hain, sab apna hissa send kardo! 🙏\n`;
  }

  if (paymentAccountNote && paymentAccountNote.trim().length > 0) {
    msg += `📲 *Transfer to:* ${paymentAccountNote.trim()} (Nayapay/Sadapay/EasyPaisa)\n`;
  }

  msg += `\n_Calculated via KhanaScene (Khana kahan? Scene yahan.)_`;

  return msg;
}

/**
 * Opens WhatsApp with the bill split message pre-filled.
 */
export async function shareBillSplitOnWhatsApp(
  restaurantName: string,
  result: BillEstimateResult,
  bankName?: string,
  paymentAccountNote?: string
): Promise<boolean> {
  const text = formatBillSplitWhatsAppMessage(restaurantName, result, bankName, paymentAccountNote);
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch (err) {
    console.error('Failed to open WhatsApp for bill split:', err);
    return false;
  }
}

/**
 * Calculates a quick per-person split from just amount and friend count.
 */
export function calculateQuickSplit(totalAmountPkr: number, splitCount: number) {
  const safeCount = Math.max(1, splitCount);
  const perPersonPkr = Math.ceil(totalAmountPkr / safeCount);
  return {
    totalPkr: totalAmountPkr,
    splitCount: safeCount,
    perPersonPkr,
  };
}

/**
 * Formats a personalized WhatsApp nudge / reminder for a specific pending friend.
 */
export function formatFriendNudgeWhatsAppMessage(params: {
  friendName: string;
  dawatTitle: string;
  sharePkr: number;
  paymentAccountSummary?: string;
}): string {
  const { friendName, dawatTitle, sharePkr, paymentAccountSummary } = params;
  let msg = `Salam ${friendName.trim()}! 👋\n`;
  msg += `*KhanaScene Contri Reminder* for *${dawatTitle.trim()}*:\n\n`;
  msg += `💸 Your share: *Rs ${sharePkr.toLocaleString('en-PK')}*\n`;

  if (paymentAccountSummary && paymentAccountSummary.trim().length > 0) {
    msg += `📲 *Transfer to:* ${paymentAccountSummary.trim()}\n`;
  }

  msg += `\nShabash jaldi send kardo taake bill settle ho jaye! 🙏🍕\n`;
  msg += `_Sent via KhanaScene_`;
  return msg;
}

/**
 * Formats the complete group contri status report for WhatsApp.
 */
export function formatContriStatusWhatsAppMessage(params: {
  dawatTitle: string;
  totalPkr: number;
  perPersonPkr: number;
  friends: { name: string; isPaid: boolean; sharePkr: number }[];
  paymentAccountSummary?: string;
}): string {
  const { dawatTitle, totalPkr, perPersonPkr, friends, paymentAccountSummary } = params;
  const paidCount = friends.filter((f) => f.isPaid).length;
  const totalFriends = friends.length;

  let msg = `📊 *KhanaScene Contri Update — ${dawatTitle.trim()}*\n`;
  msg += `---------------------------------\n`;
  msg += `💰 Total Bill: Rs ${totalPkr.toLocaleString('en-PK')} (${totalFriends} log, Rs ${perPersonPkr.toLocaleString('en-PK')}/person)\n`;
  msg += `Status: ${paidCount}/${totalFriends} paid\n\n`;

  friends.forEach((f) => {
    if (f.isPaid) {
      msg += `✅ *${f.name}* (Paid)\n`;
    } else {
      msg += `⏳ *${f.name}* — Pending Rs ${f.sharePkr.toLocaleString('en-PK')}\n`;
    }
  });

  if (paymentAccountSummary && paymentAccountSummary.trim().length > 0) {
    msg += `\n📲 *Transfer to:* ${paymentAccountSummary.trim()}\n`;
  }

  msg += `\n_Khana kahan? Scene yahan._`;
  return msg;
}

/**
 * Opens WhatsApp with a personalized friend nudge message.
 */
export async function shareFriendNudgeOnWhatsApp(
  params: {
    friendName: string;
    dawatTitle: string;
    sharePkr: number;
    paymentAccountSummary?: string;
    phoneNumber?: string;
  }
): Promise<boolean> {
  const text = formatFriendNudgeWhatsAppMessage(params);
  const phoneParam = params.phoneNumber ? `phone=${encodeURIComponent(params.phoneNumber)}&` : '';
  const url = `https://wa.me/?${phoneParam}text=${encodeURIComponent(text)}`;

  try {
    await Linking.openURL(url);
    return true;
  } catch (err) {
    console.error('Failed to open WhatsApp for friend nudge:', err);
    return false;
  }
}

