import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') alert('อนุญาตแจ้งเตือนด้วยครับ!');
};

// helper สำหรับ schedule การแจ้งเตือนที่เวลาเดียวทุกวัน
const scheduleDailyNotification = async (hour, minute, title, body, key) => {
  const now = new Date();
  const trigger = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
  if (trigger <= now) trigger.setDate(trigger.getDate() + 1);

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });

  await AsyncStorage.setItem(key, 'true');
};

const cancelNotification = async (key) => {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.setItem(key, 'false');
};

const getNotificationStatus = async (key) => {
  const status = await AsyncStorage.getItem(key);
  return status === 'true';
};

// --- Sleep Notification ---
export const scheduleSleepNotification = async () => {
  await scheduleDailyNotification(
    22, 0,
    '💤 ถึงเวลาเข้านอนแล้ว',
    'พักผ่อนให้เพียงพอ เพื่อสุขภาพที่ดีครับ!',
    'sleepNotificationEnabled'
  );
};

export const cancelSleepNotification = async () => {
  await cancelNotification('sleepNotificationEnabled');
};

export const getSleepNotificationStatus = async () => {
  return await getNotificationStatus('sleepNotificationEnabled');
};

// --- Exercise Notification ---
export const scheduleExerciseNotification = async () => {
  await scheduleDailyNotification(
    7, 0,
    '🏃‍♂️ ได้เวลาขยับร่างกาย!',
    'ลุกขึ้นมายืดเส้นยืดสายกันหน่อย!',
    'exerciseNotificationEnabled'
  );
};

export const cancelExerciseNotification = async () => {
  await cancelNotification('exerciseNotificationEnabled');
};

export const getExerciseNotificationStatus = async () => {
  return await getNotificationStatus('exerciseNotificationEnabled');
};

// --- Social Notification ---
export const scheduleSocialNotification = async () => {
  await scheduleDailyNotification(
    10, 0,
    '🗣 อย่าลืมพูดคุยกับคนรอบข้าง',
    'ลองทักทายหรือพูดคุยกับใครสักคนสิ!',
    'socialNotificationEnabled'
  );
};

export const cancelSocialNotification = async () => {
  await cancelNotification('socialNotificationEnabled');
};

export const getSocialNotificationStatus = async () => {
  return await getNotificationStatus('socialNotificationEnabled');
};

// --- Lunch Notification ---
export const scheduleLunchNotification = async () => {
  await scheduleDailyNotification(
    12, 0,
    '🍚 ได้เวลากินข้าวเที่ยงแล้ว!',
    'พักทานอาหารบ้างนะครับ สุขภาพสำคัญ!',
    'lunchNotificationEnabled'
  );
};

export const cancelLunchNotification = async () => {
  await cancelNotification('lunchNotificationEnabled');
};

export const getLunchNotificationStatus = async () => {
  return await getNotificationStatus('lunchNotificationEnabled');
};
