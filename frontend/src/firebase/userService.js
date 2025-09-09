import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

// Save user profile data to Firestore
export const saveUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userProfile = {
      ...userData,
      userId,
      createdAt: new Date(),
      lastLogin: new Date(),
      isActive: true
    };

    await setDoc(userRef, userProfile, { merge: true });
    console.log('User profile saved successfully');
    return userProfile;
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Get user profile data from Firestore
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.log('No user profile found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile data
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, 'users', userId);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await updateDoc(userRef, updateData);
    console.log('User profile updated successfully');
    return updateData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Update last login time
export const updateLastLogin = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: new Date()
    });
    console.log('Last login updated successfully');
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Check if username is available
export const isUsernameAvailable = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    return querySnapshot.empty; // true if username is available
  } catch (error) {
    console.error('Error checking username availability:', error);
    throw error;
  }
};

// Get user by username
export const getUserByUsername = async (username) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return {
        id: userDoc.id,
        ...userDoc.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user by username:', error);
    throw error;
  }
};
