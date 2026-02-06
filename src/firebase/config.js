// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Descomenta si vas a usar login

const firebaseConfig = {
  apiKey: "AIzaSyAX1ko2GNhmPJh3qCHZsf3iP_2mI7_ESj4",
  authDomain: "munive-b3ba5.firebaseapp.com",
  projectId: "munive-b3ba5",
  storageBucket: "munive-b3ba5.firebasestorage.app",
  messagingSenderId: "734778241171",
  appId: "1:734778241171:web:0c2e6822831849e9725d66"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos para usarla en toda la app
export const db = getFirestore(app);
export const auth = getAuth(app);