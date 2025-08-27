import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet,ImageBackground } from 'react-native';
import { Audio } from 'expo-av';

const sounds = [
  { file: require('../../assets/sounds/Dog.mp3'), answer: 'หมา' },
  { file: require('../../assets/sounds/Cat.mp3'), answer: 'แมว' },
  { file: require('../../assets/sounds/Car.mp3'), answer: 'รถยนต์' },
  { file: require('../../assets/sounds/Bird.mp3'), answer: 'นก' },
  { file: require('../../assets/sounds/Horse.mp3'), answer: 'ม้า' },
  { file: require('../../assets/sounds/Rain.mp3'), answer: 'ฝน' },
  { file: require('../../assets/sounds/Sheep.mp3'), answer: 'แกะ' },
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// สุ่มตัวเลือก 3 ตัว โดยรวมคำตอบถูก
function generateChoices(correctAnswer) {
  const wrongAnswers = sounds
    .map(s => s.answer)
    .filter(a => a !== correctAnswer);
  const randomWrongs = shuffleArray(wrongAnswers).slice(0, 2);
  return shuffleArray([correctAnswer, ...randomWrongs]);
}

export default function SoundRecognize() {
  const [sound, setSound] = useState(null);
  const [currentSound, setCurrentSound] = useState(sounds[Math.floor(Math.random() * sounds.length)]);
  const [score, setScore] = useState(0);
  const [choices, setChoices] = useState(generateChoices(currentSound.answer));
  const [round, setRound] = useState(1);
  const maxRounds = 5;

  async function playSound() {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync(currentSound.file);
    setSound(newSound);
    await newSound.playAsync();
  }

  function checkAnswer(choice) {
    const correct = currentSound.answer;

    if (choice === correct) {
      setScore(score + 1);
      Alert.alert('✅ ถูกต้อง!', `มันคือเสียง ${correct}`);
    } else {
      Alert.alert('❌ ผิดแล้ว!', `คำตอบที่ถูกคือ ${correct}`);
    }

    if (round >= maxRounds) {
      // จบเกม
      Alert.alert('🏁 จบเกม', `คุณได้คะแนน ${score + (choice === correct ? 1 : 0)} / ${maxRounds}`);
       Alert.alert('ไปเล่นเกมอื่นได้เลยย')
      // รีเซ็ตเกม
      setScore(0);
      setRound(1);
    } else {
      // ไปรอบถัดไป
      const nextSound = sounds[Math.floor(Math.random() * sounds.length)];
      setCurrentSound(nextSound);
      setChoices(generateChoices(nextSound.answer));
      setRound(round + 1);
    }
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <ImageBackground
    source={require('../../assets/background.jpg')}
    style={styles.container}
    resizeMode="cover"
    >
    
    <View style={styles.container}>
      <Text style={styles.score}>รอบ {round} / {maxRounds} - คะแนน: {score}</Text>

      <TouchableOpacity style={styles.playButton} onPress={playSound}>
        <Text style={styles.playButtonText}>▶️ เล่นเสียง</Text>
      </TouchableOpacity>

      <View style={styles.choicesContainer}>
        {choices.map(choice => (
          <TouchableOpacity
            key={choice}
            style={styles.choiceButton}
            onPress={() => checkAnswer(choice)}
          >
            <Text style={styles.choiceText}>{choice}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
    justifyContent: 'top',
    alignItems: 'center',
    padding: 20,
    
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 80,
    color: 'white',
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 80,
  },
  playButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  choicesContainer: {
    width: '80%',
  },
  choiceButton: {
    backgroundColor: '#ff7f32',
    paddingVertical: 12,
    marginVertical: 20,
    paddingHorizontal: 45,
    borderRadius: 10,
    alignItems: 'center',
  },
  choiceText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
