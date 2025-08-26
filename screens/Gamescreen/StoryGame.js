// screens/Gamescreen/StoryGame.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";

/** =========================
 * CONFIG
 * ========================= */
const QUESTION_TIME = 30;     // วินาทีต่อข้อ
const AUTO_NEXT_DELAY = 700;  // ms หลังตอบ
const SHUFFLE_CHOICES = true; // สุ่มตัวเลือกทุกครั้ง

/** =========================
 * STORIES (ครบ 30 เรื่อง x 3 คำถาม = 90 ข้อ)
 * ========================= */
const STORIES = [
  {
    id: "1",
    title: "ยายบัวไปตลาดหน้าวัด",
    body:
      "เช้าวันจันทร์ ยายบัวตื่นแต่เช้า อาบน้ำแต่งตัว ใส่ผ้าซิ่นผืนเก่า เดินไปตลาดหน้าวัด " +
      "แวะซื้อกล้วย 1 หวี ผักบุ้ง 2 มัด และปลาทู 3 ตัว ระหว่างเดินกลับบ้านเจอลูกหลาน จึงแบ่งของไปให้ " +
      "จากนั้นชงกาแฟแล้วนั่งพักใต้ต้นมะม่วงหน้าบ้าน",
    qas: [
      { id: "1.1", prompt: "ยายบัวไปตลาดวันอะไร?", choices: ["วันอังคาร", "วันอาทิตย์", "วันจันทร์", "วันศุกร์"], correctIndex: 2 },
      { id: "1.2", prompt: "ยายบัวซื้อปลาทูกี่ตัว?", choices: ["3 ตัว", "1 ตัว", "5 ตัว", "ไม่ได้ซื้อ"], correctIndex: 0 },
      { id: "1.3", prompt: "ยายบัวเจอใครระหว่างเดินกลับ?", choices: ["เพื่อนข้างบ้าน", "ลูกหลาน", "พี่ชาย", "น้องสาว"], correctIndex: 1 },
    ],
  },
  {
    id: "2",
    title: "เจ้าเขียวในสวนหลังบ้าน",
    body:
      "เช้าวันหนึ่ง นกแก้วชื่อเจ้าเขียว บินออกจากกรงไปเล่นที่สวนหลังบ้าน พบดอกทานตะวันสีเหลืองและผีเสื้อบินรอบๆ " +
      "ต่อมามีเด็กผู้หญิงชื่อพลอยออกมาให้อาหารด้วยเมล็ดทานตะวัน",
    qas: [
      { id: "2.1", prompt: "นกแก้วชื่ออะไร?", choices: ["เจ้าเหมียว", "เจ้าขุนทอง", "เจ้าขุน", "เจ้าเขียว"], correctIndex: 3 },
      { id: "2.2", prompt: "นกแก้วบินไปที่ไหน?", choices: ["บนหลังคา", "สวนหลังบ้าน", "ในบ้าน", "สวนสาธารณะ"], correctIndex: 1 },
      { id: "2.3", prompt: "ดอกไม้ที่เจอคืออะไร?", choices: ["ลิลลี่", "บานไม่รู้โรย", "ทานตะวันสีเหลือง", "กุหลาบสีแดง"], correctIndex: 2 },
    ],
  },
  {
    id: "3",
    title: "ลุงบุญมานะเยี่ยมลูกชาย",
    body:
      "ลุงบุญมานะนั่งรถทัวร์เข้ากรุงเทพฯ ไปเยี่ยมลูกชายที่ทำงานเป็นพนักงานบริษัท ถึงสถานีตอนเช้า ลูกชายมารับ " +
      "พาไปกินก๋วยเตี๋ยว เดินห้าง ซื้อรองเท้าให้พ่อ 1 คู่ และบอกว่าจะพาไปทะเลครั้งหน้า",
    qas: [
      { id: "3.1", prompt: "ลุงบุญมานะไปที่ไหน?", choices: ["กรุงเทพ", "นนทบุรี", "อยุธยา", "สุพรรณบุรี"], correctIndex: 0 },
      { id: "3.2", prompt: "ลูกชายทำงานอะไร?", choices: ["ขายกาแฟ", "ขายเสื้อผ้า", "พนักงานบริษัท", "พนักงานโรงงาน"], correctIndex: 2 },
      { id: "3.3", prompt: "ลูกชายซื้ออะไรให้พ่อ?", choices: ["เสื้อ 1 ตัว", "กางเกง 1 ตัว", "รองเท้า 1 คู่", "หมวก 1 ใบ"], correctIndex: 2 },
    ],
  },
  {
    id: "4",
    title: "เช้าวันสงกรานต์ที่บ้านยาย",
    body:
      "เช้าวันสงกรานต์ ลูกๆ หลานๆ กลับมาพร้อมหน้าเพื่อรดน้ำดำหัว ยายเตรียมขันน้ำอบและดอกมะลิ " +
      "หลานชายชื่อบอลช่วยแม่ทำกับข้าว หลานสาวชื่อแนนช่วยจัดโต๊ะอาหาร เมื่อถึงเวลา ทุกคนผลัดกันรดน้ำขอพรจากยาย",
    qas: [
      { id: "4.1", prompt: "งานที่เล่าเกิดขึ้นวันอะไร?", choices: ["ลอยกระทง", "สงกรานต์", "ขึ้นปีใหม่", "วันพระ"], correctIndex: 1 },
      { id: "4.2", prompt: "เตรียมอะไรสำหรับพิธีรดน้ำดำหัว?", choices: ["ขนมหวาน", "อาหารคาว", "ขันน้ำอบและดอกมะลิ", "น้ำธรรมดา"], correctIndex: 2 },
      { id: "4.3", prompt: "ใครช่วยทำกับข้าว?", choices: ["หลานชาย", "หลานสาว", "ลูก", "ญาติ"], correctIndex: 0 },
    ],
  },
  {
    id: "5",
    title: "ใส่บาตรเช้าวันอาทิตย์",
    body:
      "เช้าวันอาทิตย์ ลุงสมกับป้าเดือนตื่นตั้งแต่ตีห้า เตรียมกับข้าวใส่บาตร นั่งรถสองแถวไปวัด ใส่บาตร ฟังเทศน์ แล้วช่วยกันกวาดลานวัด " +
      "เด็กๆ แถวนั้นมาช่วยด้วย ก่อนกลับบ้านด้วยความสุขใจ",
    qas: [
      { id: "5.1", prompt: "ตื่นกี่โมง?", choices: ["ตีสี่", "ตีห้า", "หกโมง", "เจ็ดโมง"], correctIndex: 1 },
      { id: "5.2", prompt: "เดินทางไปวัดด้วยอะไร?", choices: ["รถสองแถว", "รถกระบะ", "รถเมล์", "มอเตอร์ไซค์"], correctIndex: 0 },
      { id: "5.3", prompt: "ใครมาช่วยกวาดลานวัด?", choices: ["ลูกสาว", "เด็กๆ", "เพื่อนบ้าน", "ญาติ"], correctIndex: 1 },
    ],
  },
  {
    id: "6",
    title: "งานแต่งของหลานสาว",
    body:
      "ครอบครัวของตายอดไปร่วมงานแต่งหลานสาวชื่อ “ดาว” เจ้าสาวใส่ชุดไทยสีชมพูอ่อน เจ้าบ่าวชื่อ “ต้น” ใส่ชุดสูทสีครีม " +
      "พิธีทำบุญ รดน้ำสังข์ ผู้ใหญ่ให้พร เที่ยงเลี้ยงโต๊ะจีน มีแกงจืด ปลาทอด และขนมหวานชื่อดังของหมู่บ้าน",
    qas: [
      { id: "6.1", prompt: "งานที่เล่าคืองานอะไร?", choices: ["วันเกิด", "ขึ้นบ้านใหม่", "งานแต่ง", "งานหมั้น"], correctIndex: 2 },
      { id: "6.2", prompt: "เจ้าบ่าวชื่ออะไรและใส่ชุดแบบไหน?", choices: ["ตี๋-สูทครีม", "ต๋อง-สูทชมพู", "ตูมตาม-สูทเทา", "ต้น-สูทครีม"], correctIndex: 3 },
      { id: "6.3", prompt: "อาหารที่เลี้ยงแขกมีอะไร?", choices: ["แกงจืด ปลาทอด และขนมหวาน", "ขนมจีนน้ำยาป่า ขนมตาล", "ก๋วยเตี๋ยว ไอศกรีม", "ปลาทอด ไอศกรีม ขนมหวาน"], correctIndex: 0 },
    ],
  },
  {
    id: "7",
    title: "ฤดูเกี่ยวข้าว",
    body:
      "ในฤดูเกี่ยวข้าว ชาวบ้านช่วยกันลงนา ตายงพาหลานๆ ไปช่วย หลานชายชื่อต้องถือเคียว หลานสาวชื่อฝนช่วยมัดฟ่อน " +
      "เสร็จงานกินข้าวกลางวันใต้ต้นไม้ คุยและหัวเราะกันอย่างสนุกสนาน",
    qas: [
      { id: "7.1", prompt: "เรื่องนี้เกิดขึ้นในฤดูอะไร?", choices: ["ฤดูเกี่ยวข้าว", "ฤดูฝน", "ฤดูร้อน", "ฤดูเก็บมังคุด"], correctIndex: 0 },
      { id: "7.2", prompt: "ตายงพาหลานไปทำกิจกรรมอะไร?", choices: ["เก็บผัก", "เก็บมังคุด", "จับปลา", "เกี่ยวข้าว"], correctIndex: 3 },
      { id: "7.3", prompt: "ฝนช่วยทำอะไร?", choices: ["ถือเคียว", "ถือกระสอบ", "มัดฟ่อนข้าว", "แจกข้าว"], correctIndex: 2 },
    ],
  },
  {
    id: "8",
    title: "งานวันเกิดเพื่อนเก่า",
    body:
      "ป้าแสงได้รับเชิญไปงานวันเกิดเพื่อนเก่าสมัยเรียนชื่อ “บุญเลิศ” มีร้องเพลงวันเกิด เป่าเค้ก ช่วงค่ำมีดนตรีสดแนวลูกกรุง " +
      "ทุกคนระลึกถึงสมัยก่อนและเต้นรำเล็กน้อย",
    qas: [
      { id: "8.1", prompt: "เจ้าของวันเกิดชื่ออะไร?", choices: ["บุญชอบ", "บุญเลิศ", "บุญมี", "บุญเหลือ"], correctIndex: 1 },
      { id: "8.2", prompt: "กิจกรรมในงานมีอะไร?", choices: ["เต้นรำ", "ร้องเพลงและเป่าเค้ก", "เล่นเกม", "นอน"], correctIndex: 1 },
      { id: "8.3", prompt: "เพลงที่เล่นเป็นแนวอะไร?", choices: ["ลูกทุ่ง", "ลูกกรุง", "สากล", "คลาสสิก"], correctIndex: 1 },
    ],
  },
  {
    id: "9",
    title: "สวนครัวของลุงคำกับป้าสาย",
    body:
      "ลุงคำกับป้าสายปลูกผักสวนครัว เช่น พริก กะเพรา ตะไคร้ ตอนเช้าลุงคำรดน้ำ ป้าสายเก็บผักไปทำอาหารค่ำ " +
      "เพื่อนบ้านมาขอแบ่งผักบ่อยๆ ทั้งสองยินดีให้",
    qas: [
      { id: "9.1", prompt: "ใครทำสวน?", choices: ["ลูกสาวกับลูกชาย", "ลุงคำกับป้าสาย", "หลานชายกับเพื่อน", "เพื่อนบ้าน"], correctIndex: 1 },
      { id: "9.2", prompt: "ปลูกผักอะไรบ้าง?", choices: ["มะนาว พริก", "พริก กะเพรา ตะไคร้", "มะกรูด โหระพา", "ตะไคร้ ผักบุ้ง ถั่วฝักยาว"], correctIndex: 1 },
      { id: "9.3", prompt: "เพื่อนบ้านมาขออะไร?", choices: ["ปลา", "เสื้อผ้า", "ไข่ไก่", "ผัก"], correctIndex: 3 },
    ],
  },
  {
    id: "10",
    title: "งานบุญประจำปีที่วัด",
    body:
      "หมู่บ้านจัดงานบุญประจำปีที่วัด ทุกคนแต่งชุดไทย มีขบวนแห่กลองยาว ฟ้อนรำ ทำบุญตักบาตร " +
      "ตอนกลางวันประกวดทำอาหารพื้นบ้าน เช่น แกงหน่อไม้ น้ำพริก และข้าวจี่ ตอนเย็นมีการแสดงลิเก",
    qas: [
      { id: "10.1", prompt: "ทุกคนแต่งกายแบบไหน?", choices: ["ชุดไทย", "ชุดนอน", "ชุดราตรี", "ชุดสูท"], correctIndex: 0 },
      { id: "10.2", prompt: "ประกวดเมนูอะไรตอนกลางวัน?", choices: ["แกงหน่อไม้ น้ำพริก ข้าวจี่", "ขนมจีนแกงป่า พะโล้", "ข้าวเหนียวมะม่วง ขนมตาล", "ลอดช่อง บ้าบิ่น แกงเนื้อ"], correctIndex: 0 },
      { id: "10.3", prompt: "ตอนเย็นมีการแสดงอะไร?", choices: ["ดนตรีสด", "รำวงย้อนยุค", "ลิเก", "งิ้ว"], correctIndex: 2 },
    ],
  },

  // 11-30
  {
    id: "11",
    title: "พายเรือในบึงใกล้บ้าน",
    body:
      "ลุงชิตพาหลานๆ ไปพายเรือในบึงใกล้บ้าน ทุกคนใส่เสื้อชูชีพเพื่อความปลอดภัย หลานชายคนโตช่วยพาย " +
      "ส่วนหลานเล็กนั่งชมวิว ข้างทางมีดอกบัวบานสวยงาม เสร็จแล้วแวะซื้อไอศกรีมคลายร้อน",
    qas: [
      { id: "11.1", prompt: "ทำกิจกรรมอะไร?", choices: ["พายเรือ", "ปั่นจักรยาน", "นั่งรถเล่น", "นั่งเล่น"], correctIndex: 0 },
      { id: "11.2", prompt: "เพื่อความปลอดภัยทุกคนใส่อะไร?", choices: ["หมวกกันน็อค", "ถุงมือ", "เสื้อชูชีพ", "รองเท้าบูท"], correctIndex: 2 },
      { id: "11.3", prompt: "หลังพายเรือเสร็จทำอะไร?", choices: ["นั่งพัก", "กลับบ้าน", "กินไอศกรีม", "ถ่ายรูป"], correctIndex: 2 },
    ],
  },
  {
    id: "12",
    title: "ทอดกฐินวันออกพรรษา",
    body:
      "วันออกพรรษา ชาวบ้านจัดงานทอดกฐินที่วัดกลางหมู่บ้าน มีขบวนแห่ผ้าไตรพร้อมดนตรีพื้นบ้าน " +
      "ผู้เฒ่าผู้แก่เดินนำหน้าเพื่อความเป็นสิริมงคล หลังพิธีร่วมรับประทานอาหารและแบ่งขนมให้เด็กๆ",
    qas: [
      { id: "12.1", prompt: "งานนี้คืองานอะไร?", choices: ["วันเข้าพรรษา", "วันออกพรรษา", "วันลอยกระทง", "วันสงกรานต์"], correctIndex: 1 },
      { id: "12.2", prompt: "จัดที่ไหน?", choices: ["กลางหมู่บ้าน", "วัดกลางหมู่บ้าน", "ลานหน้าหมู่บ้าน", "สวนสาธารณะ"], correctIndex: 1 },
      { id: "12.3", prompt: "ขบวนแห่มีอะไรเด่น?", choices: ["รถแห่", "ขบวนนางรำ", "แตรวง", "แห่ผ้าไตรและดนตรีพื้นบ้าน"], correctIndex: 3 },
    ],
  },
  {
    id: "13",
    title: "หนังกลางแปลงคืนวันเสาร์",
    body:
      "คืนวันเสาร์ วัดในหมู่บ้านจัดฉายหนังกลางแปลง ผู้คนเอาเสื่อมาปูนั่งดู บางคนซื้อข้าวโพดคั่วและน้ำอัดลม " +
      "เด็กๆ วิ่งเล่นสนุกสนาน ผู้สูงอายุนั่งคุยกันระหว่างดูหนัง",
    qas: [
      { id: "13.1", prompt: "ฉายหนังที่ไหน?", choices: ["วัดในหมู่บ้าน", "ลานกลางหมู่บ้าน", "โรงเรียน", "สวน"], correctIndex: 0 },
      { id: "13.2", prompt: "ชาวบ้านนั่งดูด้วยอะไร?", choices: ["ม้าหิน", "เก้าอี้พับ", "ผ้าปู", "เสื่อ"], correctIndex: 3 },
      { id: "13.3", prompt: "ขนมยอดฮิตตอนดูหนังคืออะไร?", choices: ["ขนมกรุบกรอบ", "ยำมาม่า", "ข้าวโพดคั่วและน้ำอัดลม", "พิซซ่า"], correctIndex: 2 },
    ],
  },
  {
    id: "14",
    title: "ปลูกต้นไม้วันแม่",
    body:
      "วันแม่แห่งชาติ โรงเรียนประจำตำบลจัดกิจกรรมปลูกต้นไม้ นักเรียนพาคุณแม่มาร่วม " +
      "ทุกครอบครัวปลูกต้นมะม่วงหนึ่งต้น แล้วช่วยกันรดน้ำและถ่ายรูปร่วมกัน",
    qas: [
      { id: "14.1", prompt: "กิจกรรมจัดเนื่องในวันอะไร?", choices: ["วันพ่อ", "วันแม่", "วันครู", "วันเกิด"], correctIndex: 1 },
      { id: "14.2", prompt: "ปลูกต้นอะไร?", choices: ["ต้นมะม่วง", "ต้นมะลิ", "ต้นพุทธรักษา", "ต้นกล้วย"], correctIndex: 0 },
      { id: "14.3", prompt: "หลังปลูกเสร็จทำอะไร?", choices: ["กินข้าว", "กลับบ้าน", "นั่งเล่น", "รดน้ำและถ่ายรูป"], correctIndex: 3 },
    ],
  },
  {
    id: "15",
    title: "เที่ยวตลาดน้ำ",
    body:
      "ป้าสมใจพาหลานเที่ยวตลาดน้ำ พ่อค้าแม่ค้าพายเรือขายผลไม้ เช่น มะม่วง ชมพู่ และกล้วย " +
      "หลานอยากกินขนมไทยจึงซื้อขนมตาล ป้าสมใจได้ผ้าซิ่นผืนใหม่กลับบ้าน",
    qas: [
      { id: "15.1", prompt: "ไปเที่ยวที่ไหน?", choices: ["สวนสัตว์", "ตลาดน้ำ", "สวนน้ำ", "อควาเรียม"], correctIndex: 1 },
      { id: "15.2", prompt: "ขายของด้วยวิธีใด?", choices: ["ขับรถขาย", "เข็นรถขาย", "พายเรือขาย", "ตั้งแผง"], correctIndex: 2 },
      { id: "15.3", prompt: "ป้าสมใจซื้ออะไรกลับ?", choices: ["เสื้อ", "หมวก", "รองเท้า", "ผ้าซิ่น"], correctIndex: 3 },
    ],
  },
  {
    id: "16",
    title: "ซ้อมรำวงงานประจำปี",
    body:
      "ในงานประจำปีของหมู่บ้าน กลุ่มผู้สูงอายุรวมตัวกันซ้อมรำวงที่ศาลากลางบ้าน แต่งกายด้วยเสื้อผ้าสีสดใส " +
      "เปิดเพลงลูกทุ่งคลอ บรรยากาศสนุกสนาน",
    qas: [
      { id: "16.1", prompt: "ซ้อมกิจกรรมอะไร?", choices: ["เต้น", "รำวง", "เล่นดนตรี", "ทำกับข้าว"], correctIndex: 1 },
      { id: "16.2", prompt: "แต่งกายอย่างไร?", choices: ["เสื้อลูกไม้", "เสื้อลายดอก", "เสื้อสีดำ", "เสื้อผ้าสีสดใส"], correctIndex: 3 },
      { id: "16.3", prompt: "เพลงแนวใดที่เปิด?", choices: ["ลูกทุ่ง", "ลูกกรุง", "สากล", "ไทยเดิม"], correctIndex: 0 },
    ],
  },
  {
    id: "17",
    title: "ตรวจสุขภาพประจำปี",
    body:
      "ลุงทองมีนัดตรวจสุขภาพประจำปีที่โรงพยาบาล ลูกสาวเป็นคนพาไป ตรวจความดันโลหิตและเอ็กซเรย์ " +
      "หมอชมว่าสุขภาพดีขึ้น ลูกสาวดีใจมาก",
    qas: [
      { id: "17.1", prompt: "ใครไปโรงพยาบาล?", choices: ["ลุงทอง", "ลุงสมร", "ป้าสมศรี", "ลูกสาว"], correctIndex: 0 },
      { id: "17.2", prompt: "ใครเป็นคนพาไป?", choices: ["ญาติ", "ลูกสาว", "เพื่อนบ้าน", "หลานชาย"], correctIndex: 1 },
      { id: "17.3", prompt: "ตรวจอะไรบ้าง?", choices: ["ความดัน เบาหวาน", "ตรวจฟัน", "ความดันโลหิตและเอ็กซเรย์", "เลือดและตา"], correctIndex: 2 },
    ],
  },
  {
    id: "18",
    title: "วงดนตรีพื้นบ้าน",
    body:
      "คนเฒ่าคนแก่ในหมู่บ้านตั้งวงดนตรีพื้นบ้าน มีทั้งกลอง ฉิ่ง ฉาบ และซอ เด็กๆ ในหมู่บ้านมานั่งฟัง " +
      "บางคนเต้นตามจังหวะ ผู้เฒ่ารู้สึกภูมิใจที่สืบสานวัฒนธรรม",
    qas: [
      { id: "18.1", prompt: "ทำกิจกรรมอะไร?", choices: ["เล่นกีฬา", "นอนพัก", "นั่งเล่น", "ตั้งวงดนตรีพื้นบ้าน"], correctIndex: 3 },
      { id: "18.2", prompt: "เครื่องดนตรีที่ใช้มีอะไร?", choices: ["กลอง-แตร-กีตาร์", "ฉาบ-ฉิ่ง-แคน", "กลอง-ฉิ่ง-ฉาบ-ซอ", "แคน-ระนาด-กีตาร์"], correctIndex: 2 },
      { id: "18.3", prompt: "เด็กๆ มีปฏิกิริยาอย่างไร?", choices: ["นั่งฟัง", "วิ่งเล่น", "นอน", "เดินกลับบ้าน"], correctIndex: 0 },
    ],
  },
  {
    id: "19",
    title: "ทำขนมครกที่บ้าน",
    body:
      "ป้าสายชวนหลานทำขนมครก หลานช่วยหยอดแป้งลงกระทะ ป้าสายโรยหน้าด้วยต้นหอมและข้าวโพด " +
      "เมื่อสุก กลิ่นหอมอบอวลไปทั่วบ้าน ทุกคนนั่งกินด้วยกัน",
    qas: [
      { id: "19.1", prompt: "ทำขนมอะไร?", choices: ["ขนมบ้าบิ่น", "ทองหยอด", "ทองหยิบ", "ขนมครก"], correctIndex: 3 },
      { id: "19.2", prompt: "หลานทำหน้าที่อะไร?", choices: ["ผสมแป้ง", "แคะขนม", "หยอดแป้งลงกระทะ", "คนส่วนผสม"], correctIndex: 2 },
      { id: "19.3", prompt: "โรยหน้าอะไร?", choices: ["ข้าวโพด", "เผือก", "ไม่โรยหน้า", "ต้นหอมและข้าวโพด"], correctIndex: 3 },
    ],
  },
  {
    id: "20",
    title: "ไปดูนากับตายอดและตาเปล่ง",
    body:
      "เช้าวันหนึ่ง ตายอดกับตาเปล่งนั่งรถอีแต๋นไปดูนา ท้องทุ่งเต็มไปด้วยรวงข้าวสีเหลืองทอง ลมพัดเย็นสบาย " +
      "ทั้งสองนั่งพักใต้ต้นไม้ กินข้าวเหนียวกับไก่ทอดก่อนกลับบ้าน",
    qas: [
      { id: "20.1", prompt: "ไปที่ไหน?", choices: ["นา", "สวนผัก", "สวนผลไม้", "แอ่งน้ำ"], correctIndex: 0 },
      { id: "20.2", prompt: "ท้องทุ่งเต็มไปด้วยอะไร?", choices: ["แมลง", "ฝูงนก", "รวงข้าวสีเหลืองทอง", "ฝุ่น"], correctIndex: 2 },
      { id: "20.3", prompt: "กินอะไรใต้ต้นไม้?", choices: ["หมูทอดกับข้าวสวย", "ข้าวเหนียวกับปลาร้า", "แกงเนื้อกับข้าวสวย", "ข้าวเหนียวกับไก่ทอด"], correctIndex: 3 },
    ],
  },
  {
    id: "21",
    title: "ซ้อมร้องเพลงลูกกรุง",
    body:
      "ผู้สูงอายุในชมรมรวมตัวกันซ้อมร้องเพลงลูกกรุงเพื่อแสดงในงานปีใหม่ ทุกคนผลัดกันร้อง " +
      "มีครูสอนดนตรีมาช่วยปรับเสียง หลังซ้อมทานขนมและน้ำชา",
    qas: [
      { id: "21.1", prompt: "ซ้อมทำกิจกรรมอะไร?", choices: ["รำ", "เล่นกีฬา", "ร้องเพลง", "เล่นดนตรี"], correctIndex: 2 },
      { id: "21.2", prompt: "ซ้อมเพื่อแสดงในงานอะไร?", choices: ["วันเกิด", "ปีใหม่", "งานแต่ง", "งานวัด"], correctIndex: 1 },
      { id: "21.3", prompt: "ใครมาช่วยสอน?", choices: ["นายอำเภอ", "ครูสอนดนตรี", "ผู้ใหญ่บ้าน", "พยาบาล"], correctIndex: 1 },
    ],
  },
  {
    id: "22",
    title: "ร่วมงานศพที่วัด",
    body:
      "ยายแสงกับเพื่อนไปร่วมงานศพที่วัด ช่วยกันพับดอกไม้จันทน์และนั่งฟังพระสวด ตอนเย็นทานอาหารที่โรงทาน " +
      "มีแกงเขียวหวานและขนมหวาน",
    qas: [
      { id: "22.1", prompt: "ไปที่ไหน?", choices: ["บ้าน", "วัด", "โรงเรียน", "โรงพยาบาล"], correctIndex: 1 },
      { id: "22.2", prompt: "ช่วยกันทำอะไร?", choices: ["ทำกับข้าว", "จัดเก้าอี้", "ซื้อของ", "พับดอกไม้จันทน์"], correctIndex: 3 },
      { id: "22.3", prompt: "อาหารที่โรงทานมีอะไร?", choices: ["ข้าวต้ม", "ก๋วยเตี๋ยว", "แกงเขียวหวานและขนมหวาน", "ขนมจีนน้ำยา"], correctIndex: 2 },
    ],
  },
  {
    id: "23",
    title: "ผลไม้เต็มสวนของตาเพียร",
    body:
      "ในสวนของตาเพียรมีผลไม้ออกเต็มต้น เช่น มะม่วง ลำไย และกล้วย หลานๆ มาช่วยเก็บลงตะกร้า " +
      "ตอนเย็นนำไปขายที่ตลาด ได้เงินหลายร้อยบาท",
    qas: [
      { id: "23.1", prompt: "สวนของใคร?", choices: ["ป้าสมร", "ลูกชาย", "ลูกสาว", "ตาเพียร"], correctIndex: 3 },
      { id: "23.2", prompt: "ใครมาช่วยเก็บผลไม้?", choices: ["ลูกชาย", "หลาน", "คนงาน", "ลูกสาว"], correctIndex: 1 },
      { id: "23.3", prompt: "ผลไม้นำไปทำอะไร?", choices: ["กินเอง", "แปรรูป", "ขายที่ตลาด", "แจกญาติ"], correctIndex: 2 },
    ],
  },
  {
    id: "24",
    title: "ลุงดำเลี้ยงวัวควาย",
    body:
      "ลุงดำเลี้ยงวัวและควายในทุ่ง เช้าพาออกไปกินหญ้า เย็นต้อนกลับคอก หลานชายชอบไปช่วยถือไม้ต้อนสัตว์",
    qas: [
      { id: "24.1", prompt: "เลี้ยงสัตว์อะไร?", choices: ["หมา", "นกแก้ว", "แมว", "วัวและควาย"], correctIndex: 3 },
      { id: "24.2", prompt: "ตอนเย็นทำอะไร?", choices: ["พาไปกินหญ้า", "อาบน้ำให้", "ต้อนกลับคอก", "นั่งพัก"], correctIndex: 2 },
      { id: "24.3", prompt: "ใครไปช่วยลุงดำ?", choices: ["ลูกสาว", "เพื่อน", "หลานชาย", "ป้าสมหญิง"], correctIndex: 2 },
    ],
  },
  {
    id: "25",
    title: "เที่ยวทะเลสัตหีบ",
    body:
      "ครอบครัวหนึ่งไปเที่ยวทะเลที่สัตหีบ เด็กๆ เล่นน้ำทะเลอย่างสนุก ผู้ใหญ่นั่งกินส้มตำและปลาหมึกย่างริมชายหาด " +
      "ตอนเย็นเดินชมพระอาทิตย์ตก",
    qas: [
      { id: "25.1", prompt: "ไปเที่ยวที่ไหน?", choices: ["น้ำตก", "ทะเล", "ขึ้นเขา", "ไหว้พระที่วัด"], correctIndex: 1 },
      { id: "25.2", prompt: "เด็กๆ ทำอะไร?", choices: ["กินขนม", "ฟังเพลง", "เล่นน้ำทะเล", "ก่อกองทราย"], correctIndex: 2 },
      { id: "25.3", prompt: "ผู้ใหญ่กินอะไร?", choices: ["หมูกระทะ", "ข้าวเหนียวไก่ย่าง", "ต้มยำทะเล", "ส้มตำและปลาหมึกย่าง"], correctIndex: 3 },
    ],
  },
  {
    id: "26",
    title: "ตาแดงพาหลานเที่ยวภูเขา",
    body:
      "ตาแดงพาหลานเที่ยวภูเขา อากาศเย็นสบาย มีหมอกคลอ หลานถ่ายรูปเก็บไว้ " +
      "ตาแดงเก็บผักสดจากสวนชาวบ้านมาทำแกงจืดกินด้วยกัน",
    qas: [
      { id: "26.1", prompt: "ไปเที่ยวที่ไหน?", choices: ["ทะเล", "ภูเขา", "น้ำตก", "สวนสัตว์"], correctIndex: 1 },
      { id: "26.2", prompt: "อากาศเป็นอย่างไร?", choices: ["แดดร้อน", "ฝนตก", "ลมแรง", "เย็นสบาย"], correctIndex: 3 },
      { id: "26.3", prompt: "ทำอาหารอะไร?", choices: ["ต้มยำ", "แกงจืด", "ผัดกะเพรา", "ต้มผัก"], correctIndex: 1 },
    ],
  },
  {
    id: "27",
    title: "หมากรุกใต้ต้นโพธิ์",
    body:
      "ลุงชัยกับเพื่อนๆ ชอบนั่งเล่นหมากรุกใต้ต้นโพธิ์ในวัด เด็กๆ มายืนดูและเชียร์ " +
      "บางครั้งหัวเราะเมื่อมีคนเดินหมากผิด",
    qas: [
      { id: "27.1", prompt: "เล่นเกมอะไร?", choices: ["หมากฮอส", "หมากเก็บ", "หมากรุก", "โดมิโน"], correctIndex: 2 },
      { id: "27.2", prompt: "เล่นกันที่ไหน?", choices: ["ม้าหิน", "ใต้ต้นโพธิ์", "ข้างบ้าน", "หลังสวน"], correctIndex: 1 },
      { id: "27.3", prompt: "เด็กๆ ทำอะไร?", choices: ["กินขนม", "ยืนดูและเชียร์", "นอนหลับ", "อ่านหนังสือ"], correctIndex: 1 },
    ],
  },
  {
    id: "28",
    title: "อาสางานกาชาด",
    body:
      "ในงานกาชาดประจำปี ป้าละไมอาสาช่วยขายสลาก เพื่อนๆ ช่วยขายน้ำและขนม หลังงานเสร็จทุกคนนั่งกินก๋วยเตี๋ยวด้วยกัน",
    qas: [
      { id: "28.1", prompt: "ไปช่วยงานอะไร?", choices: ["ปีใหม่", "กาชาดประจำปี", "บวช", "แห่เทียน"], correctIndex: 1 },
      { id: "28.2", prompt: "ป้าละไมทำหน้าที่อะไร?", choices: ["ร้องเพลง", "ทำอาหาร", "ขายสลาก", "ดูแลเวที"], correctIndex: 2 },
      { id: "28.3", prompt: "เพื่อนๆ ช่วยทำอะไร?", choices: ["จัดไฟ", "ขายเสื้อผ้า", "ถ่ายภาพ", "ขายน้ำและขนม"], correctIndex: 3 },
    ],
  },
  {
    id: "29",
    title: "ยายบุญขึ้นรถไฟ",
    body:
      "ยายบุญขึ้นรถไฟไปเยี่ยมญาติ ระหว่างทางชมทุ่งนาและภูเขา มีแม่ค้าขายข้าวเหนียวหมูปิ้งเดินขายในตู้รถไฟ " +
      "ยายบุญซื้อมากินระหว่างทาง",
    qas: [
      { id: "29.1", prompt: "นั่งพาหนะอะไร?", choices: ["รถเมล์", "รถไฟ", "รถทัวร์", "แท็กซี่"], correctIndex: 1 },
      { id: "29.2", prompt: "ไปหาใคร?", choices: ["เพื่อน", "ลูกหลาน", "ญาติ", "ครูเก่า"], correctIndex: 2 },
      { id: "29.3", prompt: "ซื้ออะไรมากินบนรถไฟ?", choices: ["ข้าวมันไก่", "แซนด์วิช", "ไอศกรีม", "ข้าวเหนียวหมูปิ้ง"], correctIndex: 3 },
    ],
  },
  {
    id: "30",
    title: "ตาเล็กเยี่ยมเพื่อนเก่า",
    body:
      "ตาเล็กเดินทางไปเยี่ยมเพื่อนเก่าสมัยทำงานที่จังหวัดใกล้เคียง พบกันแล้วคุยถึงความหลังและหัวเราะด้วยความสุข " +
      "เพื่อนทำกับข้าวพื้นบ้านเลี้ยง เช่น แกงหน่อไม้และปลาเผา",
    qas: [
      { id: "30.1", prompt: "ใครไปหาเพื่อนเก่า?", choices: ["ตาเล็ก", "ลุงดำ", "ตาเพียร", "ป้าละไม"], correctIndex: 0 },
      { id: "30.2", prompt: "เพื่อนอยู่ที่ไหน?", choices: ["ต่างประเทศ", "จังหวัดใกล้เคียง", "หมู่บ้านเดียวกัน", "เมืองหลวง"], correctIndex: 1 },
      { id: "30.3", prompt: "เมื่อเจอกันทำกิจกรรมอะไร?", choices: ["เล่นกีฬา", "ปลูกต้นไม้", "ดูทีวี", "คุยถึงความหลังและหัวเราะ"], correctIndex: 3 },
    ],
  },
];

