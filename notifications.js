import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ให้แจ้งเตือนตอนแอพอยู่ foreground ด้วย (เลือกได้)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, // เด้ง banner ตอนแอพอยู่ foreground (iOS)
    shouldShowList: true,   // เก็บเข้า Notification Center (iOS)
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') alert('อนุญาตแจ้งเตือนด้วยครับ!');
};

/** เก็บ/อ่าน id ของนัด (ต่อ key) เพื่อยกเลิกเฉพาะตัวเอง */
const storeId = async (key, id) => AsyncStorage.setItem(`${key}:id`, id);
const loadId  = async (key) => AsyncStorage.getItem(`${key}:id`);
const setEnabled = async (key, v) => AsyncStorage.setItem(key, v ? 'true' : 'false');
const getEnabled = async (key) => (await AsyncStorage.getItem(key)) === 'true';

/** สร้างนัดแบบซ้ำทุกวันเวลาเดิม (ใช้รูปแบบใหม่ ไม่ Deprecated) */
const scheduleDailyRepeat = async (hour, minute, title, body, key) => {
  // ถ้ามีของเก่าอยู่ ยกเลิกก่อน (กันซ้อน)
  await cancelByKey(key);

  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    // ✅ รูปแบบใหม่: repeat รายวัน
    trigger: { hour, minute, repeats: true },
  });

  await storeId(key, id);
  await setEnabled(key, true);
};

/** สร้างนัดครั้งเดียว ณ วันที่/เวลาเป้าหมาย (ตัวอย่างเผื่ออยากใช้) */
const scheduleOnceAt = async (date, title, body, key) => {
  await cancelByKey(key);
  const id = await Notifications.scheduleNotificationAsync({
    content: { title, body },
    // ✅ รูปแบบใหม่: ระบุชนิด 'date'
    trigger: { type: 'date', date },
  });
  await storeId(key, id);
  await setEnabled(key, true);
};

/** ยกเลิกเฉพาะนัดของ key นั้น ๆ */
const cancelByKey = async (key) => {
  const id = await loadId(key);
  if (id) {
    try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
  }
  await setEnabled(key, false);
  await AsyncStorage.removeItem(`${key}:id`);
};

const getStatusByKey = async (key) => getEnabled(key);

// --- Sleep Notification (22:00 ทุกวัน) ---
export const scheduleSleepNotification = async () => {
  await scheduleDailyRepeat(
    22, 0,
    '💤 ถึงเวลาเข้านอนแล้ว',
    'พักผ่อนให้เพียงพอ เพื่อสุขภาพที่ดีครับ!',
    'sleepNotificationEnabled'
  );
};

export const cancelSleepNotification = async () => {
  await cancelByKey('sleepNotificationEnabled');
};

export const getSleepNotificationStatus = async () => {
  return await getStatusByKey('sleepNotificationEnabled');
};

// --- Exercise Notification (07:00 ทุกวัน) ---
export const scheduleExerciseNotification = async () => {
  await scheduleDailyRepeat(
    7, 0,
    '🏃‍♂️ ได้เวลาขยับร่างกาย!',
    'ลุกขึ้นมายืดเส้นยืดสายกันหน่อย!',
    'exerciseNotificationEnabled'
  );
};

export const cancelExerciseNotification = async () => {
  await cancelByKey('exerciseNotificationEnabled');
};

export const getExerciseNotificationStatus = async () => {
  return await getStatusByKey('exerciseNotificationEnabled');
};

// --- Social Notification (10:00 ทุกวัน) ---
export const scheduleSocialNotification = async () => {
  await scheduleDailyRepeat(
    10, 0,
    '🗣 อย่าลืมพูดคุยกับคนรอบข้าง',
    'ลองทักทายหรือพูดคุยกับใครสักคนสิ!',
    'socialNotificationEnabled'
  );
};

export const cancelSocialNotification = async () => {
  await cancelByKey('socialNotificationEnabled');
};

export const getSocialNotificationStatus = async () => {
  return await getStatusByKey('socialNotificationEnabled');
};

// --- Lunch Notification (12:00 ทุกวัน) ---
export const scheduleLunchNotification = async () => {
  await scheduleDailyRepeat(
    12, 0,
    '🍚 ได้เวลากินข้าวเที่ยงแล้ว!',
    'พักทานอาหารบ้างนะครับ สุขภาพสำคัญ!',
    'lunchNotificationEnabled'
  );
};

export const cancelLunchNotification = async () => {
  await cancelByKey('lunchNotificationEnabled');
};

export const getLunchNotificationStatus = async () => {
  return await getStatusByKey('lunchNotificationEnabled');
};