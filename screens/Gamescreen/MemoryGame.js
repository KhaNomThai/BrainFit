// screens/Gamescreen/HiddenObjectGame.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { post } from "../../api";

const { width: screenWidth } = Dimensions.get("window");
const AUTO_NEXT_DELAY = 1000;

/* ===== THEME ===== */
const ORANGE = {
  primary: "#FF8A1F",
  primaryDark: "#E67700",
  light: "#FFE7CC",
  pale: "#FFF6EC",
  border: "#FFD2A3",
  textMain: "#1F1300",
  textSub: "#4A3726",
  success: "#1DBF73",
  gray: "#666",
};
const NEUTRAL = { bg: "#FFFDF9", line: "#F0E7DC", card: "#FFFFFF" };

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
});

export default function HiddenObjectGame({ email, navigation }) {
  const [phase, setPhase] = useState("intro");
  const [startTime, setStartTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const allItems = [
    { id: "ชายชุดดำ", x: 923, y: 180, w: 160, h: 230 }, // ด้านขวา ติดขอบหน้าต่าง
    { id: "แตงกวา", x: 240, y: 200, w: 100, h: 140 }, // บนกระถางต้นไม้
    { id: "น้ำยาบ้วนปาก", x: 555, y: 475, w: 90, h: 100 }, // อยู่บนอกผู้ชาย
    { id: "หนู", x: 230, y: 860, w: 130, h: 100 }, // กำลังกินอาหารแมว
    { id: "ยูง", x: 720, y: 570, w: 120, h: 80 }, // บนแก้วเขียว ข้างโซฟา
    { id: "ปลาดุก", x: 440, y: 40, w: 180, h: 140 }, // ลอยบนฟ้าใกล้ลูกบอล
    { id: "แยม", x: 10, y: 535, w: 110, h: 140 }, // ข้างๆ แมว บนเก้าอี้
    { id: "หมวก", x: 395, y: 960, w: 170, h: 120 }, // หมวกดำบนพื้น
    { id: "ไส้เดือน", x: 630, y: 775, w: 260, h: 180 }, // อยู่บนตัวเด็กที่นอน
  ];

  const [items, setItems] = useState([]);
  const [imageLayout, setImageLayout] = useState({ width: 0, height: 0 });

  const shuffleItems = () => {
    const shuffled = [...allItems]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map((item) => ({ ...item, found: false }));
    setItems(shuffled);
  };

  const saveResult = async () => {
    await post({
      action: "savegametime",
      email: email.trim(),
      gameName: "เกมหาของในภาพ",
      playTime: elapsedTime,
      score: "ไม่มีคะเเนน",
      total: 0,
    });
  };

  const startGame = () => {
    setStartTime(Date.now());
    setElapsedTime(0);
    shuffleItems();
    setPhase("play");
  };

  const handleFind = (id) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, found: true } : it))
    );
    setTimeout(() => {
        const endTime = Date.now();
        const durationMs = endTime - startTime;
        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const playTime = parseFloat(`${minutes}.${seconds.toString().padStart(2, "0")}`);
        setElapsedTime(playTime.toFixed(2));
    }, AUTO_NEXT_DELAY);
  };

  const allFound = items.length > 0 && items.every((item) => item.found);

  useEffect(() => {
  if (phase === "play") {
    const allFoundNow = items.length > 0 && items.every((item) => item.found);
    if (allFoundNow) {
      // หน่วงเวลาเล็กน้อยให้กรอบเขียวโชว์ก่อน
      setTimeout(() => {
        setPhase("result");
        saveResult();
      }, 1000); // 0.6 วิ (ปรับตามต้องการ)
    }
  }
}, [items, phase]);

  /* ===== RENDER ===== */
  if (phase === "intro") {
    return (
      <View style={styles.containerBG}>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Ionicons
              name="search"
              size={26}
              color={ORANGE.primaryDark}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.topbarTitle}>เกมหาของในภาพ</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.introWrap}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Ionicons name="image" size={24} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                ในแต่ละรอบจะสุ่มรายชื่อสิ่งของ{" "}
                <Text style={{ fontWeight: "900" }}>3 ชิ้น</Text> ให้คุณตามหาในภาพ
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons
                name="finger-print"
                size={24}
                color={ORANGE.primaryDark}
              />
              <Text style={styles.introText}>
                แตะบริเวณที่คิดว่าเป็นตำแหน่งของสิ่งของนั้น ๆ
                เพื่อทำเครื่องหมาย “เจอแล้ว”
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons
                name="checkmark-circle-outline"
                size={24}
                color={ORANGE.success}
              />
              <Text style={styles.introText}>
                รายการด้านล่างภาพจะมี{" "}
                <Text style={{ fontWeight: "900" }}>วงกลม</Text>{" "}
                แสดงสถานะว่าพบสิ่งของนั้น ๆ หรือยัง
              </Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="refresh" size={24} color={ORANGE.primaryDark} />
              <Text style={styles.introText}>
                เจอครบ 3 ชิ้นแล้ว กด “เริ่มใหม่” เพื่อสุ่มชุดใหม่และเล่นต่อ
              </Text>
            </View>
          </View>

          <View style={styles.introActions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
              <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (phase === "result") {
    return (
      <View style={styles.containerBG}>
        <View style={styles.topbar}>
          <View style={styles.topbarContent}>
            <Ionicons
              name="search"
              size={26}
              color={ORANGE.primaryDark}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.topbarTitle}>เกมหาของในภาพ</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.resultWrap}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultCard}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Ionicons name="trophy" size={22} color={ORANGE.primaryDark} />
              <Text style={styles.resultTitle}>
                เก่งมาก! หาของเจอครบหมดแล้ว
              </Text>
            </View>
          </View>
          <View style={styles.resultActionsCenter}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={startGame}>
              <Text style={styles.secondaryBtnText}>เล่นอีกครั้ง</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backBtn]}
              onPress={() => navigation?.goBack?.()}
            >
              <Text style={styles.secondaryBtnText}>เลือกเกมอื่นๆ</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // PLAY
  return (
    <View style={styles.containerBG}>
      <View style={styles.topbar}>
        <View style={styles.topbarContent}>
          <Ionicons
            name="search"
            size={26}
            color={ORANGE.primaryDark}
            style={{ marginRight: 8 }}
          />
          <Text style={styles.topbarTitle}>เกมหาของในภาพ</Text>
        </View>
      </View>

      <ScrollView
        style={styles.containerBG}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              เจอแล้ว {items.filter((i) => i.found).length}/{items.length}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setPhase("intro")}
            style={styles.badgeOutline}
          >
            <Ionicons
              name="help-circle-outline"
              size={18}
              color={ORANGE.primary}
              style={{ marginRight: 6 }}
            />
            <Text style={styles.badgeOutlineText}>วิธีเล่น</Text>
          </TouchableOpacity>
        </View>

        {/* Image + Hitboxes */}
        <View
          style={{
            width: "100%",
            alignItems: "center",
            marginTop: 10,
            marginBottom: 150,
          }}
          onLayout={(e) => {
            const containerWidth = e.nativeEvent.layout.width;
            const renderHeight = containerWidth * (1098 / 1080); // อัตราส่วนภาพจริง
            setImageLayout({ width: containerWidth, height: renderHeight });
          }}
        >
          <View
            style={{
              width: imageLayout.width,
              height: imageLayout.height,
            }}
          >
            {/* Background Image */}
            <Image
              source={require("../../assets/FindPic.png")}
              style={{
                width: imageLayout.width,
                height: imageLayout.height,
                position: "absolute",
                top: 0,
                left: 0,
              }}
              resizeMode="contain"
            />

            {/* Hitboxes Overlay */}
            {imageLayout.height > 0 &&
              items.map((item) => {
                const scaleX = imageLayout.width / 1080;
                const scaleY = imageLayout.height / 1098;

                const leftPx = item.x * scaleX;
                const topPx = item.y * scaleY;
                const widthPx = item.w * scaleX;
                const heightPx = item.h * scaleY;

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.3}
                    style={{
                      position: "absolute",
                      top: topPx,
                      left: leftPx,
                      width: widthPx,
                      height: heightPx,
                      borderWidth: item.found ? 3 : 0,
                      borderColor: item.found ? ORANGE.success : "transparent",
                      backgroundColor: "rgba(0,0,0,0.01)",
                    }}
                    onPress={() => handleFind(item.id)}
                  />
                );
              })}
          </View>
        </View>

        {/* Item list */}
        <View style={[styles.list, { marginTop: -120 }]}>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.chip,
                {
                  borderColor: item.found ? ORANGE.success : ORANGE.border,
                  backgroundColor: ORANGE.pale,
                },
              ]}
            >
              <Ionicons
                name={item.found ? "checkmark-circle" : "ellipse-outline"}
                size={18}
                color={item.found ? ORANGE.success : ORANGE.textMain}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.listItem,
                  item.found && {
                    textDecorationLine: "line-through",
                    color: ORANGE.gray,
                  },
                ]}
              >
                {item.id}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  containerBG: { flex: 1, backgroundColor: NEUTRAL.bg },

  topbar: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: NEUTRAL.card,
    borderBottomWidth: 1,
    borderBottomColor: NEUTRAL.line,
  },
  topbarContent: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    maxWidth: "92%",
  },
  topbarTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: ORANGE.textMain,
    textAlign: "center",
    flexShrink: 1,
  },

  introWrap: { padding: 18, alignItems: "center" },
  introCard: {
    backgroundColor: NEUTRAL.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ORANGE.border,
    padding: 18,
    width: "100%",
    ...cardShadow,
  },
  introRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  introText: {
    fontSize: 18,
    color: ORANGE.textSub,
    flexShrink: 1,
    lineHeight: 26,
  },
  introActions: {
    marginTop: 14,
    gap: 10,
    alignItems: "center",
    width: "100%",
  },
  primaryBtn: {
    backgroundColor: ORANGE.primary,
    paddingVertical: 18,
    paddingHorizontal: 26,
    borderRadius: 14,
    minWidth: 240,
    alignItems: "center",
    ...cardShadow,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 20, fontWeight: "900" },

  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  badge: {
    backgroundColor: ORANGE.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  badgeOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: ORANGE.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeOutlineText: {
    color: ORANGE.primary,
    fontWeight: "700",
    fontSize: 16,
  },

  background: {
    width: "100%",
    marginTop: 10,
    backgroundColor: "#fff",
    marginBottom: 150,
  },

  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginBottom: 50,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
    backgroundColor: ORANGE.pale,
  },
  listItem: { fontSize: 16, color: ORANGE.textMain },

  resultWrap: { padding: 18, paddingTop: 36, alignItems: "center" },
  resultCard: {
    backgroundColor: NEUTRAL.card,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: ORANGE.border,
    padding: 22,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
    ...cardShadow,
  },
  resultTitle: { fontSize: 22, fontWeight: "900", color: ORANGE.textMain },

  resultActionsCenter: { width: "100%", gap: 12, alignItems: "center" },
  backBtn: {
    backgroundColor: "#bebebeff",
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#a0a0a0ff",
    ...cardShadow,
  },
  secondaryBtn: {
    backgroundColor: ORANGE.light,
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 14,
    minWidth: 200,
    alignItems: "center",
    borderWidth: 2,
    borderColor: ORANGE.border,
    ...cardShadow,
  },
  secondaryBtnText: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
