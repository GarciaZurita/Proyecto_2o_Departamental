import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBVcgbYMw14uY7W-69254gUtRz4UJseP2Y",
  authDomain: "proyectopokemon-38614.firebaseapp.com",
  projectId: "proyectopokemon-38614",
  storageBucket: "proyectopokemon-38614.appspot.com",
  messagingSenderId: "504059234051",
  appId: "1:504059234051:web:c0aa8048c9df36ca1f8b36",
  measurementId: "G-FWLYB64LS2"
};

// Validación de configuración
if (!firebaseConfig.apiKey) throw new Error("Firebase config missing apiKey");
if (!firebaseConfig.authDomain) throw new Error("Firebase config missing authDomain");

// Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Proveedores
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');

export { 
  auth,
  db,
  googleProvider,
  facebookProvider,
  // Auth functions
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  updateProfile,
  // Firestore functions
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp
};

export default app;