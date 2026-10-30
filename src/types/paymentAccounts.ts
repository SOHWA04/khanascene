export type PaymentProviderType =
  | 'easypaisa'
  | 'jazzcash'
  | 'nayapay'
  | 'sadapay'
  | 'bank'
  | 'raast';

export interface SavedPaymentAccount {
  id: string;
  provider: PaymentProviderType;
  title: string;
  accountNumber: string;
  bankName?: string;
  isDefault?: boolean;
}

export interface ContriFriend {
  id: string;
  name: string;
  sharePkr: number;
  isPaid: boolean;
  paidAt?: string;
  phoneNumber?: string;
}

export interface ActiveContriSplit {
  id: string;
  title: string;
  totalAmountPkr: number;
  perPersonPkr: number;
  splitCount: number;
  paymentAccountId?: string;
  paymentAccountSummary?: string;
  friends: ContriFriend[];
  createdAt: string;
  isSettled: boolean;
  reminderScheduledFor?: string;
  reminderNotificationId?: string;
}

export interface PaymentProviderMeta {
  type: PaymentProviderType;
  name: string;
  shortName: string;
  color: string;
  badgeBg: string;
  badgeColor: string;
  icon: string;
  placeholder: string;
  accountLabel: string;
}

export const PAYMENT_PROVIDERS: Record<PaymentProviderType, PaymentProviderMeta> = {
  easypaisa: {
    type: 'easypaisa',
    name: 'Easypaisa',
    shortName: 'Easypaisa',
    color: '#00A859',
    badgeBg: '#E6F8EF',
    badgeColor: '#008744',
    icon: 'cash-outline',
    placeholder: '0300-1234567',
    accountLabel: 'Mobile / Account Number',
  },
  jazzcash: {
    type: 'jazzcash',
    name: 'JazzCash',
    shortName: 'JazzCash',
    color: '#ED1C24',
    badgeBg: '#FEECEE',
    badgeColor: '#C41219',
    icon: 'wallet-outline',
    placeholder: '0301-1234567',
    accountLabel: 'Mobile / Account Number',
  },
  nayapay: {
    type: 'nayapay',
    name: 'NayaPay',
    shortName: 'NayaPay',
    color: '#FF6600',
    badgeBg: '#FFF2E6',
    badgeColor: '#CC5200',
    icon: 'card-outline',
    placeholder: '@nayapayId or 0300...',
    accountLabel: 'NayaPay ID or Phone',
  },
  sadapay: {
    type: 'sadapay',
    name: 'SadaPay',
    shortName: 'SadaPay',
    color: '#1FD1A5',
    badgeBg: '#E9FAF5',
    badgeColor: '#128F70',
    icon: 'flash-outline',
    placeholder: '@sadatag or 0300...',
    accountLabel: 'SadaTag or Phone',
  },
  bank: {
    type: 'bank',
    name: 'Bank Account (IBAN / Account)',
    shortName: 'Bank',
    color: '#1E293B',
    badgeBg: '#F1F5F9',
    badgeColor: '#0F172A',
    icon: 'business-outline',
    placeholder: 'PK36 MEZN 0001 2345 6789 01',
    accountLabel: 'Account Number or IBAN',
  },
  raast: {
    type: 'raast',
    name: 'Raast ID (Instant Transfer)',
    shortName: 'Raast',
    color: '#0284C7',
    badgeBg: '#E0F2FE',
    badgeColor: '#0369A1',
    icon: 'send-outline',
    placeholder: '03001234567',
    accountLabel: 'Registered Raast Mobile Number',
  },
};
