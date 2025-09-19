import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Alert, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

const ORANGE = {
  primary: "#FF922B",
  light: "#FFECD1",
  pale: "#FFF5EA",
  border: "#FFD8A8",
  textMain: "#2F2A26",
  textSub: "#5C3D2E",
};

const TILE_PALETTE = {
  exercise: { bg: "#FFF0E6", border: "#FFD8A8", icon: "#E8590C" },
  social:   { bg: "#E7F5FF", border: "#BDE0FE", icon: "#1C7ED6" },
  lunch:    { bg: "#FFF5F5", border: "#FFC9C9", icon: "#FA5252" },
  sleep:    { bg: "#E6FCF5", border: "#C3FAE8", icon: "#0CA678" },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function scheduleExactNotification(key, hour, minute, title, body) {
  try {
    const oldId = await AsyncStorage.getItem(`notif_${key}`);

    if (oldId) {
      await Notifications.cancelScheduledNotificationAsync(oldId);
    }
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hour);
    triggerDate.setMinutes(minute);
    triggerDate.setSeconds(0);

    if (triggerDate.getTime() <= now.getTime()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    const newId = await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: "date", date: triggerDate },
    });

    await AsyncStorage.setItem(`notif_${key}`, newId);
  } catch (err) {
    console.error("scheduleExactNotification error:", err);
  }
}



async function cancelNotification(key) {
  try {
    const oldId = await AsyncStorage.getItem(`notif_${key}`);
    if (oldId) {
      await Notifications.cancelScheduledNotificationAsync(oldId);
      await AsyncStorage.removeItem(`notif_${key}`);
    }
  } catch (err) {
    console.error("cancel error:", err);
  }
}

