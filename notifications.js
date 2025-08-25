import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') alert('อนุญาตแจ้งเตือนด้วยครับ!');
};

export const scheduleSleepNotification = async (hour = 22, minute = 30) => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const now = new Date();
  const trigger = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
  if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "💤 ถึงเวลาเข้านอนแล้ว",
      body: "อย่าลืมพักผ่อนให้เพียงพอครับ!",
    },
    trigger,
  });

  await AsyncStorage.setItem('sleepNotificationEnabled', 'true');
};

export const cancelSleepNotification = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem('sleepNotificationEnabled', 'false');
};

export const getSleepNotificationStatus = async () => {
  const status = await AsyncStorage.getItem('sleepNotificationEnabled');
  return status === 'true';
};
