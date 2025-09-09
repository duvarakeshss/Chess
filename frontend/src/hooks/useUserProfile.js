import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../firebase/userService';

export const useUserProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user profile when user changes
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user || !user.uid) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);

  // Function to update user profile
  const updateProfile = async (updates) => {
    if (!user || !user.uid) {
      throw new Error('No authenticated user');
    }

    try {
      const updatedData = await updateUserProfile(user.uid, updates);
      // Update local state
      setUserProfile(prev => ({
        ...prev,
        ...updatedData
      }));
      return updatedData;
    } catch (err) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  };

  // Function to refresh user profile from database
  const refreshProfile = async () => {
    if (!user || !user.uid) return;

    try {
      setLoading(true);
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('Error refreshing user profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    // Computed properties
    isProfileComplete: userProfile && userProfile.username && userProfile.email,
    displayName: userProfile?.username || userProfile?.email?.split('@')[0] || 'User',
    email: userProfile?.email || user?.email,
    joinDate: userProfile?.createdAt?.toDate?.() || null,
    lastLogin: userProfile?.lastLogin?.toDate?.() || null
  };
};