/** =========================
 * UTILS
 * ========================= */
const shuffleArray = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const prepareRoundQuestions = (qas) =>
  shuffleArray(qas).map((q) => {
    if (!SHUFFLE_CHOICES) return { ...q };
    const pair = q.choices.map((c, i) => ({ c, i }));
    const shuffled = shuffleArray(pair);
    return {
      ...q,
      choices: shuffled.map((p) => p.c),
      correctIndex: shuffled.findIndex((p) => p.i === q.correctIndex),
    };
  });

/** =========================
 * COMPONENTS
 * ========================= */
const PressableScale = ({ style, onPress, disabled, children }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        disabled={disabled}
        style={style}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

/** =========================
 * MAIN SCREEN
 * ========================= */
export default function StoryGame() {
  const [phase, setPhase] = useState("read"); // read | quiz | result
  const [story, setStory] = useState(() => STORIES[Math.floor(Math.random() * STORIES.length)]);
  const [questions, setQuestions] = useState(() => prepareRoundQuestions(story.qas));
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]); // [{ id, chosen, correctIndex }]
  const timerRef = useRef(null);
  const lockRef = useRef(false);

  // Animated progress (แถบความคืบหน้าบนหัวข้อ)
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (phase === "quiz") {
      const target = (index + 1) / questions.length;
      Animated.timing(progress, { toValue: target, duration: 280, useNativeDriver: false }).start();
    } else {
      progress.setValue(0);
    }
  }, [index, phase, questions.length, progress]);

  const current = questions[index];

  // ปรับขนาดตัวอักษรเนื้อเรื่องตามความยาว
  const storyFontSize = useMemo(() => {
    const len = (story?.body || "").length;
    if (len > 900) return 16;
    if (len > 600) return 17.5;
    if (len > 400) return 18.5;
    return 20;
  }, [story]);

  // จัดการเวลา
  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(QUESTION_TIME);
    timerRef.current = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          if (!lockRef.current) finishQuestion(null);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (phase === "quiz") resetTimer();
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [phase, index]);

  // เริ่มทำแบบทดสอบ
  const startQuiz = () => {
    setPhase("quiz");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setQuestions(prepareRoundQuestions(story.qas));
  };

  // จบคำถามหนึ่งข้อ
  const finishQuestion = (choiceIndex) => {
    lockRef.current = true;
    setSelected(choiceIndex);
    setAnswers((prev) => [...prev, { id: current.id, chosen: choiceIndex, correctIndex: current.correctIndex }]);

    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex((i) => i + 1);
        setSelected(null);
        lockRef.current = false;
        resetTimer();
      } else {
        setPhase("result");
        lockRef.current = false;
      }
    }, AUTO_NEXT_DELAY);
  };

  // เลือกตัวเลือก
  const onChoose = (i) => {
    if (lockRef.current || selected !== null) return;
    finishQuestion(i);
  };

  // สรุปคะแนน
  const correctCount = useMemo(
    () => answers.filter((a) => a.chosen === a.correctIndex).length,
    [answers]
  );

  // เล่นโจทย์เดิม
  const replaySame = () => {
    setPhase("read");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setQuestions(prepareRoundQuestions(story.qas));
    setTimeLeft(QUESTION_TIME);
  };

  // เปลี่ยนเรื่องใหม่
  const replayNew = () => {
    const next = STORIES[Math.floor(Math.random() * STORIES.length)];
    setStory(next);
    setQuestions(prepareRoundQuestions(next.qas));
    setPhase("read");
    setIndex(0);
    setSelected(null);
    setAnswers([]);
    setTimeLeft(QUESTION_TIME);
  };

  /** UI: ตัวเลือก */
  const Option = ({ label, i }) => {
    const isChosen = selected === i;
    const isCorrect = i === (current?.correctIndex ?? -1);
    const showGreen = selected !== null && isChosen && isCorrect;
    const showRed = selected !== null && isChosen && !isCorrect;

    return (
      <PressableScale
        onPress={() => onChoose(i)}
        disabled={selected !== null}
        style={[
          styles.option,
          showGreen && styles.correct,
          showRed && styles.wrong,
          selected !== null && styles.optionDisabled,
        ]}
      >
        <Text
          style={[
            styles.optionText,
            showGreen && styles.correctText,
            showRed && styles.wrongText,
          ]}
        >
          {label}
        </Text>
      </PressableScale>
    );
  };

  const isQuizReady = phase === "quiz" && current;

  return (
    <View style={styles.container}>
      {/* READ PHASE */}
      {phase === "read" && (
        <>
          <View style={styles.topbar}>
            <Text style={styles.topbarTitle}>อ่านเรื่อง</Text>
          </View>

          <ScrollView
            style={styles.storyScroll}
            contentContainerStyle={styles.storyWrap}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.storyCard}>
              <Text style={styles.storyTitle}>{story.title}</Text>
              <View style={styles.divider} />
              <Text style={[styles.storyBody, { fontSize: storyFontSize }]}>{story.body}</Text>
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <PressableScale style={styles.primaryBtn} onPress={startQuiz}>
              <Text style={styles.primaryBtnText}>เริ่มทำแบบทดสอบ</Text>
            </PressableScale>
          </View>
        </>
      )}

      {/* QUIZ PHASE */}
      {isQuizReady && (
        <>
          <View style={styles.quizHeader}>
            <View style={styles.timerPill}>
              <Text style={styles.timerLabel}>เวลา</Text>
              <Text style={[styles.timerValue, timeLeft <= 10 && styles.timerUrgent]}>
                {timeLeft} วินาที
              </Text>
            </View>

            <View style={styles.progressBox}>
              <Text style={styles.progressText}>
                ข้อ {index + 1} / {questions.length}
              </Text>
              <View style={styles.progressBar}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.quizBody}>
            <Text style={styles.question}>{current.prompt}</Text>

            <View style={{ rowGap: 14 }}>
              {current.choices.map((c, i) => (
                <Option key={`${current.id}-${i}-${c}`} label={c} i={i} />
              ))}
            </View>

            {selected !== null && (
              <View style={styles.feedback}>
                <Text
                  style={[
                    styles.feedbackText,
                    selected === current.correctIndex ? styles.feedbackOk : styles.feedbackNo,
                  ]}
                >
                  {selected === current.correctIndex ? "ถูกต้อง" : "ไม่ถูกต้อง"}
                </Text>
              </View>
            )}
          </View>
        </>
      )}

      {/* RESULT PHASE */}
      {phase === "result" && (
        <ScrollView
          contentContainerStyle={styles.resultWrap}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>สรุปผล</Text>
            <Text style={styles.resultScore}>
              คะแนน {correctCount} / {questions.length}
            </Text>
          </View>

          <View style={styles.resultList}>
            {answers.map((a, i) => (
              <View key={`${a.id}-${i}`} style={styles.resultItem}>
                <Text style={styles.resultIndex}>ข้อ {i + 1}</Text>
                <View style={[styles.badge, a.chosen === a.correctIndex ? styles.badgeOk : styles.badgeNo]}>
                  <Text style={styles.badgeText}>
                    {a.chosen === a.correctIndex ? "ถูก" : "ผิด"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.resultActions}>
            <PressableScale style={styles.secondaryBtn} onPress={replaySame}>
              <Text style={styles.secondaryBtnText}>เล่นโจทย์เดิม</Text>
            </PressableScale>
            <PressableScale style={styles.primaryBtn} onPress={replayNew}>
              <Text style={styles.primaryBtnText}>เปลี่ยนโจทย์</Text>
            </PressableScale>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

/** =========================
 * STYLES
 * ========================= */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FB" },

  /** Read phase */
  topbar: {
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9EE",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  topbarTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },

  storyScroll: { flex: 1 },
  storyWrap: { padding: 20, paddingBottom: 110 },
  storyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E6E9EE",
  },
  storyTitle: { fontSize: 22, fontWeight: "800", color: "#111827", textAlign: "center", marginBottom: 14 },
  divider: { height: 1, backgroundColor: "#E6E9EE", marginBottom: 16 },
  storyBody: { lineHeight: 30, color: "#374151" },

  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#E6E9EE",
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
  },

  /** Buttons */
  primaryBtn: {
    backgroundColor: "#0EA5E9",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 12,
    minWidth: 180,
    alignItems: "center",
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },

  secondaryBtn: {
    backgroundColor: "#EEF2F6",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 12,
    minWidth: 160,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryBtnText: { color: "#0F172A", fontSize: 15, fontWeight: "700" },

  /** Quiz header */
  quizHeader: {
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9EE",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerPill: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  timerLabel: { fontSize: 12, color: "#6B7280", marginBottom: 2 },
  timerValue: { fontSize: 16, fontWeight: "800", color: "#EF4444" },
  timerUrgent: { color: "#DC2626" },

  progressBox: { width: 160 },
  progressText: { fontSize: 14, fontWeight: "700", color: "#334155", marginBottom: 6, textAlign: "right" },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#2563EB", borderRadius: 3 },

  /** Quiz body */
  quizBody: { flex: 1, padding: 16 },
  question: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 28,
  },
  option: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 16,
  },
  optionDisabled: { opacity: 0.85 },
  optionText: { fontSize: 16, fontWeight: "500", color: "#374151" },
  correct: { backgroundColor: "#ECFDF5", borderColor: "#10B981" },
  correctText: { color: "#065F46" },
  wrong: { backgroundColor: "#FEF2F2", borderColor: "#EF4444" },
  wrongText: { color: "#991B1B" },

  feedback: { alignItems: "center", marginTop: 14 },
  feedbackText: { fontSize: 16, fontWeight: "700" },
  feedbackOk: { color: "#10B981" },
  feedbackNo: { color: "#EF4444" },

  /** Result */
  resultWrap: { padding: 16, paddingTop: 36, alignItems: "center" },
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    padding: 18,
    width: "100%",
    alignItems: "center",
    marginBottom: 14,
  },
  resultTitle: { fontSize: 20, fontWeight: "800", color: "#0F172A", marginBottom: 6 },
  resultScore: { fontSize: 16, color: "#334155" },

  resultList: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    padding: 12,
    width: "100%",
    marginTop: 6,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingVertical: 10,
  },
  resultIndex: { fontSize: 15, fontWeight: "700", color: "#334155" },
  badge: { minWidth: 64, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, alignItems: "center" },
  badgeOk: { backgroundColor: "#ECFDF5" },
  badgeNo: { backgroundColor: "#FEF2F2" },
  badgeText: { fontSize: 13, fontWeight: "800", color: "#0F172A" },

  resultActions: { flexDirection: "row", columnGap: 10, width: "100%" },
});