export default function MenuScreen({ navigation }) {
  const [exerciseEnabled, setExerciseEnabled] = useState(false);
  const [socialEnabled, setSocialEnabled] = useState(false);
  const [lunchEnabled, setLunchEnabled] = useState(false);
  const [sleepEnabled, setSleepEnabled] = useState(false);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("กรุณาอนุญาตการแจ้งเตือน", "ไปที่ Settings เพื่อเปิดการอนุญาต");
      }

      const saves = await AsyncStorage.getItem("notif_settings");
      if (saves) {
        const parsed = JSON.parse(saves);
        setExerciseEnabled(parsed.exercise);
        setSocialEnabled(parsed.social);
        setLunchEnabled(parsed.lunch);
        setSleepEnabled(parsed.sleep);
    
        if (parsed.exercise) {
          await scheduleExactNotification("exercise", 7, 0, "เเจ้งเตือนออกกำลังกาย", "อย่าลืมออกกำลังกายด้วยนะ");
        }
        if (parsed.social) {
          await scheduleExactNotification("social", 10, 0, "เเจ้งเตือนพูดคุย", "หาเวลาว่างคุยกับคนอื่นบ้าง");
        }
        if (parsed.lunch) {
          await scheduleExactNotification("lunch1", 8, 0, "เเจ้งเตือนรับประทานอาหารตอนเช้า", "อย่าลืมรับประทานอาหารเช้านะ");
          await scheduleExactNotification("lunch2", 12, 0, "เเจ้งเตือนรับประทานอาหาตอนรกลางวัน", "อย่าลืมรับประทานอาหารกลางวันนะ");
          await scheduleExactNotification("lunch3", 16, 0, "เเจ้งเตือนรับประทานอาหารตอนเย็น", "อย่าลืมรับประทานอาหารเย็นนะ");
        }
        if (parsed.sleep) {
          await scheduleExactNotification("sleep", 22, 0, "เเจ้งเตือนเข้านอน", "ถึงเวลานอนเเล้วนะ พักผ่อนให้เพียงพอนะ");
        }
      }
    })();
  }, []);

  const saveSettings = async (newState) => {
    await AsyncStorage.setItem("notif_settings", JSON.stringify(newState));
  };

  const toggleExercise = async (val) => {
    if (busy) return;
    setBusy(true);
    setExerciseEnabled(val);
    const newState = { 
      exercise: val,
      social: socialEnabled,
      lunch: lunchEnabled,
      sleep: sleepEnabled 
    };
    
    await saveSettings(newState);
    if (val) {
      await scheduleExactNotification("exercise", 7, 0, "เเจ้งเตือนออกกำลังกาย", "อย่าลืมออกกำลังกายด้วยนะ");
    } else {
      await cancelNotification("exercise");
    }
    setBusy(false);
  };

  const toggleSocial = async (val) => {
    if (busy) return;
    setBusy(true);
    setSocialEnabled(val);
    const newState = { 
      exercise: exerciseEnabled,
      social: val,
      lunch: lunchEnabled,
      sleep: sleepEnabled
    };

    await saveSettings(newState);
    if (val) {
      await scheduleExactNotification("social", 10, 0, "เเจ้งเตือนพูดคุย", "หาเวลาว่างคุยกับคนอื่นบ้าง");
    } else {
      await cancelNotification("social");
    }
    setBusy(false);
  };

  const toggleLunch = async (val) => {
    if (busy) return;
    setBusy(true);
    setLunchEnabled(val);
    const newState = { exercise: exerciseEnabled,
      social: socialEnabled,
      lunch: val,
      sleep: sleepEnabled 
    };

    await saveSettings(newState);
    if (val) {
      await scheduleExactNotification("lunch1", 8, 0, "เเจ้งเตือนรับประทานอาหารตอนเช้า", "อย่าลืมรับประทานอาหารเช้านะ");
      await scheduleExactNotification("lunch2", 12, 0, "เเจ้งเตือนรับประทานอาหาตอนรกลางวัน", "อย่าลืมรับประทานอาหารกลางวันนะ");
      await scheduleExactNotification("lunch3", 16, 0, "เเจ้งเตือนรับประทานอาหารตอนเย็น", "อย่าลืมรับประทานอาหารเย็นนะ");
    } else {
      await cancelNotification("lunch1");
      await cancelNotification("lunch2");
      await cancelNotification("lunch3");
    }
    setBusy(false);
  };

  const toggleSleep = async (val) => {
    if (busy) return;
    setBusy(true);
    setSleepEnabled(val);
    const newState = { exercise: exerciseEnabled,
      social: socialEnabled,
      lunch: lunchEnabled,
      sleep: val
    };
    await saveSettings(newState);
    if (val) {
      await scheduleExactNotification("sleep", 22, 0, "เเจ้งเตือนเข้านอน", "ถึงเวลานอนเเล้วนะ พักผ่อนให้เพียงพอนะ!");
    } else {
      await cancelNotification("sleep");
    }
    setBusy(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userEmail");
    navigation.replace("login");
  };

  const rows = [
    {
      key: "exercise",
      icon: "fitness-outline",
      label: "แจ้งเตือนออกกำลังกาย (07:00)",
      enabled: exerciseEnabled,
      onToggle: toggleExercise,
      palette: TILE_PALETTE.exercise,
    },
    {
      key: "social",
      icon: "people-outline",
      label: "แจ้งเตือนพูดคุย (10:00)",
      enabled: socialEnabled,
      onToggle: toggleSocial,
      palette: TILE_PALETTE.social,
    },
    {
      key: "lunch",
      icon: "fast-food-outline",
      label: "แจ้งเตือนรับประทานอาหาร \n(08:00, 12:00, 16:00)",
      enabled: lunchEnabled,
      onToggle: toggleLunch,
      palette: TILE_PALETTE.lunch,
    },
    {
      key: "sleep",
      icon: "moon-outline",
      label: "แจ้งเตือนเข้านอน (22:00)",
      enabled: sleepEnabled,
      onToggle: toggleSleep,
      palette: TILE_PALETTE.sleep,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
       <Text style={styles.Title}>การตั้งค่า</Text>
       <Text style={styles.Titles}>เปิด / ปิดเสียงเเจ้งเตือน</Text>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.Card}>
        {rows.map((r) => (
          <Row
            key={r.key}
            icon={r.icon}
            label={r.label}
            enabled={r.enabled}
            onToggle={r.onToggle}
            palette={r.palette}
            disabled={r.disabled}
          />
        ))}

        <View style={styles.adviceCard}>
          <Text style={styles.adviceTitle}>เคล็ดลับสุขภาพสมอง</Text>
          <Text style={styles.adviceItem}>• ออกกำลังกายสม่ำเสมอ{"\n"}• รับประทานอาหารที่มีประโยชน์{"\n"}• นอนหลับพักผ่อนให้เพียงพอ{"\n"}• มีกิจกรรมทางสังคม{"\n"}• เล่นเกมฝึกสมองเป็นประจำ</Text>
        </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;

/** ---------- Reusable Row ---------- */
function Row({ icon, label, enabled, onToggle, palette, disabled }) {
  return (
    <View
      style={[
        styles.rowBase,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      <View style={styles.rowLeft}>
        <Ionicons
          name={icon}
          size={22}
          color={enabled ? palette.icon : ORANGE.textSub}
          style={{ marginRight: 10 }}
        />
        <Text style={[styles.label, enabled && { color: ORANGE.textMain }]} numberOfLines={2}>
          {label}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: "#D9D9D9", true: palette.icon }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF",},
  container: {
    flexGrow: 1,
    padding: vw(5), // เดิม 20
    backgroundColor: "#FFFFFF",
    paddingBottom: vh(10)
  },
  Title: {
    fontSize: vh(2.8),
    fontWeight: "700",
    color: "#111827",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: vh(2),
  },
  Titles: {
    fontSize: vh(1.8),
    fontWeight: "400",
    color: "#667085",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: vh(1),
  },
  rowBase: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: vh(1),
    paddingHorizontal: vw(2),
    borderRadius: vw(3.5),
    borderWidth: 1,
    marginBottom: vh(1.3),
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  label: { fontSize: vh(1.6), color: "#333", flexShrink: 1 },

  logoutBtn: {
    marginTop: vh(2),
    alignSelf: "center",
    backgroundColor: ORANGE.primary,
    paddingVertical: vh(1.6),
    paddingHorizontal: vw(6),
    borderRadius: vw(6),
    flexDirection: "row",
    alignItems: "center",
    gap: vw(2),
    elevation: 3,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: vh(1.6),
    fontWeight: "700",
  },

  adviceCard: {
    marginTop: vh(1.5),
    backgroundColor: "#fcf9f6ff",
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: vw(3.5),
    padding: vw(3),
  },
  adviceTitle: {
    fontSize: vh(2.2),
    fontWeight: "800",
    color: "#000000ff",
    marginBottom: vh(1.5),
  },
  adviceItem: {
    fontSize: vh(1.6),
    fontWeight: "400",
    color: "#000000ff",
    lineHeight: vh(2.8),
  },

  Card: {
    backgroundColor: "#fff",
    borderRadius: vw(5),
    padding: vw(5),
    gap: vh(0.3),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 1.2,
    shadowOffset: { width: 0, height: 0.6 },
    elevation: 3,
  },
});