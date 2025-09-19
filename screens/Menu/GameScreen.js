import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GameScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const H_PADDING = vh(2);                  // ระยะขอบซ้ายขวา ≈ 16px
  const MAX_CARD_WIDTH = 420;               // จำกัดการ์ดไม่เกิน 420px
  const CARD_WIDTH = Math.min(width - H_PADDING * 2, MAX_CARD_WIDTH);

  const isSmall = width < 360;
  const isTablet = width >= 768;
  const fontScale = isTablet ? 1.15 : isSmall ? 0.92 : 1;

  return (
    <SafeAreaView style={styles.bg}>
      
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: vh(2.6) * fontScale }]}>
            เกมฝึกสมอง
          </Text>
          <Text style={[styles.headerSub, { fontSize: vh(1.8) * fontScale }]}>
            เลือกเกมที่ต้องการเล่น
          </Text>
        </View>
      <ScrollView
          contentContainerStyle={[styles.container, { paddingHorizontal: H_PADDING }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Section: Registration */}
        <Section title="Registration" width={CARD_WIDTH} fontScale={fontScale}>
          <GameItem
            icon="text"
            text="เกมจับคู่คำ"
            color="#DCE6FF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("MatchingWord")}
          />
          <GameItem
            icon="git-branch-outline"
            text="เกมจับคู่ความสัมพันธ์"
            color="#E7E9FF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("RelationMatch")}
          />
          <GameItem
            icon="ear-outline"
            text="เกมฟังเสียง"
            color="#EADAF0"
            fontScale={fontScale}
            onPress={() => navigation.navigate("SoundRecognize")}
          />
        </Section>

        {/* Section: Attention or Calculation */}
        <Section title="Attention or Calculation" width={CARD_WIDTH} fontScale={fontScale}>
          <GameItem
            icon="search"
            text="เกมหาของในภาพ"
            color="#DFF7E5"
            fontScale={fontScale}
            onPress={() => navigation.navigate("MemoryGame")}
          />
          <GameItem
            icon="calculator"
            text="เกมคณิตคิดเร็ว"
            color="#FFE3CF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("FastMath")}
          />
          <GameItem
            icon="images-outline"
            text="เกมจับคู่จำนวนกับภาพ"
            color="#FFF1C9"
            fontScale={fontScale}
            onPress={() => navigation.navigate("NumberScreen")}
          />
        </Section>

        {/* Section: Recall */}
        <Section title="Recall" width={CARD_WIDTH} fontScale={fontScale}>
          <GameItem
            icon="image-outline"
            text="เกมจำภาพ"
            color="#FAD7E2"
            fontScale={fontScale}
            onPress={() => navigation.navigate("GamepictureScreen")}
          />
          <GameItem
            icon="book-outline"
            text="เกมเล่าเรื่องแล้วถาม"
            color="#E8E2FF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("StoryGame")}
          />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

/* -------- Components -------- */

function Section({ title, children, width, fontScale }) {
  return (
    <View style={[styles.section, { width }]}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { fontSize: vh(1.8) * fontScale }]}>
          {title}
        </Text>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function GameItem({ icon, text, color, onPress, fontScale }) {
  return (
    <Pressable onPress={onPress} style={[styles.item, { backgroundColor: color }]}>
      <View style={styles.itemLeft}>
        <Ionicons name={icon} size={vh(2.5) * fontScale} color="#222" />
        <Text style={[styles.itemText, { fontSize: vh(1.5) * fontScale }]}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={vh(2.3) * fontScale} color="#22313F99" />
    </Pressable>
  );
}

/* -------- Styles -------- */
const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    alignItems: "center",
    paddingTop: vh(1.2),
    paddingBottom: vh(11),
  },

  header: {
    alignItems: "center",
    marginBottom: vh(2.5),
    marginTop: vh(2.5),
  },
  headerTitle: {
    fontWeight: "800",
    color: "#222",
    marginTop: Platform.OS === "ios" ? vh(3) : vh(4.5),
  },
  headerSub: { color: "#667085", marginTop: vh(0.5) },

  section: { marginTop: vh(1) },
  sectionHeader: { alignItems: "center", marginBottom: vh(1.2) },
  sectionTitle: {
    backgroundColor: "#F2F4F7",
    paddingHorizontal: vh(1.5),
    paddingVertical: vh(0.9),
    borderRadius: vh(1.4),
    fontWeight: "700",
    color: "#263238",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: vh(2),
    padding: vh(1),
    gap: vh(1.2),
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: vh(1.2),
    shadowOffset: { width: 0, height: vh(0.6) },
    elevation: 3,
  },

  item: {
    borderRadius: vh(1.8),
    paddingVertical: vh(1.6),
    paddingHorizontal: vh(1.2),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", columnGap: vh(1) },
  itemText: { fontWeight: "600", color: "#22313F" },
});
