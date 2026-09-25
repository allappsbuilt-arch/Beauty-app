import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Daily routine reminders as local notifications, scheduled on the device
// from the times saved in the user's preferences (reminders.morning/evening).
// Web can't schedule local notifications, so everything here is a no-op there.

export const remindersSupported = Platform.OS !== 'web';
export const REMINDER_DEFAULTS = { morning: '07:30', evening: '22:00' };

const CHANNEL_ID = 'routine-reminders';
const SLOTS = {
  morning: {
    id: 'routine-reminder-morning',
    content: {
      title: 'Time for your AM routine ☀️',
      body: 'Your morning skincare steps are ready — it only takes a few minutes.',
      data: { routineTitle: 'AM Routine' },
    },
  },
  evening: {
    id: 'routine-reminder-evening',
    content: {
      title: 'Time for your PM routine 🌙',
      body: 'Wind down with your evening skincare routine.',
      data: { routineTitle: 'PM Routine' },
    },
  },
};

if (remindersSupported) {
  // Show reminders even while the app is open.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
  });
}

// "06:45" → { hour: 6, minute: 45 }
export function parseTime(hhmm) {
  const [hour, minute] = String(hhmm).split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  return { hour, minute };
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Routine reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });
}

async function hasPermission(ask) {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!ask || !current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function cancelReminders() {
  if (!remindersSupported) return;
  await Promise.all(
    Object.values(SLOTS).map(({ id }) => Notifications.cancelScheduledNotificationAsync(id).catch(() => {}))
  );
}

// Replaces the scheduled reminders. `enabled` is false when the user muted
// notifications or turned routine notifications off. `ask` allows prompting
// for permission (only in response to a user action).
// Returns 'scheduled' | 'disabled' | 'denied' | 'unsupported'.
export async function scheduleReminders({ reminders, enabled = true, ask = false }) {
  if (!remindersSupported) return 'unsupported';
  await ensureChannel();
  await cancelReminders();
  if (!enabled) return 'disabled';
  if (!(await hasPermission(ask))) return 'denied';

  for (const [slot, { id, content }] of Object.entries(SLOTS)) {
    const time = parseTime(reminders?.[slot] ?? REMINDER_DEFAULTS[slot]);
    if (!time) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: id,
      content: { ...content, sound: 'default' },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: time.hour,
        minute: time.minute,
        channelId: CHANNEL_ID,
      },
    });
  }
  return 'scheduled';
}

// Loads the saved times and notification settings from the backend, then
// schedules accordingly.
export async function syncRemindersFromServer(request, { ask = false } = {}) {
  if (!remindersSupported) return 'unsupported';
  const [{ preferences }, notif] = await Promise.all([
    request('/api/preferences'),
    request('/api/settings/notifications'),
  ]);
  const enabled = !notif?.muteAll && notif?.categories?.routine !== false;
  return scheduleReminders({ reminders: preferences?.reminders, enabled, ask });
}

// What the user should be told after saving, or null if nothing to say.
export function reminderStatusMessage(status) {
  if (status === 'denied') return 'Your reminder time is saved, but notifications are turned off for MyFace AI. Allow them in your phone settings to get reminded.';
  if (status === 'disabled') return 'Your reminder time is saved. Routine notifications are currently off — turn them on in Notification settings to be reminded.';
  return null;
}
