import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import {
  scheduleSleepNotification,
  cancelSleepNotification,
  getSleepNotificationStatus,
  scheduleExerciseNotification,
  cancelExerciseNotification,
  getExerciseNotificationStatus,
  scheduleSocialNotification,
  cancelSocialNotification,
  getSocialNotificationStatus,
  scheduleLunchNotification,
  cancelLunchNotification,
  getLunchNotificationStatus
} from "../notifications";

const ORANGE = {
  primary: "#FF922B",
  light: "#FFECD1",
  pale: "#FFF5EA",
  border: "#FFD8A8",
  textMain: "#2F2A26",
  textSub: "#5C3D2E",
};

// โทนสีของแต่ละบล็อค (หลายสีแบบหน้า Home)
const TILE_PALETTE = {
  exercise: { bg: "#FFF0E6", border: "#FFD8A8", icon: "#E8590C" }, // ส้มพาสเทล
  social:   { bg: "#E7F5FF", border: "#BDE0FE", icon: "#1C7ED6" }, // ฟ้าอ่อน
  lunch:    { bg: "#FFF5F5", border: "#FFC9C9", icon: "#FA5252" }, // ชมพูอ่อน
  sleep:    { bg: "#E6FCF5", border: "#C3FAE8", icon: "#0CA678" }, // เขียวมิ้นท์
};

export default function MenuScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  // สถานะเปิด/ปิด
  const [sleepEnabled, setSleepEnabled] = useState(false);
  const [exerciseEnabled, setExerciseEnabled] = useState(false);
  const [socialEnabled, setSocialEnabled] = useState(false);
  const [lunchEnabled, setLunchEnabled] = useState(false);

  // กันกดรัว ๆ ระหว่าง await
  const [sleepBusy, setSleepBusy] = useState(false);
  const [exerciseBusy, setExerciseBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const [lunchBusy, setLunchBusy] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) setUserData(snap.data());
    };
    fetchUser();

    (async () => {
      setSleepEnabled(await getSleepNotificationStatus());
      setExerciseEnabled(await getExerciseNotificationStatus());
      setSocialEnabled(await getSocialNotificationStatus());
      setLunchEnabled(await getLunchNotificationStatus());
    })();
  }, []);

  // ใช้ nextVal จาก Switch โดยตรง + try/catch + busy flag
  const toggleSleep = async (nextVal) => {
    if (sleepBusy) return;
    setSleepBusy(true);
    const prev = sleepEnabled;
    setSleepEnabled(nextVal);
    try {
      if (nextVal) await scheduleSleepNotification();
      else await cancelSleepNotification();
    } catch (e) {
      setSleepEnabled(prev);
      Alert.alert("เกิดข้อผิดพลาด", "ตั้งค่าการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setSleepBusy(false);
    }
  };

  const toggleExercise = async (nextVal) => {
    if (exerciseBusy) return;
    setExerciseBusy(true);
    const prev = exerciseEnabled;
    setExerciseEnabled(nextVal);
    try {
      if (nextVal) await scheduleExerciseNotification();
      else await cancelExerciseNotification();
    } catch (e) {
      setExerciseEnabled(prev);
      Alert.alert("เกิดข้อผิดพลาด", "ตั้งค่าการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setExerciseBusy(false);
    }
  };

  const toggleSocial = async (nextVal) => {
    if (socialBusy) return;
    setSocialBusy(true);
    const prev = socialEnabled;
    setSocialEnabled(nextVal);
    try {
      if (nextVal) await scheduleSocialNotification();
      else await cancelSocialNotification();
    } catch (e) {
      setSocialEnabled(prev);
      Alert.alert("เกิดข้อผิดพลาด", "ตั้งค่าการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setSocialBusy(false);
    }
  };

  const toggleLunch = async (nextVal) => {
    if (lunchBusy) return;
    setLunchBusy(true);
    const prev = lunchEnabled;
    setLunchEnabled(nextVal);
    try {
      if (nextVal) await scheduleLunchNotification();
      else await cancelLunchNotification();
    } catch (e) {
      setLunchEnabled(prev);
      Alert.alert("เกิดข้อผิดพลาด", "ตั้งค่าการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setLunchBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  const rows = [
    {
      key: "exercise",
      icon: "fitness-outline",
      label: "แจ้งเตือนออกกำลังกาย (07:00)",
      enabled: exerciseEnabled,
      onToggle: toggleExercise,
      palette: TILE_PALETTE.exercise,
      disabled: exerciseBusy,
    },
    {
      key: "social",
      icon: "people-outline",
      label: "แจ้งเตือนพูดคุย (10:00)",
      enabled: socialEnabled,
      onToggle: toggleSocial,
      palette: TILE_PALETTE.social,
      disabled: socialBusy,
    },
    {
      key: "lunch",
      icon: "fast-food-outline",
      label: "แจ้งเตือนกินข้าว (12:00)",
      enabled: lunchEnabled,
      onToggle: toggleLunch,
      palette: TILE_PALETTE.lunch,
      disabled: lunchBusy,
    },
    {
      key: "sleep",
      icon: "moon-outline",
      label: "แจ้งเตือนเข้านอน (22:00)",
      enabled: sleepEnabled,
      onToggle: toggleSleep,
      palette: TILE_PALETTE.sleep,
      disabled: sleepBusy,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {userData ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="person-circle-outline" size={40} color={ORANGE.primary} />
              <Text style={styles.title}>
                {userData.firstName} {userData.lastName}
              </Text>
            </View>
            <Text style={styles.info}>อายุ: {userData.age}</Text>
            <Text style={styles.info}>น้ำหนัก: {userData.weight} กก.</Text>
            <Text style={styles.info}>ส่วนสูง: {userData.height} ซม.</Text>
            <Text style={styles.info}>เพศ: {userData.gender}</Text>
          </View>
        ) : (
          <Text style={styles.loading}>กำลังโหลดข้อมูล...</Text>
        )}

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

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>ออกจากระบบ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

/** ---------- Reusable Row (JS) ---------- */
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
        onValueChange={onToggle}  // ใช้ค่า nextVal โดยตรง
        disabled={disabled}
        trackColor={{ false: "#D9D9D9", true: palette.icon }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  card: {
    width: "100%",
    backgroundColor: ORANGE.pale,
    borderWidth: 1,
    borderColor: ORANGE.border,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 18, fontWeight: "700", marginLeft: 8, color: ORANGE.textMain },
  info: { fontSize: 15, color: ORANGE.textSub, marginBottom: 4 },
  loading: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 12 },

  rowBase: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  rowLeft: { flexDirection: "row", alignItems: "center", flexShrink: 1 },
  label: { fontSize: 16, color: "#333", flexShrink: 1 },

  logoutBtn: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: ORANGE.primary,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 3,
  },
  logoutText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700", marginLeft: 8 },
});
