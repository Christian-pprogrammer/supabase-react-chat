import { getFcmToken, messaging } from '../firebase';
import { onMessage } from 'firebase/messaging';

const CHAT_BACKEND_URL = 'http://localhost:3000';

/**
 * Registers FCM token with the backend
 * @param {string} idToken - Firebase ID token for authentication
 * @returns {Promise<boolean>} - Success status
 */
export const registerFcmToken = async (idToken) => {
  try {
    const fcmToken = await getFcmToken();
    
    if (!fcmToken) {
      console.warn('FCM token not available');
      return false;
    }

    const response = await fetch(`${CHAT_BACKEND_URL}/chats/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({ fcmToken }),
    });

    if (!response.ok) {
      throw new Error(`Failed to register FCM token: ${response.status}`);
    }

    const data = await response.json();
    console.log('FCM token registered successfully:', data);
    return true;
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

/**
 * Sets up foreground notification listener
 * @param {Function} onMessageCallback - Callback to handle incoming messages
 * @returns {Function} - Unsubscribe function
 */
export const setupNotificationListener = (onMessageCallback) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return () => {};
  }

  // Listen for foreground messages
  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    onMessageCallback(payload);
  });

  return unsubscribe;
};