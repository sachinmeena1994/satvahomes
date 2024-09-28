import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, PhoneAuthProvider, signInWithPhoneNumber,isSignInWithEmailLink,signInWithEmailLink ,RecaptchaVerifier} from 'firebase/auth'; // Import GoogleAuthProvider

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

const fireDB = getFirestore(app);

const auth = getAuth(app);
auth.languageCode = 'it';

// Create Google Auth provider
const googleAuthProvider = new GoogleAuthProvider();

// Create Phone Auth provider
const phoneAuthProvider = new PhoneAuthProvider(auth);

// Function to generate OTP and send to the given phone number
// Function to generate OTP and send it to the specified email address
const generateOTP = async (phoneNumber) => {
  try {
    // Configure the action link settings
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber);
    
    // Store confirmation result for later use if needed
    window.confirmationResult = confirmationResult;

    // Return a success message
    return 'OTP sent successfully';
  } catch (error) {
    // If an error occurs during OTP generation, throw an error
    throw new Error('Failed to generate OTP. Please try again.');
  }
};


// Function to verify OTP with the email link
const verifyOTP = async (email) => {
  try {
    // Check if the email link is valid
    if (isSignInWithEmailLink(auth, window.location.href)) {
      // Complete sign-in with the email link
      await signInWithEmailLink(auth, email, window.location.href);
      return 'OTP verified successfully';
    } else {
      throw new Error('Invalid OTP. Please try again.');
    }
  } catch (error) {
    // If an error occurs during OTP verification, throw an error
    throw new Error('Failed to verify OTP. Please try again.');
  }
};


export { fireDB, auth, googleAuthProvider, generateOTP, verifyOTP, phoneAuthProvider, getFirestore };


