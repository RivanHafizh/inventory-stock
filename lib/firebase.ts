// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore,collection,} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC86yHX0_6du38i4Cwg-pMkTcgcw-qZ3zo",
  authDomain: "inventoryam-72d6e.firebaseapp.com",
  projectId: "inventoryam-72d6e",
  storageBucket: "inventoryam-72d6e.firebasestorage.app",
  messagingSenderId: "413390766314",
  appId: "1:413390766314:web:b0ea82bac5cbb456179793",
  measurementId: "G-2ZG7099ET9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };