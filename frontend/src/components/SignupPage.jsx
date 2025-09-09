import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaLockOpen } from 'react-icons/fa';
import { signUpWithEmail } from '../firebase/auth';
import { isUsernameAvailable } from '../firebase/userService';
import toast from 'react-hot-toast';

const SignupPage = ({ onSignupSuccess }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password should be at least 6 characters long!');
      return;
    }

    setIsLoading(true);
    try {
      // Check if username is available
      const usernameAvailable = await isUsernameAvailable(formData.username);
      if (!usernameAvailable) {
        toast.error('Username is already taken. Please choose a different username.');
        setIsLoading(false);
        return;
      }

      const user = await signUpWithEmail(formData.email, formData.password, formData.username);

      toast.success('Account created successfully! Please check your email for verification link.');

      // Navigate to login page after successful signup
      navigate('/login');

    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else {
        toast.error('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#111122] text-white min-h-screen w-full h-screen">
      <div className="relative flex w-full h-full min-h-screen flex-col overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1580541832626-2a7131ee809f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center opacity-10"></div>
        <div className="relative flex h-full flex-col">
          {/* Header */}
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#242447] px-4 sm:px-6 lg:px-10 py-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 sm:gap-3 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[#1717cf]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8 12l2.5-4h3L11 12l2.5 4h-3L8 12z"></path>
              </svg>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">ChessMaster</h1>
            </button>

            <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium text-gray-300">
              <span>Play</span>
              <span>Learn</span>
              <span>Community</span>
              <span>Watch</span>
              <span>Tools</span>
            </nav>

            <div>
              <Link to="/login">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-[#242447] hover:bg-opacity-80 transition-all text-white text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Log In</span>
                </button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 items-center justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 min-h-0">
            <div className="w-full max-w-sm p-6 space-y-6 bg-gray-900/70 border border-gray-700/20 rounded-2xl shadow-2xl shadow-purple-500/10 backdrop-blur-md">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Create your account
                </h2>
                <p className="text-gray-400 mt-2 font-medium">Join the ultimate chess community.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="sr-only">Username</label>
                  <div className="relative group">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300 group-focus-within:text-purple-400 group-focus-within:scale-110" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 bg-gray-800/60 border-2 border-gray-600/60 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-purple-500/25 hover:border-gray-500/80"
                      placeholder="Username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="sr-only">Email</label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300 group-focus-within:text-purple-400 group-focus-within:scale-110" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 bg-gray-800/60 border-2 border-gray-600/60 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-purple-500/25 hover:border-gray-500/80"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative group">
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300 group-focus-within:text-purple-400 group-focus-within:scale-110" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 bg-gray-800/60 border-2 border-gray-600/60 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-purple-500/25 hover:border-gray-500/80"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                  <div className="relative group">
                    <FaLockOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300 group-focus-within:text-purple-400 group-focus-within:scale-110" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 bg-gray-800/60 border-2 border-gray-600/60 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-purple-500/25 hover:border-gray-500/80"
                      placeholder="Confirm Password"
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white font-semibold text-sm rounded-xl transition-all duration-300 hover:from-purple-500 hover:via-purple-600 hover:to-indigo-600 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:ring-offset-2 focus:ring-offset-gray-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Account...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Sign Up
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>

              <div className="text-center text-sm text-gray-400 mt-4">
                <p>Already have an account? <Link to="/login" className="font-medium text-purple-300 hover:text-purple-200 transition-all duration-300 hover:underline hover:underline-offset-4">Log In</Link></p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
