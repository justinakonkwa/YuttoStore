import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTz4NByuKKfjQ9popaJLqTAJGFoy5YWks",
  authDomain: "myfavorite-8b08d.firebaseapp.com",
  projectId: "myfavorite-8b08d",
  storageBucket: "myfavorite-8b08d.appspot.com",
  messagingSenderId: "772604634733",
  appId: "1:772604634733:web:b3a7b9c728328504a58164",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
