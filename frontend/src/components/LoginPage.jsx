import { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '../firebase/auth';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const LoginPage = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const userData = await signInWithGoogle();

      // Provide different messages for new vs returning users
      if (userData.isNewUser) {
        toast.success(`Welcome to ChessMaster, ${userData.displayName || 'Player'}! 🎉`);
      } else {
        toast.success(`Welcome back, ${userData.displayName || 'Player'}! 👋`);
      }

      onLoginSuccess(userData);
    } catch (error) {
      console.error('Google sign-in error:', error);

      // Handle specific error messages
      if (error.message.includes('cancelled')) {
        toast.error('Google sign-in was cancelled.');
      } else if (error.message.includes('blocked')) {
        toast.error('Pop-up blocked! Please allow pop-ups for this site.');
      } else if (error.message.includes('different sign-in method')) {
        toast.error('Account exists with different sign-in method. Try email/password.');
      } else {
        toast.error('Google sign-in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const user = await signInWithEmail(formData.email, formData.password);
      toast.success(`Welcome back, ${user.displayName || user.email}!`);
      onLoginSuccess(user);
    } catch (error) {
      console.error('Login error:', error);
      if (error.message.includes('verify your email')) {
        toast.error('Please verify your email before signing in. Check your inbox for the verification link.');
      } else if (error.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.');
      } else if (error.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed login attempts. Please try again later.');
      } else {
        toast.error('Failed to sign in. Please try again.');
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
          <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-10 py-4">
            <div className="flex items-center gap-2 sm:gap-3 text-white">
              <svg className="h-6 w-6 sm:h-8 sm:w-8 text-[#1717cf]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8 12l2.5-4h3L11 12l2.5 4h-3L8 12z"></path>
              </svg>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">ChessMaster</h1>
            </div>
            
            <nav className="hidden md:flex items-center gap-4 lg:gap-8 text-sm font-medium text-gray-300">
              <span>Play</span>
              <span>Learn</span>
              <span>Community</span>
              <span>Tools</span>
            </nav>
            
            <div>
              <Link to="/signup">
                <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-[#242447] hover:bg-opacity-80 transition-all text-white text-sm font-bold leading-normal tracking-[0.015em]">
                  <span className="truncate">Sign up</span>
                </button>
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex flex-1 items-center justify-center py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8 min-h-0">
            <div className="w-full max-w-sm p-6 space-y-6 bg-gray-900/70 border border-gray-700/20 rounded-2xl shadow-2xl shadow-purple-500/10 backdrop-blur-md">
              <div>
                <h2 className="mt-4 text-center text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Welcome Back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-300 font-medium">Ready to make your next move?</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-200 tracking-wide">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 bg-gray-800/60 border-2 border-gray-600/60 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-purple-500/25 hover:border-gray-500/80"
                      placeholder="Enter your email address"
                    />
                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300 group-focus-within:text-purple-400 group-focus-within:scale-110" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-200 tracking-wide">
                    Password
                  </label>
                  <div className="relative group">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-3 pl-10 pr-10 bg-gray-800/60 border-2 border-gray-600/60 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-400/80 focus:bg-gray-800/80 focus:shadow-lg focus:shadow-purple-500/25 hover:border-gray-500/80"
                      placeholder="Enter your password"
                    />
                    <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 transition-all duration-300 group-focus-within:text-purple-400 group-focus-within:scale-110" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-all duration-300 focus:outline-none hover:scale-110"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-purple-300 hover:text-purple-200 font-medium transition-all duration-300 hover:underline hover:underline-offset-4"
                  >
                    Forgot password?
                  </Link>
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
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Log in
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    )}
                  </button>
                </div>
              </form>
              
              <div className="relative my-4">
                <div aria-hidden="true" className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-[#1a1a33] px-2 text-gray-400">Or continue with</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-3 px-3 bg-gray-800/80 text-white font-medium text-sm rounded-xl border border-gray-600/50 transition-all duration-300 hover:bg-gray-700/90 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500/50 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <>
                      <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        <path d="M1 1h22v22H1z" fill="none"></path>
                      </svg>
                      <span>Google</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => onLoginSuccess({ displayName: 'Guest Player', isGuest: true })}
                  className="w-full py-3 px-3 bg-gray-800/80 text-white font-medium text-sm rounded-xl border border-gray-600/50 transition-all duration-300 hover:bg-gray-700/90 hover:scale-105 hover:shadow-lg hover:shadow-gray-500/20 focus:outline-none focus:ring-2 focus:ring-gray-500/50 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.13 8.44 9.88v-7.1h-2.54v-2.78h2.54V9.8c0-2.52 1.5-3.92 3.82-3.92 1.1 0 2.22.2 2.22.2v2.38h-1.2c-1.24 0-1.64.78-1.64 1.58v1.88h2.64l-.42 2.78h-2.22v7.1C18.34 21.13 22 16.99 22 12z"></path>
                  </svg>
                  <span>Guest</span>
                </button>
              </div>              <div className="text-center text-sm text-gray-400 mt-4">
                <p>Don't have an account? <Link to="/signup" className="font-medium text-purple-300 hover:text-purple-200 transition-all duration-300 hover:underline hover:underline-offset-4">Sign up</Link></p>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
