import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // We use Firestore for the chat

const firebaseConfig = {
  apiKey: "AIzaSyCZyxDQj2OfzT4jBgTuFS0Pumnb8hqkwO8",
  authDomain: "movie-club-chat.firebaseapp.com",
  projectId: "movie-club-chat",
  storageBucket: "movie-club-chat.firebasestorage.app",
  messagingSenderId: "385316322540",
  appId: "1:385316322540:web:918b49f88b7639dbca79c9",
  measurementId: "G-4MNFD18RV1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export the database instance