import { useState, useEffect } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { FaCheckCircle, FaUser, FaChess, FaTrophy } from 'react-icons/fa';
import toast from 'react-hot-toast';

const GoogleWelcomeModal = ({ user, onComplete }) => {
  const { userProfile, updateProfile } = useUserProfile();
  const [showModal, setShowModal] = useState(false);
  const [customUsername, setCustomUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Show modal for new Google users
    if (user && user.isNewUser) {
      setShowModal(true);
      // Pre-fill username suggestion
      setCustomUsername(user.displayName || user.email?.split('@')[0] || '');
    }
  }, [user]);

  const handleUsernameUpdate = async () => {
    if (!customUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    setIsUpdating(true);
    try {
      await updateProfile({
        username: customUsername.trim(),
        profileCompleted: true
      });
      toast.success('Profile updated successfully!');
      setShowModal(false);
      onComplete && onComplete();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    onComplete && onComplete();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900/95 border border-gray-700/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to ChessMaster! 🎉
          </h2>
          <p className="text-gray-300">
            You're now signed in with Google. Let's complete your profile.
          </p>
        </div>

        {/* User Info */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-12 h-12 rounded-full border-2 border-purple-500/30"
              />
            ) : (
              <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                <FaUser className="w-6 h-6 text-purple-400" />
              </div>
            )}
            <div>
              <p className="text-white font-medium">{user.displayName}</p>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Username Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Choose your username
          </label>
          <input
            type="text"
            value={customUsername}
            onChange={(e) => setCustomUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/60 border border-gray-600/60 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80"
            placeholder="Enter your username"
            maxLength={20}
          />
          <p className="text-xs text-gray-400 mt-1">
            This will be your display name in the chess community
          </p>
        </div>

        {/* Features Preview */}
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
          <h3 className="text-purple-300 font-medium mb-3 flex items-center gap-2">
            <FaChess className="w-4 h-4" />
            What you can do:
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-center gap-2">
              <FaTrophy className="w-3 h-3 text-yellow-400" />
              Play chess against AI and other players
            </li>
            <li className="flex items-center gap-2">
              <FaUser className="w-3 h-3 text-blue-400" />
              Customize your profile and track progress
            </li>
            <li className="flex items-center gap-2">
              <FaChess className="w-3 h-3 text-green-400" />
              Join tournaments and climb leaderboards
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleUsernameUpdate}
            disabled={isUpdating || !customUsername.trim()}
            className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleWelcomeModal;
