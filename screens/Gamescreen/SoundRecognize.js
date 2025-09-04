// screens/Gamescreen/SoundRecognize.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ORANGE = '#ff7f32';
const GREEN = '#10B981';
const RED = '#EF4444';

const sounds = [
  { file: require('../../assets/sounds/Dog.mp3'), answer: 'หมา' },
  { file: require('../../assets/sounds/Cat.mp3'), answer: 'แมว' },
  { file: require('../../assets/sounds/Car.mp3'), answer: 'รถยนต์' },
  { file: require('../../assets/sounds/Bird.mp3'), answer: 'นก' },
  { file: require('../../assets/sounds/Horse.mp3'), answer: 'ม้า' },
  { file: require('../../assets/sounds/Rain.mp3'), answer: 'ฝน' },
  { file: require('../../assets/sounds/Sheep.mp3'), answer: 'แกะ' },
];

// utils
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function generateChoices(correctAnswer) {
  const wrongAnswers = sounds.map((s) => s.answer).filter((a) => a !== correctAnswer);
  const randomWrongs = shuffleArray(wrongAnswers).slice(0, 2);
  return shuffleArray([correctAnswer, ...randomWrongs]);
}

const AUTO_NEXT_DELAY = 800;
const MAX_ROUNDS = 5;

export default function SoundRecognize({ navigation }) {
  const insets = useSafeAreaInsets();

  // phases: 'intro' | 'quiz' | 'result'
  const [phase, setPhase] = useState('intro');

  const [currentSound, setCurrentSound] = useState(
    sounds[Math.floor(Math.random() * sounds.length)]
  );
  const [sound, setSound] = useState(null);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const [choices, setChoices] = useState(generateChoices(currentSound.answer));
  const [selected, setSelected] = useState(null); // string
  const [isCorrect, setIsCorrect] = useState(null); // true/false/null

  const [history, setHistory] = useState([]); // [{answer, chosen, correct:bool}]

  // โหลด/เล่นเสียง
  async function playSound() {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      const { sound: newSound } = await Audio.Sound.createAsync(currentSound.file);
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.warn('playSound error:', e);
    }
  }

  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  const startGame = () => {
    const first = sounds[Math.floor(Math.random() * sounds.length)];
    setCurrentSound(first);
    setChoices(generateChoices(first.answer));
    setRound(1);
    setScore(0);
    setSelected(null);
    setIsCorrect(null);
    setHistory([]);
    setPhase('quiz');
  };

  const goNext = () => {
    if (round >= MAX_ROUNDS) {
      setPhase('result');
      return;
    }
    const next = sounds[Math.floor(Math.random() * sounds.length)];
    setCurrentSound(next);
    setChoices(generateChoices(next.answer));
    setRound((r) => r + 1);
    setSelected(null);
    setIsCorrect(null);
  };

  const checkAnswer = async (choice) => {
    if (selected) return;
    const correct = currentSound.answer;
    const ok = choice === correct;

    setSelected(choice);
    setIsCorrect(ok);
    setHistory((h) => [...h, { answer: correct, chosen: choice, correct: ok }]);
    if (ok) setScore((s) => s + 1);

    try {
      if (sound) await sound.stopAsync();
    } catch {}

    setTimeout(() => {
      goNext();
    }, AUTO_NEXT_DELAY);
  };

  /* INTRO */
  if (phase === 'intro') {
    return (
      <View
        style={[
          styles.safeWrap,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16,
          },
        ]}
      >
        <View style={styles.topbar}>
          <Ionicons name="headset" size={24} color={ORANGE} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>เกมฟังเสียง</Text>
        </View>

        <ScrollView contentContainerStyle={styles.introWrap}>
          <View style={styles.introCard}>
            <View style={styles.introRow}>
              <Ionicons name="musical-notes-outline" size={22} color={ORANGE} />
              <Text style={styles.introText}>กดปุ่ม “เล่นเสียง” เพื่อฟังเสียงตัวอย่าง</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="hand-right-outline" size={22} color={ORANGE} />
              <Text style={styles.introText}>เลือกคำตอบที่ตรงกับเสียงมากที่สุด</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="checkmark-circle-outline" size={22} color={GREEN} />
              <Text style={styles.introText}>ตอบถูก = ปุ่มเป็นสีเขียว</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="close-circle-outline" size={22} color={RED} />
              <Text style={styles.introText}>ตอบผิด = ปุ่มเป็นสีแดง</Text>
            </View>
            <View style={styles.introRow}>
              <Ionicons name="albums-outline" size={22} color={ORANGE} />
              <Text style={styles.introText}>ทั้งหมด {MAX_ROUNDS} รอบ ระบบจะนับคะแนนให้</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>เริ่มเกม</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  /* RESULT */
  if (phase === 'result') {
    return (
      <View
        style={[
          styles.safeWrap,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left + 16,
            paddingRight: insets.right + 16,
          },
        ]}
      >
        <View style={styles.topbar}>
          <Ionicons name="flag-outline" size={24} color={ORANGE} style={{ marginRight: 8 }} />
          <Text style={styles.topbarTitle}>สรุปผล</Text>
        </View>

        <Text style={styles.title}>คุณได้ {score} / {MAX_ROUNDS} คะแนน</Text>

        <View style={styles.resultBar}>
          <View style={[styles.resultFill, { width: `${(score / MAX_ROUNDS) * 100}%` }]} />
        </View>

        <View style={styles.resultList}>
          {history.map((h, idx) => (
            <View key={idx} style={styles.resultItem}>
              <Text style={styles.resultLabel}>ข้อ {idx + 1} • เสียง: {h.answer}</Text>
              <View style={[styles.badge, h.correct ? styles.badgeOk : styles.badgeNo]}>
                <Text style={styles.badgeText}>{h.correct ? 'ถูก' : 'ผิด'}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={startGame} activeOpacity={0.9}>
          <Text style={styles.primaryBtnText}>เล่นอีกครั้ง</Text>
        </TouchableOpacity>
      </View>
    );
  }

  /* QUIZ */
  return (
    <View
      style={[
        styles.safeWrap,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left + 16,
          paddingRight: insets.right + 16,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.badgeSolid}>
          <Text style={styles.badgeSolidText}>รอบ {round}/{MAX_ROUNDS}</Text>
        </View>
        <View style={styles.badgeOutline}>
          <Text style={styles.badgeOutlineText}>คะแนน {score}</Text>
        </View>
      </View>

      <Text style={styles.title}>ฟังเสียงอะไรเอ่ย?</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={playSound} activeOpacity={0.9}>
        <Text style={styles.primaryBtnText}>▶️ เล่นเสียง</Text>
      </TouchableOpacity>

      <View style={styles.choices}>
        {choices.map((c) => {
          const isChosen = selected === c;
          const showGreen = isChosen && isCorrect === true;
          const showRed = isChosen && isCorrect === false;
          return (
            <TouchableOpacity
              key={c}
              style={[
                styles.choiceBtn,
                showGreen && { backgroundColor: '#d4f8e8', borderColor: GREEN },
                showRed && { backgroundColor: '#ffe3e3', borderColor: RED },
                selected && !isChosen && { opacity: 0.6 },
              ]}
              onPress={() => checkAnswer(c)}
              activeOpacity={0.9}
              disabled={!!selected}
            >
              <Text
                style={[
                  styles.choiceText,
                  showGreen && { color: '#065F46' },
                  showRed && { color: '#991B1B' },
                ]}
              >
                {c}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selected && (
        <Text style={[styles.feedback, isCorrect ? styles.ok : styles.no]}>
          {isCorrect ? '✅ ถูกต้อง!' : '❌ ไม่ถูกต้อง'}
        </Text>
      )}
    </View>
  );
}

/* =========================
   Styles
   ========================= */
const styles = StyleSheet.create({
  safeWrap: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingTop: 16,
  },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    marginBottom: 8,
  },
  topbarTitle: { fontSize: 24, fontWeight: '900', color: ORANGE },

  introWrap: { padding: 18, alignItems: 'center', width: '100%' },
  introCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFD2A3',
    padding: 18,
    width: '100%',
    marginBottom: 14,
  },
  introRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  introText: { fontSize: 18, color: '#4A3726', flexShrink: 1, lineHeight: 26 },

  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  badgeSolid: {
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeSolidText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  badgeOutline: {
    borderWidth: 2,
    borderColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeOutlineText: { color: ORANGE, fontWeight: '800', fontSize: 16 },

  title: {
    fontSize: 26,
    fontWeight: '800',
    color: ORANGE,
    textAlign: 'center',
    marginBottom: 8,
  },

  primaryBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
    minWidth: 220,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  primaryBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },

  choices: { width: '100%', paddingHorizontal: 8, marginTop: 4 },
  choiceBtn: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  choiceText: { color: '#222', fontSize: 18, fontWeight: '800' },

  feedback: { marginTop: 10, fontSize: 18, fontWeight: '800' },
  ok: { color: GREEN },
  no: { color: RED },

  scoreText: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#333' },
  resultBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 14,
  },
  resultFill: { height: '100%', backgroundColor: GREEN },
  resultList: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E9F0',
    marginBottom: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultLabel: { fontSize: 16, color: '#222' },
  badge: {
    minWidth: 64,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
  },
  badgeOk: { backgroundColor: '#d4f8e8' },
  badgeNo: { backgroundColor: '#ffe3e3' },
  badgeText: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
});
