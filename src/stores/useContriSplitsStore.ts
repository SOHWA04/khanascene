import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveContriSplit, ContriFriend, SavedPaymentAccount } from '@/types/paymentAccounts';
import { cancelContriReminder, scheduleContriReminder } from '@/services/notificationService';

const CONTRI_SPLITS_STORAGE_KEY = 'khanascene.contriSplits.v1';

interface CreateSplitParams {
  title: string;
  totalAmountPkr: number;
  splitCount: number;
  paymentAccount?: SavedPaymentAccount | null;
  friendNames?: string[];
}

interface ContriSplitsState {
  splits: ActiveContriSplit[];
  isHydrated: boolean;
  hydrateSplits: () => Promise<void>;
  createSplit: (params: CreateSplitParams) => Promise<ActiveContriSplit>;
  toggleFriendPaid: (splitId: string, friendId: string) => Promise<void>;
  updateFriendName: (splitId: string, friendId: string, name: string) => Promise<void>;
  scheduleReminderForSplit: (splitId: string, delayMinutes: number) => Promise<boolean>;
  cancelReminderForSplit: (splitId: string) => Promise<void>;
  deleteSplit: (splitId: string) => Promise<void>;
  getSplit: (splitId: string) => ActiveContriSplit | undefined;
}

export const useContriSplitsStore = create<ContriSplitsState>((set, get) => ({
  splits: [],
  isHydrated: false,

  hydrateSplits: async () => {
    try {
      const raw = await AsyncStorage.getItem(CONTRI_SPLITS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          set({ splits: parsed, isHydrated: true });
          return;
        }
      }
      set({ splits: [], isHydrated: true });
    } catch {
      set({ splits: [], isHydrated: true });
    }
  },

  createSplit: async (params) => {
    const { title, totalAmountPkr, splitCount, paymentAccount, friendNames = [] } = params;
    const perPerson = Math.ceil(totalAmountPkr / Math.max(1, splitCount));

    const friends: ContriFriend[] = Array.from({ length: splitCount }, (_, i) => {
      const name = friendNames[i] && friendNames[i].trim().length > 0
        ? friendNames[i].trim()
        : i === 0
        ? 'Me (Organizer)'
        : `Friend ${i + 1}`;
      return {
        id: `f-${Date.now()}-${i}`,
        name,
        sharePkr: perPerson,
        isPaid: i === 0, // Organizer is paid by default
        paidAt: i === 0 ? new Date().toISOString() : undefined,
      };
    });

    const paymentSummary = paymentAccount
      ? `${paymentAccount.provider.toUpperCase()}: ${paymentAccount.accountNumber}${
          paymentAccount.title ? ` (${paymentAccount.title})` : ''
        }`
      : undefined;

    const newSplit: ActiveContriSplit = {
      id: `split-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim().length > 0 ? title.trim() : 'Dawat Bill Split',
      totalAmountPkr,
      perPersonPkr: perPerson,
      splitCount,
      paymentAccountId: paymentAccount?.id,
      paymentAccountSummary: paymentSummary,
      friends,
      createdAt: new Date().toISOString(),
      isSettled: friends.every((f) => f.isPaid),
    };

    const updated = [newSplit, ...get().splits];
    set({ splits: updated });
    try {
      await AsyncStorage.setItem(CONTRI_SPLITS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    return newSplit;
  },

  toggleFriendPaid: async (splitId, friendId) => {
    const splits = get().splits.map((split) => {
      if (split.id !== splitId) return split;
      const updatedFriends = split.friends.map((f) => {
        if (f.id !== friendId) return f;
        const willBePaid = !f.isPaid;
        return {
          ...f,
          isPaid: willBePaid,
          paidAt: willBePaid ? new Date().toISOString() : undefined,
        };
      });
      const isSettled = updatedFriends.every((f) => f.isPaid);
      return {
        ...split,
        friends: updatedFriends,
        isSettled,
      };
    });

    set({ splits });
    try {
      await AsyncStorage.setItem(CONTRI_SPLITS_STORAGE_KEY, JSON.stringify(splits));
    } catch {}
  },

  updateFriendName: async (splitId, friendId, name) => {
    const splits = get().splits.map((split) => {
      if (split.id !== splitId) return split;
      return {
        ...split,
        friends: split.friends.map((f) => (f.id === friendId ? { ...f, name } : f)),
      };
    });

    set({ splits });
    try {
      await AsyncStorage.setItem(CONTRI_SPLITS_STORAGE_KEY, JSON.stringify(splits));
    } catch {}
  },

  scheduleReminderForSplit: async (splitId, delayMinutes) => {
    const split = get().getSplit(splitId);
    if (!split) return false;

    const pending = split.friends.filter((f) => !f.isPaid);
    if (pending.length === 0) return false;

    // Cancel old reminder if any
    if (split.reminderNotificationId) {
      await cancelContriReminder(split.reminderNotificationId);
    }

    const notifId = await scheduleContriReminder({
      splitId: split.id,
      dawatTitle: split.title,
      pendingFriendsCount: pending.length,
      perPersonPkr: split.perPersonPkr,
      delayMinutes,
    });

    if (notifId) {
      const scheduledDate = new Date(Date.now() + delayMinutes * 60 * 1000).toISOString();
      const splits = get().splits.map((s) =>
        s.id === splitId
          ? { ...s, reminderNotificationId: notifId, reminderScheduledFor: scheduledDate }
          : s
      );
      set({ splits });
      try {
        await AsyncStorage.setItem(CONTRI_SPLITS_STORAGE_KEY, JSON.stringify(splits));
      } catch {}
      return true;
    }
    return false;
  },

  cancelReminderForSplit: async (splitId) => {
    const split = get().getSplit(splitId);
    if (!split || !split.reminderNotificationId) return;

    await cancelContriReminder(split.reminderNotificationId);
    const splits = get().splits.map((s) =>
      s.id === splitId
        ? { ...s, reminderNotificationId: undefined, reminderScheduledFor: undefined }
        : s
    );
    set({ splits });
    try {
      await AsyncStorage.setItem(CONTRI_SPLITS_STORAGE_KEY, JSON.stringify(splits));
    } catch {}
  },

  deleteSplit: async (splitId) => {
    const split = get().getSplit(splitId);
    if (split?.reminderNotificationId) {
      await cancelContriReminder(split.reminderNotificationId);
    }
    const filtered = get().splits.filter((s) => s.id !== splitId);
    set({ splits: filtered });
    try {
      await AsyncStorage.setItem(CONTRI_SPLITS_STORAGE_KEY, JSON.stringify(filtered));
    } catch {}
  },

  getSplit: (splitId) => {
    return get().splits.find((s) => s.id === splitId);
  },
}));
