import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA9i_SAhgQJMNYds9HGzQwXGeCV4KTr3KM",
  authDomain: "mood-tracker-zen.firebaseapp.com",
  projectId: "mood-tracker-zen",
  storageBucket: "mood-tracker-zen.firebasestorage.app",
  messagingSenderId: "53590285676",
  appId: "1:53590285676:web:88d9977ac75028021a2749"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const saveMood = async (moodEntry) => {
  try {
    const docRef = await addDoc(collection(db, "moods"), {
      ...moodEntry,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};