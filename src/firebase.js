import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDQ1kA6wKWTf9xLGj2lsXtlBV-AH5PLsBY",
  authDomain: "real-time-chat-388a7.firebaseapp.com",
  databaseURL: "https://real-time-chat-388a7-default-rtdb.firebaseio.com",
  projectId: "real-time-chat-388a7",
  storageBucket: "real-time-chat-388a7.firebasestorage.app",
  messagingSenderId: "46470010225",
  appId: "1:46470010225:web:404fb0996b21ed031a52d0",
  measurementId: "G-T1XMMXP5RM"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const messaging = getMessaging(app);

export const getFcmToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: 'BEAgixcMfUKXN4miaOoKAG96s5wirp2jybKxqKvAk6lqWoNLM2g8-1IOuIaf948GoRQ9msZjAAfyC1Vh4D_iQyI' });
    return token;
  } catch (error) {
    console.error("Failed to get FCM token", error);
    return null;
  }
};
