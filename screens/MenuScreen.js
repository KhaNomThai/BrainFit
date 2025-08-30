import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
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

// โทนสีของแต่ละบล็อค (สไตล์เดียวกับหน้า Home: หลายสี พาสเทล)
const TILE_PALETTE = {
  exercise: { bg: "#FFF0E6", border: "#FFD8A8", icon: "#E8590C" },  // ส้มพาสเทล
  social:   { bg: "#E7F5FF", border: "#BDE0FE", icon: "#1C7ED6" },  // ฟ้าอ่อน
  lunch:    { bg: "#FFF5F5", border: "#FFC9C9", icon: "#FA5252" },  // ชมพูอ่อน
  sleep:    { bg: "#E6FCF5", border: "#C3FAE8", icon: "#0CA678" },  // เขียวมิ้นท์
};

export default function MenuScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [sleepEnabled, setSleepEnabled] = useState(false);
  const [exerciseEnabled, setExerciseEnabled] = useState(false);
  const [socialEnabled, setSocialEnabled] = useState(false);
  const [lunchEnabled, setLunchEnabled] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();

    (async () => {
      setSleepEnabled(await getSleepNotificationStatus());
      setExerciseEnabled(await getExerciseNotificationStatus());
      setSocialEnabled(await getSocialNotificationStatus());
      setLunchEnabled(await getLunchNotificationStatus());
    })();
  }, []);

  const toggleSleep = async () => {
    if (sleepEnabled) await cancelSleepNotification();
    else await scheduleSleepNotification();
    setSleepEnabled(!sleepEnabled);
  };

  const toggleExercise = async () => {
    if (exerciseEnabled) await cancelExerciseNotification();
    else await scheduleExerciseNotification();
    setExerciseEnabled(!exerciseEnabled);
  };

  const toggleSocial = async () => {
    if (socialEnabled) await cancelSocialNotification();
    else await scheduleSocialNotification();
    setSocialEnabled(!socialEnabled);
  };

  const toggleLunch = async () => {
    if (lunchEnabled) await cancelLunchNotification();
    else await scheduleLunchNotification();
    setLunchEnabled(!lunchEnabled);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigation.replace("Login");
  };

  // สร้างรายการบล็อคด้วยสีเฉพาะของแต่ละประเภท
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
      label: "แจ้งเตือนกินข้าว (12:00)",
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

/** ---------- Reusable Row (multi-color) ---------- */
function Row({ icon, label, enabled, onToggle, palette }) {
  return (
    <View
      style={[
        styles.rowBase,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          opacity: enabled ? 1 : 0.95, // ปิดอยู่ให้จางนิดๆ
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
        trackColor={{ false: "#D9D9D9", true: palette.icon }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" }, // พื้นหลังขาวตามที่ขอ
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
