import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

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
const auth = getAuth(app);


setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistencia configurada");
  })
  .catch((error) => {
    console.error("Error configurando persistencia:", error);
  });


export default app;

export { db, auth, collection, getDocs, addDoc };
