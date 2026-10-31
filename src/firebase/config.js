// src/firebase/config.js
// IMPORTANTE: Substitua os valores abaixo pelas suas credenciais do Firebase
// Crie um projeto em https://console.firebase.google.com/
// Habilite: Authentication (Email/Password), Firestore Database, Storage

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDEMO_SUBSTITUA_AQUI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sala-de-guerra-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sala-de-guerra-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sala-de-guerra-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000000000000:web:demo",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
