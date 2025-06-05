import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDT_w5Dp51-iMGLLbqGtfkWnKlzoyGwXoA",
  authDomain: "chat-7f392.firebaseapp.com",
  projectId: "chat-7f392",
  storageBucket: "chat-7f392.appspot.com",
  messagingSenderId: "513991549803",
  appId: "1:513991549803:web:7b607e9bdd8041745b622e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const db = getFirestore(app);
export const storage = getStorage(app);