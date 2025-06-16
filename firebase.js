// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBhwPNwXQGUB30MIQl3uFC-jgkiiK_ze_I",
  authDomain: "app-project-7f79a.firebaseapp.com",
  projectId: "app-project-7f79a",
  storageBucket: "app-project-7f79a.appspot.com",
  messagingSenderId: "69323307396",
  appId: "1:69323307396:web:d05c66e59369b34e5b05d1",
  measurementId: "G-KPQM09V1DL"
};

let app;
let db;

try {
  // Initialize Firebase only if it hasn't been initialized
  if (!app) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Don't throw the error, just log it
}

export { db };