import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { L10N } from '../modules';

const GRANTED = 'granted';

export const NotificationsService = {
  init: async () => {
    await NotificationsService.reminders();
  },

  permission: async () => {
    if (Platform.OS === 'web') return false;
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

  reminders: async ([backup = 1] = []) => {
    if (!(await NotificationsService.permission())) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (backup) {
      await Notifications.scheduleNotificationAsync({
        content: { title: L10N.REMINDER_BACKUP, body: L10N.REMINDER_BACKUP_CAPTION, sound: true },
        trigger: { hour: 8, minute: 0, weekday: 7, type: Notifications.SchedulableTriggerInputTypes.WEEKLY },
      });
    }
  },
};
