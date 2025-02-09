// src/firebase/firebaseFunctions.js

import { db, collection, addDoc } from './firebaseConfig';

// Función para agregar una propiedad a Firestore
const addProperty = async (property) => {
  try {
    const docRef = await addDoc(collection(db, 'propiedades'), property);
    console.log("Propiedad añadida con ID: ", docRef.id);
  } catch (e) {
    console.error("Error añadiendo propiedad: ", e);
  }
};

export { addProperty };
