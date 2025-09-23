import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  ScrollView, 
  Dimensions, 
  Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function App({ navigation }) {
  const [loading, setLoading] = useState(false);

  const Next = () => {
    setLoading(true);
    navigation.replace("login");
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo */}
        <Image 
          source={require("../../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Scrollable Content */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.article} allowFontScaling>
            “Brain Fit พิชิตความจำเสื่อม” เป็นแอปพลิเคชันช่วยป้องกันความจำเสื่อม 
            ผ่านการติดตามพฤติกรรมประจำวัน การทำแบบประเมิน สมรรถภาพการรู้คิด 6 ข้อ (6CIT) 
            ที่ผู้ใช้งานสามารถทำแบบประเมินได้ด้วยตนเอง การเล่นเกมกระตุ้นสมอง 
            และการตั้งค่าการเเจ้งเตือนกิจกรรมสำคัญ
          </Text>

          <Text style={styles.article} allowFontScaling>
            {"\n"}การใช้งานแอป{"\n"}
            1. เข้าสู่ระบบบัญชีผู้ใช้งาน{"\n"}
            2. ประเมินกิจกรรมประจำวันของผู้ใช้งาน{"\n"}
            3. ทำแบบประเมินสมรรถภาพการรู้คิด 6 ข้อ (6CIT){"\n"}
            4. เล่นเกมกระตุ้นสมองในแต่ละเกม
          </Text>

          <Text style={styles.article} allowFontScaling>
            ⏱ ใช้เวลาในการเล่นเกม 30 นาที/วัน{"\n"}
            *หมายเหตุ: การใช้งานแอปพลิเคชันไม่มีการเสียค่าใช้จ่ายใดใด
          </Text>

          {/* Button */}
          <TouchableOpacity 
            style={styles.Btn} 
            onPress={Next} 
            activeOpacity={0.8}
            {...(Platform.OS === "android" && {
              android_ripple: { color: "#ffffff33", borderless: false }
            })}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.BtnText} allowFontScaling>เริ่มต้น</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* Responsive Size */
const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;

/* Cross-Platform Font */
const crossPlatformFont = Platform.select({
  ios: "System",       // San Francisco
  android: "Roboto",   // Roboto
  web: "Arial",        // หรือใช้ "sans-serif"
  default: "System",
});

/* Cross-Platform Shadow */
const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  android: { elevation: 4 },
  default: {},
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fdfdfd" },
  container: { 
    flex: 1, 
    alignItems: "center",
    paddingHorizontal: vw(7),
    paddingVertical: vh(3),
  },
  logo: {
    width: vw(80),
    height: vh(18),
    marginTop: vh(6),
    marginBottom: vh(3),
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  article: {
  fontSize: vh(2.2), 
  color: "#333",
  lineHeight: vw(4) * 1.5,  
  textAlign: "left",   
  marginBottom: vh(2),
  fontFamily: crossPlatformFont, 
},

  Btn: {
    backgroundColor: "#0723c5",
    paddingVertical: vh(1.5),
    borderRadius: vw(3),
    alignItems: "center",
    marginBottom: vh(3),
    ...cardShadow,
  },
  BtnText: { 
    color: "#fff", 
    fontSize: vh(1.9),  
    fontWeight: "bold",
    fontFamily: crossPlatformFont,
  },
});
