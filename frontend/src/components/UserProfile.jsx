import { useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { FaUser, FaEnvelope, FaCalendar, FaClock } from 'react-icons/fa';

const UserProfile = () => {
  const {
    userProfile,
    loading,
    error,
    updateProfile,
    displayName,
    email,
    joinDate,
    lastLogin
  } = useUserProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    bio: ''
  });

  // Update edit form when profile loads
  useState(() => {
    if (userProfile) {
      setEditForm({
        username: userProfile.username || '',
        bio: userProfile.bio || ''
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      // You could show a success toast here
    } catch (error) {
      console.error('Failed to update profile:', error);
      // You could show an error toast here
    }
  };

  const handleCancel = () => {
    setEditForm({
      username: userProfile?.username || '',
      bio: userProfile?.bio || ''
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
        <p className="text-red-400">Error loading profile: {error.message}</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
        <p className="text-yellow-400">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/70 border border-gray-700/20 rounded-2xl p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaUser className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white">{displayName}</h2>
        <p className="text-gray-400">{userProfile.authProvider} user</p>
      </div>

      <div className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.username}
              onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/80"
            />
          ) : (
            <p className="text-white bg-gray-800/40 px-3 py-2 rounded-lg">
              {userProfile.username || 'Not set'}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            <FaEnvelope className="inline w-4 h-4 mr-1" />
            Email
          </label>
          <p className="text-white bg-gray-800/40 px-3 py-2 rounded-lg">
            {email}
            {userProfile.emailVerified && (
              <span className="ml-2 text-green-400 text-sm">✓ Verified</span>
            )}
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800/60 border border-gray-600/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/80 resize-none"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-white bg-gray-800/40 px-3 py-2 rounded-lg min-h-[3rem]">
              {userProfile.bio || 'No bio yet'}
            </p>
          )}
        </div>

        {/* Join Date */}
        {joinDate && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FaCalendar className="inline w-4 h-4 mr-1" />
              Member since
            </label>
            <p className="text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg">
              {joinDate.toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Last Login */}
        {lastLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              <FaClock className="inline w-4 h-4 mr-1" />
              Last login
            </label>
            <p className="text-gray-400 bg-gray-800/40 px-3 py-2 rounded-lg">
              {lastLogin.toLocaleDateString()} at {lastLogin.toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Edit/Save Buttons */}
        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
