// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAsVfl1Sw_Tz8Yx5G9iI8L9S1InNg4OEKQ",
    authDomain: "potholex-d59e4.firebaseapp.com",
    projectId: "potholex-d59e4",
    storageBucket: "potholex-d59e4.firebasestorage.app",
    messagingSenderId: "878741053562",
    appId: "1:878741053562:web:2159fc6f0b1844e5b91bc3",
    measurementId: "G-P9Y46B9VZK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebase_auth = getAuth(app);