import { Linking } from 'react-native';

/**
 * Normalizes a Pakistani phone number (mobile or landline) into international WhatsApp format (e.g. '923001234567').
 * Returns null if the number cannot be parsed into a valid telephone number.
 */
export function formatPakistanWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;

  // Remove all non-digit characters except leading '+'
  const cleaned = phone.trim().replace(/[^\d+]/g, '');
  if (!cleaned) return null;

  let digitsOnly = cleaned.replace(/^\+/, '');

  // Handle local Pakistani numbers starting with '0' (e.g., 03001234567 or 0512650953)
  if (digitsOnly.startsWith('0')) {
    digitsOnly = `92${digitsOnly.slice(1)}`;
  } else if (!digitsOnly.startsWith('92')) {
    // If user provided a 10-digit number without leading 0 (e.g. 3001234567)
    if (digitsOnly.length === 10) {
      digitsOnly = `92${digitsOnly}`;
    }
  }

  // A valid Pakistani number with country code should typically have 11 to 13 digits (92 + 9 or 10 digits)
  if (digitsOnly.length < 10 || digitsOnly.length > 14) {
    return null;
  }

  return digitsOnly;
}

export interface TableInquiryParams {
  restaurantName: string;
  partySize: number | string;
  dateTime: string;
  seatingPreference?: string;
  notes?: string;
}

/**
 * Constructs a polite, pre-formatted booking inquiry message that includes KhanaScene attribution
 * so restaurant managers recognize traffic coming from the platform.
 */
export function buildTableInquiryMessage(params: TableInquiryParams): string {
  const {
    restaurantName,
    partySize,
    dateTime,
    seatingPreference = 'Any available seating',
    notes,
  } = params;

  let msg = `Assalam-o-Alaikum! I'm reaching out via KhanaScene to check table availability at *${restaurantName.trim()}*.\n\n`;
  msg += `• *Guests:* ${partySize} ${Number(partySize) === 1 ? 'person' : 'people'}\n`;
  msg += `• *Date & Time:* ${dateTime.trim()}\n`;
  msg += `• *Seating:* ${seatingPreference.trim()}\n`;

  if (notes && notes.trim().length > 0) {
    msg += `• *Notes:* ${notes.trim()}\n`;
  }

  msg += `\nCould you please confirm if a table is available? Shukriya!`;

  return msg;
}

/**
 * Builds the deep-link URL to open WhatsApp with the pre-filled inquiry.
 */
export function buildWhatsAppUrl(rawPhone: string, message: string): string | null {
  const normalizedPhone = formatPakistanWhatsAppNumber(rawPhone);
  if (!normalizedPhone) return null;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Opens the WhatsApp application directly on the device with the inquiry message pre-filled.
 */
export async function openWhatsAppTableInquiry(
  rawPhone: string,
  params: TableInquiryParams
): Promise<boolean> {
  const message = buildTableInquiryMessage(params);
  const url = buildWhatsAppUrl(rawPhone, message);

  if (!url) {
    return false;
  }

  try {
    await Linking.openURL(url);
    return true;
  } catch (err) {
    console.error('Failed to open WhatsApp URL:', err);
    return false;
  }
}

export interface GroupVoteRestaurantOption {
  name: string;
  neighbourhood?: string | null;
  rating?: number | null;
  cardDealSummary?: string | null;
  hasValet?: boolean | null;
  heroDishes?: string[] | null;
}

/**
 * Builds a friendly group voting message for WhatsApp so friends can vote between shortlisted restaurants.
 */
export function buildGroupVoteMessage(restaurants: GroupVoteRestaurantOption[]): string {
  let msg = `🗳️ *KhanaScene Group Scene Decider: Kahan khana hai?*\n\n`;
  msg += `Vote karo aur scene set karo:\n\n`;

  const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

  restaurants.forEach((r, idx) => {
    const num = numberEmojis[idx] || `${idx + 1}.`;
    msg += `${num} *${r.name.trim()}*`;
    if (r.neighbourhood) {
      msg += ` (${r.neighbourhood.trim()})`;
    }
    msg += `\n`;

    const highlights: string[] = [];
    if (r.rating != null) {
      highlights.push(`★ ${r.rating.toFixed(1)}`);
    }
    if (r.hasValet) {
      highlights.push(`🚗 Valet Parking`);
    }
    if (r.cardDealSummary) {
      highlights.push(`🏷️ ${r.cardDealSummary}`);
    }
    if (r.heroDishes && r.heroDishes.length > 0) {
      highlights.push(`Famous: ${r.heroDishes.slice(0, 2).join(', ')}`);
    }

    if (highlights.length > 0) {
      msg += `   ${highlights.join(' • ')}\n`;
    }
    msg += `\n`;
  });

  msg += `Reply with 1, 2, or 3 to vote! 🍽️\n`;
  msg += `_Shortlisted via KhanaScene (khanascene.pk)_`;

  return msg;
}

export interface RoulettePickDetails {
  name: string;
  neighbourhood?: string | null;
  rating?: number | null;
  heroDishes?: string[] | null;
  cardDealSummary?: string | null;
  hasValet?: boolean | null;
  mapsUrl?: string | null;
}

/**
 * Builds an announcement message when Khana Roulette picks a dining spot.
 */
export function buildRoulettePickMessage(pick: RoulettePickDetails): string {
  let msg = `🎲 *KhanaScene Roulette: Settle the scene!*\n\n`;
  msg += `The wheel decided our dining spot tonight:\n`;
  msg += `📍 *${pick.name.trim()}*`;
  if (pick.neighbourhood) {
    msg += ` (${pick.neighbourhood.trim()})`;
  }
  msg += `\n\n`;

  if (pick.rating != null) {
    msg += `• *Rating:* ★ ${pick.rating.toFixed(1)} / 5\n`;
  }
  if (pick.heroDishes && pick.heroDishes.length > 0) {
    msg += `• *Must-Try Dish:* ${pick.heroDishes.join(', ')}\n`;
  }
  if (pick.cardDealSummary) {
    msg += `• *Card Deal:* ${pick.cardDealSummary}\n`;
  }
  if (pick.hasValet) {
    msg += `• *Parking:* Valet Available 🚗\n`;
  }
  if (pick.mapsUrl) {
    msg += `\nDirections: ${pick.mapsUrl}\n`;
  }

  msg += `\nKoi objection ya chalen? 🚗💨\n`;
  msg += `_Spun on KhanaScene (khanascene.pk)_`;

  return msg;
}

/**
 * Opens WhatsApp group/contact picker to forward a text message.
 */
export async function openWhatsAppShare(message: string): Promise<boolean> {
  const customScheme = `whatsapp://send?text=${encodeURIComponent(message)}`;
  const webFallback = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

  try {
    const canOpen = await Linking.canOpenURL(customScheme);
    if (canOpen) {
      await Linking.openURL(customScheme);
      return true;
    }
    await Linking.openURL(webFallback);
    return true;
  } catch (err) {
    console.error('Failed to open WhatsApp share:', err);
    try {
      await Linking.openURL(webFallback);
      return true;
    } catch {
      return false;
    }
  }
}
