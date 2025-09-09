import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chessboard from './Chessboard';
import DrawOfferModal from './DrawOfferModal';
import { FaArrowLeft, FaUndo, FaFlag, FaHandshake } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const TwoPlayerGame = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const chessboardRef = useRef(null);
  const [player1Time, setPlayer1Time] = useState(300); // 5 minutes in seconds
  const [player2Time, setPlayer2Time] = useState(300); // 5 minutes in seconds
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [isGameActive, setIsGameActive] = useState(true);
  const [moveHistory, setMoveHistory] = useState([]);
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [drawOfferedBy, setDrawOfferedBy] = useState(null); // 1 for player1, 2 for player2

  const handleMoveHistoryUpdate = (newHistory) => {
    console.log('Move history updated:', newHistory);
    setMoveHistory([...newHistory]);
  };

  const handleCurrentPlayerChange = (newPlayer) => {
    const playerNumber = newPlayer === 'white' ? 1 : 2;
    setCurrentPlayer(playerNumber);
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

  const handleUndo = () => {
    if (chessboardRef.current) {
      chessboardRef.current.undoMove();
    }
  };

  const handleResign = () => {
    if (chessboardRef.current) {
      chessboardRef.current.resignGame();
    }
  };

  const handleDraw = () => {
    setDrawOfferedBy(currentPlayer);
    setShowDrawModal(true);
  };

  const handleAcceptDraw = () => {
    // Reset game state
    setPlayer1Time(300); // Reset to 5 minutes
    setPlayer2Time(300); // Reset to 5 minutes
    setCurrentPlayer(1);
    setIsGameActive(true);
    setMoveHistory([]);
    setDrawOfferedBy(null);

    // Reset chessboard
    if (chessboardRef.current) {
      chessboardRef.current.restartGame();
    }

    setShowDrawModal(false);
    toast.success('Draw accepted! Game restarted.', {
      duration: 3000,
      style: {
        background: '#1a1a2e',
        color: '#fff',
        border: '1px solid #242447',
      },
    });
  };

  const handleDeclineDraw = () => {
    // Just close the modal
    setShowDrawModal(false);
    setDrawOfferedBy(null);
    toast.error('Draw declined. Game continues.', {
      duration: 3000,
      style: {
        background: '#1a1a2e',
        color: '#fff',
        border: '1px solid #242447',
      },
    });
  };

  const handleCancelDraw = () => {
    // Just close the modal
    setShowDrawModal(false);
    setDrawOfferedBy(null);
    toast.info('Draw offer cancelled.', {
      duration: 2000,
      style: {
        background: '#1a1a2e',
        color: '#fff',
        border: '1px solid #242447',
      },
    });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
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
        </div>

        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${user?.photoURL || 'https://via.placeholder.com/40'}")` }}></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 min-h-0">
        {/* Chess Board Area */}
        <div className="flex-1 flex items-center justify-start pl-0 pr-0 min-w-0">
          <div className="relative aspect-square w-screen h-full bg-[#1a1a2e] rounded-md overflow-hidden" style={{ marginLeft: '-10rem', marginRight: '0rem' }}>
            <Chessboard
              ref={chessboardRef}
              multiplayer={true}
              onMoveHistoryUpdate={handleMoveHistoryUpdate}
              onCurrentPlayerChange={handleCurrentPlayerChange}
            />
          </div>
        </div>
        {/* Sidebar */}
        <aside className="flex w-96 flex-col border-l border-solid border-l-[#242447] bg-[#18182f] flex-shrink-0 min-h-0">
          {/* Player Information */}
          <div className="flex-shrink-0 p-4">
            {/* Player 1 (Opponent) */}
            <div className="flex justify-between items-center bg-[#242447] p-3 rounded-md mb-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover bg-center bg-gray-600 flex items-center justify-center">
                  <span className="text-white font-bold">P1</span>
                </div>
                <div>
                  <div className="font-bold">Player 1</div>
                  <div className="text-sm text-gray-400">1200</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${currentPlayer === 1 ? 'text-green-400' : 'text-gray-400'}`}>
                {formatTime(player1Time)}
              </div>
            </div>

            {/* Player 2 (You) */}
            <div className="flex justify-between items-center bg-[#111122] p-3 rounded-md">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-cover bg-center" style={{ backgroundImage: `url("${user?.photoURL || 'https://via.placeholder.com/40'}")` }}></div>
                <div>
                  <div className="font-bold">You</div>
                  <div className="text-sm text-gray-400">1250</div>
                </div>
              </div>
              <div className={`text-2xl font-bold ${currentPlayer === 2 ? 'text-green-400' : 'text-gray-400'}`}>
                {formatTime(player2Time)}
              </div>
            </div>
          </div>

          {/* Game Controls */}
          <div className="flex-shrink-0 p-4 border-y border-solid border-[#242447]">
            <div className="flex justify-center gap-2">
              <button
                onClick={handleUndo}
                className="flex items-center gap-2 rounded-md bg-[#242447] px-4 py-2 text-sm font-bold hover:bg-[#33335a] transition-colors"
              >
                <FaUndo className="text-base" />
                Undo
              </button>
              <button
                onClick={handleResign}
                className="flex items-center gap-2 rounded-md bg-[#242447] px-4 py-2 text-sm font-bold hover:bg-[#33335a] transition-colors"
              >
                <FaFlag className="text-base" />
                Resign
              </button>
              <button
                onClick={handleDraw}
                className="flex items-center gap-2 rounded-md bg-[#242447] px-4 py-2 text-sm font-bold hover:bg-[#33335a] transition-colors"
              >
                <FaHandshake className="text-base" />
                Draw
              </button>
            </div>
          </div>

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

      {/* Draw Offer Modal */}
      <DrawOfferModal
        isOpen={showDrawModal}
        onAccept={handleAcceptDraw}
        onDecline={handleDeclineDraw}
        onCancel={handleCancelDraw}
        playerName={drawOfferedBy === 1 ? "Player 1" : "Player 2"}
      />
    </div>
  );
};

export default TwoPlayerGame;
