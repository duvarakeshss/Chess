import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chessboard from './Chessboard';
import DifficultyModal from './DifficultyModal';
import { FaArrowLeft, FaRobot, FaBrain } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const SinglePlayerGame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chessboardRef = useRef(null);

  const [showDifficultyModal, setShowDifficultyModal] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [player1Time, setPlayer1Time] = useState(300); // 5 minutes in seconds
  const [player2Time, setPlayer2Time] = useState(300); // 5 minutes in seconds
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastAIMove, setLastAIMove] = useState(null);

  const handleMoveHistoryUpdate = (newHistory) => {
    console.log('Move history updated:', newHistory);
    setMoveHistory([...newHistory]);
  };

  const handleCurrentPlayerChange = (newPlayer) => {
    const playerNumber = newPlayer === 'white' ? 1 : 2;
    setCurrentPlayer(playerNumber);

    // If it's now the AI's turn (black), make AI move
    if (newPlayer === 'black' && selectedDifficulty && chessboardRef.current) {
      // Small delay to make AI move feel more natural
      setTimeout(() => {
        if (chessboardRef.current) {
          const aiMove = chessboardRef.current.makeAIMove(selectedDifficulty);
          if (aiMove) {
            setLastAIMove(aiMove);
            toast.success(`AI moved: ${aiMove.from} → ${aiMove.to}`, {
              duration: 2000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #242447',
              },
            });
          }
        }
      }, 1000);
    }
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (isGameActive) {
      interval = setInterval(() => {
        if (currentPlayer === 1) {
          setPlayer1Time(prev => {
            if (prev <= 1) {
              setIsGameActive(false);
              return 0;
            }
            return prev - 1;
          });
        } else {
          setPlayer2Time(prev => {
            if (prev <= 1) {
              setIsGameActive(false);
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentPlayer, isGameActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectDifficulty = (difficulty) => {
    setSelectedDifficulty(difficulty);
    setShowDifficultyModal(false);
    setGameStarted(true);
    setIsGameActive(true);

    toast.success(`Starting ${difficulty} difficulty game!`, {
      duration: 2000,
      style: {
        background: '#1a1a2e',
        color: '#fff',
        border: '1px solid #242447',
      },
    });
  };

  const handleCancelDifficulty = () => {
    navigate('/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case 'easy': return <FaBrain className="text-green-400" />;
      case 'medium': return <FaBrain className="text-yellow-400" />;
      case 'hard': return <FaBrain className="text-red-400" />;
      default: return <FaBrain className="text-gray-400" />;
    }
  };

  return (
    <div className="flex h-screen w-full flex-col text-white bg-[#111122]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-solid border-b-[#242447] px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="size-6 text-[#1717cf]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM8 12l2.5-4h3L11 12l2.5 4h-3L8 12z"></path>
            </svg>
            <h1 className="text-xl font-bold">ChessMaster</h1>
          </button>
          {selectedDifficulty && (
            <div className="flex items-center gap-2 ml-4">
              <FaRobot className="text-[#1717cf]" />
              <span className="text-sm text-gray-300">vs AI</span>
              <span className={`text-sm font-semibold capitalize ${getDifficultyColor(selectedDifficulty)}`}>
                {selectedDifficulty}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${user?.photoURL || 'https://via.placeholder.com/40'}")` }}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 min-h-0">
        {/* Chess Board Area */}
        <div className="flex-1 flex items-center justify-start pl-0 pr-0 min-w-0">
          <div className="relative aspect-square w-screen h-full bg-[#1a1a2e] rounded-md overflow-hidden" style={{ marginLeft: '-10rem', marginRight: '0' }}>
            {gameStarted && (
              <Chessboard
                ref={chessboardRef}
                multiplayer={false}
                aiEnabled={true}
                aiDifficulty={selectedDifficulty}
                onMoveHistoryUpdate={handleMoveHistoryUpdate}
                onCurrentPlayerChange={handleCurrentPlayerChange}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="flex w-96 flex-col border-l border-solid border-l-[#242447] bg-[#18182f] flex-shrink-0 min-h-0">
          {/* Player Information */}
          <div className="flex-shrink-0 p-4">
            {/* Player (You) */}
            <div className="flex justify-between items-center bg-[#242447] p-3 rounded-md mb-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${user?.photoURL || 'https://via.placeholder.com/40'}")` }}></div>
                <div>
                  <div className="font-bold">You</div>
                  <div className="text-sm text-gray-400">Human</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${currentPlayer === 1 ? 'text-green-400' : 'text-gray-400'}`}>
                {formatTime(player1Time)}
              </div>
            </div>

            {/* AI Player */}
            <div className="flex justify-between items-center bg-[#111122] p-3 rounded-md">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#242447] flex items-center justify-center">
                  <FaRobot className="text-[#1717cf] text-lg" />
                </div>
                <div>
                  <div className="font-bold flex items-center gap-2">
                    AI {getDifficultyIcon(selectedDifficulty)}
                  </div>
                  <div className={`text-sm capitalize ${getDifficultyColor(selectedDifficulty)}`}>
                    {selectedDifficulty || 'Not selected'}
                  </div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${currentPlayer === 2 ? 'text-green-400' : 'text-gray-400'}`}>
                {formatTime(player2Time)}
              </div>
            </div>
          </div>

          {/* Last AI Move */}
          {lastAIMove && (
            <div className="flex-shrink-0 p-4 border-y border-solid border-[#242447]">
              <h3 className="text-lg font-bold mb-2">Last AI Move</h3>
              <div className="bg-[#242447] p-3 rounded-md">
                <div className="text-center">
                  <div className="text-2xl font-mono font-bold text-[#1717cf] mb-1">
                    {lastAIMove.from} → {lastAIMove.to}
                  </div>
                  <div className="text-sm text-gray-400">
                    {lastAIMove.piece} moved
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Move History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="mb-2 text-lg font-bold">Move History</h3>
            <div className="text-sm text-gray-300 leading-relaxed font-mono bg-[#242447] p-3 rounded-md max-h-96 overflow-y-auto">
              <div className="space-y-1">
                {moveHistory && moveHistory.length > 0 ? (
                  moveHistory.map((move, index) => (
                    <div key={index}>
                      {Math.floor(index / 2) + 1}.{index % 2 === 0 ? '' : ' '}{move.notation}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 italic">No moves yet</div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Difficulty Selection Modal */}
      <DifficultyModal
        isOpen={showDifficultyModal}
        onSelectDifficulty={handleSelectDifficulty}
        onCancel={handleCancelDifficulty}
      />
    </div>
  );
};

export default SinglePlayerGame;
