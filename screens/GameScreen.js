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
} from "react-native";

export default function GameScreen({ navigation }) {
  const { width } = useWindowDimensions();

  // --- ค่าตอบสนองต่อขนาดจอ ---
  const H_PADDING = 16;                     // ระยะขอบซ้ายขวา
  const MAX_CARD_WIDTH = 420;               // กว้างสุดของการ์ด section
  const CARD_WIDTH = Math.min(width - H_PADDING * 2, MAX_CARD_WIDTH);

  const isSmall = width < 360;
  const isTablet = width >= 768;

  const fontScale = isTablet ? 1.15 : isSmall ? 0.92 : 1;

  return (
    <SafeAreaView style={styles.bg}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingHorizontal: H_PADDING }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontSize: 22 * fontScale }]}>เกมฝึกสมอง</Text>
          <Text style={[styles.headerSub, { fontSize: 14 * fontScale }]}> เลือกเกมที่ต้องการเล่น</Text>
        </View>

        {/* Section: Registration */}
        <Section title="Registration" width={CARD_WIDTH} fontScale={fontScale}>
          <GameItem
            icon="🔤"
            text="เกมจับคู่คำ"
            color="#DCE6FF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("WordCatch")}
          />
          <GameItem
            icon="🪢"
            text="เกมจับคู่ความสัมพันธ์"
            color="#E7E9FF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("RelationMatch")}
          />
          <GameItem
            icon="🎧"
            text="เกมฟังเสียง"
            color="#EADAF0"
            fontScale={fontScale}
            onPress={() => navigation.navigate("SoundRecognize")}
          />
        </Section>

        {/* Section: Attention or Calculation */}
        <Section title="Attention or Calculation" width={CARD_WIDTH} fontScale={fontScale}>
          <GameItem
            icon="🔍"
            text="เกมหาของในภาพ"
            color="#DFF7E5"
            fontScale={fontScale}
            onPress={() => navigation.navigate("MemoryGame")}
          />
          <GameItem
            icon="🧮"
            text="เกมคณิตคิดเร็ว"
            color="#FFE3CF"
            fontScale={fontScale}
            onPress={() => navigation.navigate("FastMath")}
          />
          <GameItem
            icon="🔢"
            text="เกมจับคู่จำนวนกับภาพ"
            color="#FFF1C9"
            fontScale={fontScale}
            onPress={() => navigation.navigate("ReactionGame")}
          />
        </Section>

        {/* Section: Recall */}
        <Section title="Recall" width={CARD_WIDTH} fontScale={fontScale}>
          <GameItem
            icon="🖼️"
            text="เกมจำภาพ"
            color="#FAD7E2"
            fontScale={fontScale}
            onPress={() => navigation.navigate("ImageMemory")}
          />
          <GameItem
            icon="📖"
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
        <Text style={[styles.sectionTitle, { fontSize: 14 * fontScale }]}>{title}</Text>
      </View>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function GameItem({ icon, text, color, onPress, fontScale }) {
  return (
    <Pressable onPress={onPress} style={[styles.item, { backgroundColor: color }]}>
      <View style={styles.itemLeft}>
        <Text style={[styles.itemIcon, { fontSize: 18 * fontScale }]}>{icon}</Text>
        <Text style={[styles.itemText, { fontSize: 16 * fontScale }]}>{text}</Text>
      </View>
      <Text style={[styles.itemArrow, { fontSize: 16 * fontScale }]}>▶</Text>
    </Pressable>
  );
}

/* -------- Styles -------- */

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#FFFFFF" },
  container: {
    alignItems: "center",              // ทำให้ section อยู่กลางจอ
    paddingTop: 10,
    paddingBottom: 28,
  },

  header: { alignItems: "center", marginBottom: 30},
  headerTitle: { fontWeight: "800", color: "#222", marginTop: Platform.OS === "ios" ? 24 : 36 },
  headerSub: { color: "#667085", marginTop: 4 },

  section: { marginTop: 8 },
  sectionHeader: { alignItems: "center", marginBottom: 10 },
  sectionTitle: {
    backgroundColor: "#F2F4F7",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    fontWeight: "700",
    color: "#263238",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  item: {
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  itemLeft: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  itemIcon: { },
  itemText: { fontSize: 20 , fontWeight: "600", color: "#22313F" },
  itemArrow: { color: "#22313F99" },
});
