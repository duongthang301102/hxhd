// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// --- THAY THẾ BẰNG CONFIG CỦA BẠN LẤY TRÊN FIREBASE CONSOLE ---
const firebaseConfig = {
  apiKey: "AIzaSyAIV2FbbeJuty81OSwGAzj28tnbbwuNHb4",
  authDomain: "kxhd-5d01a.firebaseapp.com",
  databaseURL: "https://kxhd-5d01a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kxhd-5d01a",
  storageBucket: "kxhd-5d01a.firebasestorage.app",
  messagingSenderId: "815527957901",
  appId: "1:815527957901:web:776db29b8ebfecde3b99c4"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);