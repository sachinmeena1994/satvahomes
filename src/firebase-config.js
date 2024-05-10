// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDsPXyrKcDEmqfYPtkGJk5SvYTGRJfA5vU",
    authDomain: "satvahomes-bc5c1.firebaseapp.com",
    projectId: "satvahomes-bc5c1",
    storageBucket: "satvahomes-bc5c1.appspot.com",
    messagingSenderId: "578506085643",
    appId: "1:578506085643:web:07fc0bac66135e231c7e0e",
    measurementId: "G-D6MN6QGCD7"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
console.log('Firebase initialized successfully');

// Exporting a dummy variable just to ensure the file is executed
export const firebaseInitialized = true;
