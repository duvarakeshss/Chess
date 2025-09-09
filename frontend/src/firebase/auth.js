import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { saveUserProfile, updateLastLogin } from './userService';

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if this is a new user or returning user
    const isNewUser = result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

    // Save or update user profile to Firestore
    const userProfile = {
      username: user.displayName || user.email.split('@')[0],
      email: user.email,
      emailVerified: user.emailVerified, // Google emails are pre-verified
      authProvider: 'google',
      signupMethod: 'google',
      photoURL: user.photoURL,
      isNewUser: isNewUser,
      googleId: user.uid
    };

    await saveUserProfile(user.uid, userProfile);

    // Update last login time
    await updateLastLogin(user.uid);

    // Return user with additional metadata
    return {
      ...user,
      isNewUser,
      profileComplete: !!(user.displayName && user.photoURL)
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);

    // Handle specific Google sign-in errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in was cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with this email using a different sign-in method.');
    }

    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Listen for auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    });

    // Send email verification
    await sendEmailVerification(user);

    // Save user profile to Firestore
    const userProfile = {
      username: displayName,
      email: email,
      emailVerified: false,
      authProvider: 'email',
      signupMethod: 'email'
    };

    await saveUserProfile(user.uid, userProfile);

    return user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if email is verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
    }

    // Update last login time
    await updateLastLogin(user.uid);

    return user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};
