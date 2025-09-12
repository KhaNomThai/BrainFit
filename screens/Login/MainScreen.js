import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ImageBackground, ScrollView } from 'react-native';

export default function App({navigation}) {
    const [loading, setLoading] = useState(false);

    const Next = () => {
        setLoading(true);
        navigation.replace("login"); 
        setLoading(false);
    }
    return (
        <ImageBackground
            source={require("../../assets/logo.png")} // ใส่รูป background
            style={{ flex: 1 }}
            resizeMode="cover"
        >
            <View style={styles.form}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
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
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    form: { 
        flex: 1, 
        justifyContent: "flex-end",
        padding: 30,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "flex-end",
    },
    article: {
        fontSize: 16,
        color: "#444",
        lineHeight: 24,
        textAlign: "justify",
        marginBottom: 10,
    },
    Btn: {
        backgroundColor: "#0723c5ff",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 130,
        marginBottom: 30,
        width: "100%",
    },
    BtnText: { 
        color: "#fff", 
        fontSize: 16, 
        fontWeight: "bold" 
    },
});
