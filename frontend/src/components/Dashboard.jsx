import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaChess, FaUsers, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-[#111122] text-white min-h-screen w-full h-screen">
      <div className="relative flex w-full h-full min-h-screen flex-col overflow-hidden">
        {/* Chess Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-10"></div>

        <div className="relative flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#242447]/50 bg-[#111122]/80 px-4 sm:px-6 lg:px-10 py-4 backdrop-blur-sm">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[#1717cf]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8 12l2.5-4h3L11 12l2.5 4h-3L8 12z"></path>
              </svg>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">ChessMaster</h1>
            </button>

            {/* Profile Section */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#242447]/50 hover:bg-[#242447]/70 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <FaUser className="h-4 w-4 text-purple-300" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {user?.displayName || user?.email || 'Player'}
                </span>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a33] border border-[#242447]/50 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-[#242447]/50">
                    <p className="text-sm font-medium text-white">{user?.displayName || 'Player'}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#242447]/50 hover:text-white transition-all duration-300"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 items-center justify-center py-8 px-4 sm:px-6 lg:px-8 min-h-0">
            <div className="w-full max-w-4xl">
              {/* Welcome Section */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent mb-4">
                  Welcome back, {user?.displayName || 'Player'}!
                </h2>
                <p className="text-gray-400 text-lg">Choose your game mode to start playing</p>
              </div>

              {/* Game Mode Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* Single Player Card */}
                <Link to="/single-player" className="group">
                  <div className="bg-gray-900/70 border border-gray-700/20 rounded-2xl p-8 hover:bg-gray-800/80 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600/30 transition-all duration-300">
                        <FaChess className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Single Player</h3>
                      <p className="text-gray-400 mb-6">Play against the computer with adjustable difficulty levels</p>
                      <div className="inline-flex items-center gap-2 text-purple-400 font-medium">
                        <span>Start Game</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Two Player Card */}
                <Link to="/multiplayer" className="group">
                  <div className="bg-gray-900/70 border border-gray-700/20 rounded-2xl p-8 hover:bg-gray-800/80 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-600/30 transition-all duration-300">
                        <FaUsers className="h-8 w-8 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Two Player</h3>
                      <p className="text-gray-400 mb-6">Play against another player locally on the same device</p>
                      <div className="inline-flex items-center gap-2 text-purple-400 font-medium">
                        <span>Start Game</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="bg-gray-900/50 border border-gray-700/20 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">0</div>
                  <div className="text-sm text-gray-400">Games Played</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/20 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">0</div>
                  <div className="text-sm text-gray-400">Games Won</div>
                </div>
                <div className="bg-gray-900/50 border border-gray-700/20 rounded-xl p-6 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">1200</div>
                  <div className="text-sm text-gray-400">Rating</div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
