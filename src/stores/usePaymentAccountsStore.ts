import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PAYMENT_PROVIDERS, SavedPaymentAccount } from '@/types/paymentAccounts';

const PAYMENT_ACCOUNTS_STORAGE_KEY = 'khanascene.paymentAccounts.v1';

const INITIAL_DEFAULT_ACCOUNTS: SavedPaymentAccount[] = [
  {
    id: 'default-easypaisa',
    provider: 'easypaisa',
    title: 'Self (Easypaisa)',
    accountNumber: '0300-1234567',
    isDefault: true,
  },
  {
    id: 'default-sadapay',
    provider: 'sadapay',
    title: 'Self (SadaPay)',
    accountNumber: '@foodie',
    isDefault: false,
  },
];

interface PaymentAccountsState {
  accounts: SavedPaymentAccount[];
  isHydrated: boolean;
  hydrateAccounts: () => Promise<void>;
  addAccount: (account: Omit<SavedPaymentAccount, 'id'>) => Promise<SavedPaymentAccount>;
  updateAccount: (id: string, updates: Partial<Omit<SavedPaymentAccount, 'id'>>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setDefaultAccount: (id: string) => Promise<void>;
  getDefaultAccount: () => SavedPaymentAccount | null;
  formatAccountForTransfer: (account: SavedPaymentAccount | null) => string;
}

export const usePaymentAccountsStore = create<PaymentAccountsState>((set, get) => ({
  accounts: INITIAL_DEFAULT_ACCOUNTS,
  isHydrated: false,

  hydrateAccounts: async () => {
    try {
      const raw = await AsyncStorage.getItem(PAYMENT_ACCOUNTS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ accounts: parsed, isHydrated: true });
          return;
        }
      }
      set({ accounts: INITIAL_DEFAULT_ACCOUNTS, isHydrated: true });
    } catch {
      set({ accounts: INITIAL_DEFAULT_ACCOUNTS, isHydrated: true });
    }
  },

  addAccount: async (accountInput) => {
    const newAccount: SavedPaymentAccount = {
      ...accountInput,
      id: `acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isDefault: accountInput.isDefault ?? get().accounts.length === 0,
    };

    let updatedList = [...get().accounts];
    if (newAccount.isDefault) {
      updatedList = updatedList.map((a) => ({ ...a, isDefault: false }));
    }
    updatedList.push(newAccount);

    set({ accounts: updatedList });
    try {
      await AsyncStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}
    return newAccount;
  },

  updateAccount: async (id, updates) => {
    let updatedList = get().accounts.map((a) => (a.id === id ? { ...a, ...updates } : a));
    if (updates.isDefault) {
      updatedList = updatedList.map((a) => (a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }));
    }
    set({ accounts: updatedList });
    try {
      await AsyncStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}
  },

  deleteAccount: async (id) => {
    const remaining = get().accounts.filter((a) => a.id !== id);
    if (remaining.length > 0 && !remaining.some((a) => a.isDefault)) {
      remaining[0].isDefault = true;
    }
    set({ accounts: remaining });
    try {
      await AsyncStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(remaining));
    } catch {}
  },

  setDefaultAccount: async (id) => {
    const updatedList = get().accounts.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    set({ accounts: updatedList });
    try {
      await AsyncStorage.setItem(PAYMENT_ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}
  },

  getDefaultAccount: () => {
    const list = get().accounts;
    return list.find((a) => a.isDefault) ?? (list.length > 0 ? list[0] : null);
  },

  formatAccountForTransfer: (account) => {
    if (!account) return '';
    const meta = PAYMENT_PROVIDERS[account.provider];
    const providerName = account.provider === 'bank' && account.bankName ? account.bankName : meta?.name ?? account.provider;
    let text = `${providerName}: ${account.accountNumber}`;
    if (account.title && account.title.trim().length > 0) {
      text += ` (${account.title.trim()})`;
    }
    return text;
  },
}));
