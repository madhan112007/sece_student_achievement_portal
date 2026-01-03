import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const { currentUser } = useAuth();

  useEffect(() => {
    const testFirebase = async () => {
      try {
        console.log('Current user:', currentUser);
        console.log('Database:', db);
        
        // Test Firestore connection
        const testCollection = collection(db, 'submissions');
        const snapshot = await getDocs(testCollection);
        
        setStatus(`Connected! Found ${snapshot.size} submissions in database`);
        console.log('Submissions:', snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        setStatus(`Error: ${error.message}`);
        console.error('Firebase error:', error);
      }
    };

    if (currentUser) {
      testFirebase();
    }
  }, [currentUser]);

  return (
    <div className="card">
      <h3>Firebase Connection Test</h3>
      <p>Status: {status}</p>
      <p>User: {currentUser?.email || 'Not logged in'}</p>
    </div>
  );
};

export default FirebaseTest;