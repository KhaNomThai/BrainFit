import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, ScrollView, Dimensions } from 'react-native';

export default function App({ navigation }) {
    const [loading, setLoading] = useState(false);

    const Next = () => {
        setLoading(true);
        navigation.replace("login");
        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Image 
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
            />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Text style={styles.article}>
                    “Brain Fit พิชิตความจำเสื่อม” เป็นแอปพลิเคชันช่วยป้องกันความจำเสื่อม 
                    ผ่านการติดตามพฤติกรรมประจำวัน การทำแบบประเมิน สมรรถภาพการรู้คิด 6 ข้อ (6CIT) 
                    ที่ผู้ใช้งานสามารถทำแบบประเมินได้ด้วยตนเอง การเล่นเกมกระตุ้นสมอง 
                    และการตั้งค่าการเเจ้งเตือนกิจกรรมสำคัญ
                </Text>

                <Text style={styles.article}>
                    {"\n"}การใช้งานแอป{"\n"}
                    1. เข้าสู่ระบบบัญชีผู้ใช้งาน{"\n"}
                    2. ประเมินกิจกรรมประจำวันของผู้ใช้งาน{"\n"}
                    3. ทำแบบประเมินสมรรถภาพการรู้คิด 6 ข้อ (6CIT){"\n"}
                    4. เล่นเกมกระตุ้นสมองในแต่ละเกม
                </Text>

                <Text style={styles.article}>
                    ⏱ ใช้เวลาในการเล่นเกม 30 นาที/วัน{"\n"}
                    *หมายเหตุ: การใช้งานแอปพลิเคชันไม่มีการเสียค่าใช้จ่ายใดใด
                </Text>

                <TouchableOpacity style={styles.Btn} onPress={Next}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.BtnText}>เริ่มต้น</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}



const { width, height } = Dimensions.get("window");
const vh = (value) => (height * value) / 100;
const vw = (value) => (width * value) / 100;
const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        alignItems: "center",
        paddingHorizontal: vw(7),
        paddingVertical: vh(3),
        backgroundColor: "#fdfdfd",
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
        fontSize: vw(3.5),
        color: "#333",
        lineHeight: vh(3.5),
        textAlign: "justify",
        marginBottom: vh(3),
    },
    Btn: {
        backgroundColor: "#0723c5",
        paddingVertical: vh(1.5),
        borderRadius: vw(3),
        alignItems: "center",
        marginBottom: vh(3),
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    BtnText: { 
        color: "#fff", 
        fontSize: vh(1.8),  
        fontWeight: "bold",
    },
});
