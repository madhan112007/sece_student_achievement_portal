import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Admin setup function
export const createAdminUser = async () => {
  try {
    const email = 'codethetrend@gmail.com';
    const password = 'sample123';
    
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set admin role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      name: 'Admin User',
      role: 'admin',
      department: 'Administration',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    console.log('Admin user created successfully');
    return user;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Call this function once to create the admin user
// createAdminUser();