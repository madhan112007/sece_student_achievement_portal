import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCm1yNFDtjRh0DCYWxjMGoAUEKGDppgjVk",
  authDomain: "sece-student-portal.firebaseapp.com",
  projectId: "sece-student-portal",
  storageBucket: "sece-student-portal.firebasestorage.app",
  messagingSenderId: "253771789156",
  appId: "1:253771789156:web:20ac26d29c921b55fd0071",
  measurementId: "G-1GDZX62165"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;