import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "fakeairbnb-c1258.firebaseapp.com",
  projectId: "fakeairbnb-c1258",
  storageBucket: "fakeairbnb-c1258..firebasestorage.app",
  appId: "1:681020197205:web:57efa746030e0d306147dc",
  measurementId: "G-YQZMCKR504"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, getDocs, addDoc };
