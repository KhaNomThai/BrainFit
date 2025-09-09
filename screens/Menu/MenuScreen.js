import React, { useEffect, useState } from "react";
import { View, Text, Switch, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { post } from "../../api";

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

export default function MenuScreen({ navigation, email }) {
  const [sleepEnabled, setSleepEnabled] = useState(false);
  const [exerciseEnabled, setExerciseEnabled] = useState(false);
  const [socialEnabled, setSocialEnabled] = useState(false);
  const [lunchEnabled, setLunchEnabled] = useState(false);

  const [sleepBusy, setSleepBusy] = useState(false);
  const [exerciseBusy, setExerciseBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState(false);
  const [lunchBusy, setLunchBusy] = useState(false);
  
  // โหลดค่าจาก Sheet ครั้งแรก
  useEffect(() => {
    if (!email) return;
    (async () => {
      try {
        const res = await post({ action: "getNotificationSetting", email });
        if (res.success && res.data) {
          setExerciseEnabled(Boolean(res.data.exercise));
          setSocialEnabled(Boolean(res.data.social));
          setLunchEnabled(Boolean(res.data.lunch));
          setSleepEnabled(Boolean(res.data.sleep));
        }
      } catch (err) {
        console.error("โหลดการตั้งค่าไม่สำเร็จ:", err);
      }
    })();
  }, [email]);

  const updateNotificationSetting = async (key, value) => {
    const res = await post({
      action: "notificationSetting",
      email,
      key,
      value,
    });
    if (!res.success) {
      Alert.alert("Error", res.message || "บันทึกไม่สำเร็จ");
      if (key === "exercise") setExerciseEnabled((prev) => !prev);
      if (key === "social") setSocialEnabled((prev) => !prev);
      if (key === "lunch") setLunchEnabled((prev) => !prev);
      if (key === "sleep") setSleepEnabled((prev) => !prev);
    }
  };

  const toggleExercise = async (nextVal) => {
    if (exerciseBusy) return;
    setExerciseEnabled(nextVal);
    setExerciseBusy(true);
    try {
      await updateNotificationSetting("exercise", nextVal);
    } finally {
      setExerciseBusy(false);
    }
  };

  const toggleSocial = async (nextVal) => {
    if (socialBusy) return;
    setSocialEnabled(nextVal);
    setSocialBusy(true);
    try {
      await updateNotificationSetting("social", nextVal);
    } finally {
      setSocialBusy(false);
    }
  };

  const toggleLunch = async (nextVal) => {
    if (lunchBusy) return;
    setLunchEnabled(nextVal);
    setLunchBusy(true);
    try {
      await updateNotificationSetting("lunch", nextVal);
    } finally {
      setLunchBusy(false);
    }
  };

  const toggleSleep = async (nextVal) => {
    if (sleepBusy) return;
    setSleepEnabled(nextVal);
    setSleepBusy(true);
    try {
      await updateNotificationSetting("sleep", nextVal);
    } finally {
      setSleepBusy(false);
    }
  };

  const handleLogout = async () => {
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
      label: "แจ้งเตือนรับประทานอาหาร \n(08:00, 12:00, 16:00)",
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
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
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
