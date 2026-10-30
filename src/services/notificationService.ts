import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure foreground notification behavior safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch {
  // Graceful fallback on environments where handler cannot be registered
}

export interface ScheduleReminderOptions {
  splitId: string;
  dawatTitle: string;
  pendingFriendsCount: number;
  perPersonPkr: number;
  delayMinutes: number; // e.g. 60 for 1 hr, 180 for 3 hrs, 720 for 12 hrs
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') return true;
      if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
    }
    return true;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleContriReminder(
  options: ScheduleReminderOptions
): Promise<string | null> {
  const { dawatTitle, pendingFriendsCount, perPersonPkr, delayMinutes } = options;
  const title = `🔔 Contri Reminder: ${dawatTitle}`;
  const body = `${pendingFriendsCount} friend${pendingFriendsCount > 1 ? 's' : ''} still owe Rs ${perPersonPkr.toLocaleString('en-PK')} each! Tap to check & nudge them.`;

  if (Platform.OS === 'web') {
    // If running in browser and notification permission is granted, we can schedule a setTimeout
    // or trigger a browser notification
    const notificationId = `web-reminder-${Date.now()}`;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setTimeout(() => {
        try {
          new Notification(title, {
            body,
            icon: '/icon.png',
          });
        } catch {}
      }, Math.max(5000, delayMinutes * 60 * 1000));
    }
    return notificationId;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const seconds = Math.max(5, Math.round(delayMinutes * 60));

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: {
          splitId: options.splitId,
          type: 'CONTRI_REMINDER',
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
      },
    });

    return notificationId;
  } catch (err) {
    console.warn('Failed to schedule local notification with expo-notifications:', err);
    return null;
  }
}

export async function cancelContriReminder(notificationId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}
