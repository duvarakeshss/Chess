import './App.css'
// import ThreeTest from './components/ThreeTest'
import Chessboard from './components/Chessboard'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <div className="App">
      <Chessboard />
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
    </div>
  )
}

export default App
