import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore with configured databaseId
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || "(default)"
);

export { collection, doc, setDoc, getDocs, updateDoc, onSnapshot, query, orderBy, Timestamp };
