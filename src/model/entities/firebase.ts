import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

dotenv.config();
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAWV2z9_SIX7IdNM2xOMpXpU100b_RimYo',
  authDomain: 'immunify-thesis-dev.firebaseapp.com',
  projectId: 'immunify-thesis-dev',
  storageBucket: 'immunify-thesis-dev.firebasestorage.app',
  messagingSenderId: '390658548521',
  appId: '1:390658548521:web:831301638f7982c9c98d38',
  measurementId: 'G-RWN0R974T2',

  // apiKey: process.env.APIKEY,
  // authDomain: process.env.AUTHDOMAIN,
  // projectId: process.env.PROJECTID,
  // storageBucket: process.env.STORAGEBUCKET,
  // messagingSenderId: process.env.MESSAGINGSENDERID,
  // appId: process.env.APPID,
  // measurementId: process.env.MEASUREMENTID,
};

// Initialize Firebase
// var admin = require("firebase-admin");

// var serviceAccount = require("../../../serviceAccount.json");

export const app = initializeApp({
  // credential: admin.credential.cert(serviceAccount),
  ...firebaseConfig,
});

export const db = getFirestore(app);
