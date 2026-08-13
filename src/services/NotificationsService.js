import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const GRANTED = 'granted';
let responseSubscription;

export const NotificationsService = {
  init: async (reminders) => {
    if (!(await NotificationsService.permission())) return;

    NotificationsService.listen();
    await NotificationsService.dismissLastResponse();
    await NotificationsService.reminders(reminders, { skipPermission: true });
  },

  permission: async () => {
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const permission = await Notifications.getPermissionsAsync();
    if (permission.status !== GRANTED) {
      const requestPermission = await Notifications.requestPermissionsAsync();
      if (requestPermission.status !== GRANTED) return false;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: false }),
    });

    return true;
  },

  listen: () => {
    if (responseSubscription) return;

    responseSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      await NotificationsService.dismissResponse(response);
    });
  },

  dismissLastResponse: async () => {
    const response = await Notifications.getLastNotificationResponseAsync();
    if (!response) return;

    await NotificationsService.dismissResponse(response);
  },

  dismissResponse: async (response) => {
    const identifier = response?.notification?.request?.identifier;
    if (!identifier) return;

    try {
      await Notifications.dismissNotificationAsync(identifier);
    } catch {
      // The notification may already be gone from the tray.
    }

    try {
      await Notifications.clearLastNotificationResponseAsync();
    } catch {
      // Older platforms may not expose the response cache API.
    }
  },

  reminders: async ([backup = 1] = [], { skipPermission = false } = {}) => {
    if (!skipPermission && !(await NotificationsService.permission())) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (backup) {
      await Notifications.scheduleNotificationAsync({
        content: { title: L10N.REMINDER_BACKUP, body: L10N.REMINDER_BACKUP_CAPTION, sound: true },
        trigger: {
          channelId: 'default',
          hour: 8,
          minute: 0,
          weekday: 7,
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        },
      });
    }
  },
};
