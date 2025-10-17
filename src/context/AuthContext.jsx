// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { registerFcmToken } from '../utils/fcmTokenUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fcmRegistered, setFcmRegistered] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(true);
      
      if (currentUser) {
        try {
          // Get ID token
          const token = await currentUser.getIdToken();
          setIdToken(token);

          console.log('User ID Token:', token);
          
          // Register FCM token after authentication
          const success = await registerFcmToken(token);
          setFcmRegistered(success);
        } catch (error) {
          console.error('Error getting ID token or registering FCM:', error);
        }
      } else {
        setIdToken(null);
        setFcmRegistered(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    idToken,
    loading,
    fcmRegistered,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};