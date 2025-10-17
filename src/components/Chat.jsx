import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue, off } from 'firebase/database';
import { setupNotificationListener } from '../utils/fcmTokenUtils';

const CHAT_BACKEND_URL = 'http://localhost:3000';

const Chat = () => {
  const { user, idToken, fcmRegistered } = useAuth();
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipientUid, setRecipientUid] = useState('');
  const [notification, setNotification] = useState(null);

  // --- Setup Notification Listener ---
  // --- Setup Notification Listener ---
useEffect(() => {
  const handleNotification = (payload) => {
    console.log('Received notification:', payload);
    setNotification({
      title: payload.notification?.title || 'New Message',
      body: payload.notification?.body || '',
    });

    setTimeout(() => setNotification(null), 5000);
  };

  const unsubscribe = setupNotificationListener(handleNotification);
  
  // Cleanup on unmount
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []);
  // --- Real-time Chat Updates ---
  useEffect(() => {
    if (chatId) {
      const chatRef = ref(db, `chats/${chatId}/messages`);
      const listener = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const loadedMessages = Object.keys(data).map(key => ({
            id: key,
            ...data[key],
          })).sort((a, b) => a.timestamp - b.timestamp);
          setMessages(loadedMessages);
        } else {
          setMessages([]);
        }
      });
      return () => {
        off(chatRef, 'value', listener);
      };
    }
  }, [chatId]);

  const createChat = async () => {
    if (!idToken || !recipientUid) return;

    try {
      const response = await fetch(`${CHAT_BACKEND_URL}/chats/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ participantUids: [recipientUid] }),
      });
      const data = await response.json();
      setChatId(data.chatId);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!chatId || !newMessage || !idToken) return;

    try {
      await fetch(`${CHAT_BACKEND_URL}/chats/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ chatId, text: newMessage }),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!user) {
    return <p>Please sign in to view this page.</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>1:1 Chat</h2>
      
      {/* FCM Registration Status */}
      <div style={{ marginBottom: '10px', fontSize: '12px', color: fcmRegistered ? 'green' : 'orange' }}>
        {fcmRegistered ? '✓ Notifications enabled' : '⚠ Notifications not registered'}
      </div>

      {/* Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          padding: '15px',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          zIndex: 1000,
        }}>
          <strong>{notification.title}</strong>
          <p style={{ margin: '5px 0 0 0' }}>{notification.body}</p>
        </div>
      )}

      {!chatId ? (
        <div>
          <p>Enter the UID of the person you want to chat with:</p>
          <input
            type="text"
            value={recipientUid}
            onChange={(e) => setRecipientUid(e.target.value)}
            placeholder="Recipient UID"
          />
          <button onClick={createChat}>Start New Chat</button>
        </div>
      ) : (
        <div>
          <h3>Chat ID: {chatId}</h3>
          <div style={{ border: '1px solid #ccc', padding: '10px', height: '300px', overflowY: 'scroll' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ textAlign: msg.sender === user.uid ? 'right' : 'left', marginBottom: '10px' }}>
                <strong>{msg.sender === user.uid ? 'You' : msg.sender}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;