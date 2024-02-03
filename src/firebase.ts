// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "portfolio-dashboard-cc129.firebaseapp.com",
  databaseURL:
    "https://portfolio-dashboard-cc129-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "portfolio-dashboard-cc129",
  storageBucket: "portfolio-dashboard-cc129.appspot.com",
  messagingSenderId: "349212429055",
  appId: import.meta.env.VITE_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
