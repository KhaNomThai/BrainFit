import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function GameScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 เลือกเกมที่คุณอยากเล่น</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("FastMath")}
      >
        <Text style={styles.buttonText}>🧮 เกมคณิตคิดเร็ว</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("MemoryGame")}
      >
        <Text style={styles.buttonText}>🧠 เกมจับคู่ความจำ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("ReactionGame")}
      >
        <Text style={styles.buttonText}>⚡ เกมวัดความเร็วปฏิกิริยา</Text>
      </TouchableOpacity>

       <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("SoundRecognize")}
      >
        <Text style={styles.buttonText}>🎵 เกมทายเสียง</Text>
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 30 },
  button: {
    backgroundColor: "#008080",
    padding: 15,
    borderRadius: 12,
    marginVertical: 10,
    width: "70%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
