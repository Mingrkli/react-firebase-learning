import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDP1jptiKJ1FvyDHt5HK_38-I7S-f47O9I",
    authDomain: "learning-firebase-final.firebaseapp.com",
    projectId: "learning-firebase-final",
    storageBucket: "learning-firebase-final.appspot.com",
    messagingSenderId: "588508941899",
    appId: "1:588508941899:web:ae2e9f9a3754c1950f07ce",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
