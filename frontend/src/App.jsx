import './App.css'
import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import PromotionPage from './components/PromotionPage'
import Dashboard from './components/Dashboard'
import Header from './components/Header'
import Chessboard from './components/Chessboard'
import TwoPlayerGame from './components/TwoPlayerGame'
import SinglePlayerGame from './components/SinglePlayerGame'
import GoogleWelcomeModal from './components/GoogleWelcomeModal'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentUser, setCurrentUser] = useState(null)
  const [showGoogleWelcome, setShowGoogleWelcome] = useState(false)
  const navigate = useNavigate()

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData)

    // Show welcome modal for new Google users
    if (userData.isNewUser) {
      setShowGoogleWelcome(true)
    }

    // Navigate to dashboard after successful login
    navigate('/')
  }

  const handleSignupSuccess = (userData) => {
    setCurrentUser(userData)
    // Navigate to dashboard after successful signup
    navigate('/')
  }

  const handleGoogleWelcomeComplete = () => {
    setShowGoogleWelcome(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111122] flex items-center justify-center text-white" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1717cf] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Loading ChessMaster...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Routes>
        {/* Public routes - redirect to dashboard if already authenticated */}
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <PromotionPage />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage onSignupSuccess={handleSignupSuccess} />} />

        {/* Protected routes - require authentication */}
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
        <Route path="/single-player" element={user ? <SinglePlayerGame /> : <Navigate to="/login" replace />} />
        <Route path="/multiplayer" element={user ? <TwoPlayerGame /> : <Navigate to="/login" replace />} />
      </Routes>
      {showGoogleWelcome && currentUser && (
        <GoogleWelcomeModal
          user={currentUser}
          onComplete={handleGoogleWelcomeComplete}
        />
      )}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
