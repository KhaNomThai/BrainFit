import React, { useEffect, useState } from "react";
import { View, Text, Button, Switch, StyleSheet, TextInput } from "react-native";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { scheduleSleepNotification, cancelSleepNotification, getSleepNotificationStatus } from "../notifications";

export default function MenuScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [hour, setHour] = useState("22");   // default 22
  const [minute, setMinute] = useState("30"); // default 30

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setUserData(docSnap.data());
    };
    fetchUser();

    (async () => {
      const status = await getSleepNotificationStatus();
      setIsEnabled(status);
    })();
  }, []);

  const toggleSwitch = async () => {
    if (isEnabled) await cancelSleepNotification();
    else await scheduleSleepNotification(Number(hour), Number(minute));
    setIsEnabled(!isEnabled);
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

      <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 10 }}>
        <Text style={{ marginRight: 10 }}>แจ้งเตือนเข้านอน</Text>
        <Switch value={isEnabled} onValueChange={toggleSwitch} />
      </View>

      <View style={{ flexDirection: "row", marginBottom: 20 }}>
        <TextInput
          style={styles.timeInput}
          value={hour}
          onChangeText={setHour}
          keyboardType="numeric"
          maxLength={2}
          placeholder="ชั่วโมง"
        />
        <Text style={{ marginHorizontal: 5 }}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={minute}
          onChangeText={setMinute}
          keyboardType="numeric"
          maxLength={2}
          placeholder="นาที"
        />
      </View>

      <Button title="ออกจากระบบ" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  info: { fontSize: 16, marginBottom: 5 },
  timeInput: { borderWidth: 1, borderColor: "#ccc", padding: 5, width: 50, textAlign: "center", borderRadius: 5 },
});
