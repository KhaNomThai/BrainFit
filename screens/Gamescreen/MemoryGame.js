import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from "react-native";

export default function HiddenObjectGame() {
  // --- pool สิ่งของทั้งหมดในด่านนี้ ---
  const allItems = [
    { id: "ชายชุดดำ", top: "11%", left: "90%", width: "10%", height: "14%" },
    { id: "แตงกวา", top: "11%", left: "21%", width: "12%", height: "10%" },
    { id: "น้ำยาบ้วนปาก", top: "30%", left: "50%", width: "10%", height: "8%" },
    { id: "หนู", top: "55%", left: "22%", width: "12%", height: "8%" },
    { id: "ยูง", top: "35%", left: "68%", width: "9%", height: "6%" },
    { id: "ปลาดุก", top: "1%", left: "45%", width: "10%", height: "10%" },
    { id: "แยม", top: "35%", left: "2%", width: "9%", height: "7%" },
    { id: "หมวก", top: "63%", left: "39%", width: "13%", height: "8%" },
    { id: "ไส้เดือน", top: "52%", left: "60%", width: "22%", height: "10%" },

  ];

  // state สำหรับ items ที่สุ่มมา
  const [items, setItems] = useState([]);

  // --- ฟังก์ชันสุ่ม items ---
  const shuffleItems = () => {
    const shuffled = [...allItems]
      .sort(() => 0.5 - Math.random()) // สุ่มเรียงใหม่
      .slice(0, 3) // เลือกมา 3 ชิ้น
      .map((item) => ({ ...item, found: false })); // เซ็ต found เป็น false
    setItems(shuffled);
  };

  // สุ่มตอนเริ่มเกม
  useEffect(() => {
    shuffleItems();
  }, []);

  // --- ฟังก์ชันกดหา ---
  const handleFind = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, found: true } : item))
    );
  };

  const allFound = items.length > 0 && items.every((item) => item.found);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔎 หาของที่ซ่อนอยู่ในภาพ!</Text>

      <ImageBackground
        source={require("../../assets/FindPic.png")}
        style={styles.background}
      >
        {/* hitbox ของสิ่งของ */}
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.hitbox,
              {
                top: item.top,
                left: item.left,
                width: item.width,
                height: item.height,
                borderWidth: item.found ? 3 : 0,
                borderColor: item.found ? "limegreen" : "transparent",
              },
            ]}
            onPress={() => handleFind(item.id)}
          />
        ))}
      </ImageBackground>

      {/* รายการสิ่งของที่ต้องหา */}
      <View style={styles.list}>
        {items.map((item) => (
          <Text
            key={item.id}
            style={[
              styles.listItem,
              item.found && { textDecorationLine: "line-through", color: "gray" },
            ]}
          >
            {item.id}
          </Text>
        ))}
      </View>

      {/* จบเกม + ปุ่มเริ่มใหม่ */}
      {allFound && (
        <View style={{ alignItems: "center" }}>
          <Text style={styles.winText}>🎉 You found everything! 🎉</Text>
          <TouchableOpacity onPress={shuffleItems}>
            <Text style={styles.restart}>🔄 เริ่มใหม่</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center", justifyContent: "flex-start" },
  title: { fontSize: 22, fontWeight: "bold", margin: 10 },
  background: { width: "100%", height: "70%", resizeMode: "cover", marginTop: 50, justifyContent: "flex-start" },
  hitbox: { position: "absolute" },
  list: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  listItem: { fontSize: 22, marginHorizontal: 10, marginTop: -150 },
  winText: { fontSize: 20, fontWeight: "bold", color: "green", marginTop: -20 },
  restart: { fontSize: 18, color: "black", marginTop: 10 },
});
