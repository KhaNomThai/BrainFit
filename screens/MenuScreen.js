import React, { useEffect, useState } from "react";
import { View, Text, Button, Switch, StyleSheet } from "react-native";
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

  return (
    <View style={styles.container}>
      {userData ? (
        <>
          <Text style={styles.info}>👤 {userData.firstName} {userData.lastName}</Text>
          <Text style={styles.info}>อายุ: {userData.age}</Text>
          <Text style={styles.info}>น้ำหนัก: {userData.weight} กก.</Text>
          <Text style={styles.info}>ส่วนสูง: {userData.height} ซม.</Text>
          <Text style={styles.info}>เพศ: {userData.gender}</Text>
        </>
      ) : (
        <Text>กำลังโหลดข้อมูล...</Text>
      )}

      <View style={styles.switchRow}>
        <Text>🏃‍♂️ แจ้งเตือนออกกำลังกาย (07:00)</Text>
        <Switch value={exerciseEnabled} onValueChange={toggleExercise} />
      </View>

      <View style={styles.switchRow}>
        <Text>🗣 แจ้งเตือนพูดคุย (10:00)</Text>
        <Switch value={socialEnabled} onValueChange={toggleSocial} />
      </View>

      <View style={styles.switchRow}>
        <Text>🍚 แจ้งเตือนกินข้าว (12:00)</Text>
        <Switch value={lunchEnabled} onValueChange={toggleLunch} />
      </View>

      <View style={styles.switchRow}>
        <Text>💤 แจ้งเตือนเข้านอน (22:00)</Text>
        <Switch value={sleepEnabled} onValueChange={toggleSleep} />
      </View>


      <Button title="ออกจากระบบ" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  info: { fontSize: 16, marginBottom: 5 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 8,
    paddingHorizontal: 10
  }
});
