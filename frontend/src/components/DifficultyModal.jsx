import React, { useState } from 'react';
import { FaRobot, FaChessKnight, FaChessQueen, FaChessKing } from 'react-icons/fa';

const DifficultyModal = ({ isOpen, onSelectDifficulty, onCancel }) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  if (!isOpen) return null;

  const difficulties = [
    {
      id: 'easy',
      name: 'Easy',
      icon: <FaChessKnight className="w-8 h-8 text-green-400" />,
      description: 'Perfect for beginners',
      color: 'border-green-400 bg-green-400/10'
    },
    {
      id: 'medium',
      name: 'Medium',
      icon: <FaChessQueen className="w-8 h-8 text-yellow-400" />,
      description: 'Balanced challenge',
      color: 'border-yellow-400 bg-yellow-400/10'
    },
    {
      id: 'hard',
      name: 'Hard',
      icon: <FaChessKing className="w-8 h-8 text-red-400" />,
      description: 'For experienced players',
      color: 'border-red-400 bg-red-400/10'
    }
  ];

  const handleConfirm = () => {
    onSelectDifficulty(selectedDifficulty);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border border-[#242447] rounded-xl p-6 max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#242447] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaRobot className="w-8 h-8 text-[#1717cf]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Choose AI Difficulty</h2>
          <p className="text-gray-300 text-sm">
            Select the difficulty level for your AI opponent
          </p>
        </div>

        {/* Difficulty Options */}
        <div className="space-y-3 mb-6">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.id}
              onClick={() => setSelectedDifficulty(difficulty.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedDifficulty === difficulty.id
                  ? `${difficulty.color} shadow-lg`
                  : 'border-[#242447] hover:border-[#33335a]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${selectedDifficulty === difficulty.id ? difficulty.color : 'bg-[#242447]'}`}>
                  {difficulty.icon}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white">{difficulty.name}</h3>
                  <p className="text-sm text-gray-400">{difficulty.description}</p>
                </div>
                {selectedDifficulty === difficulty.id && (
                  <div className="ml-auto">
                    <div className="w-4 h-4 bg-current rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-[#242447] hover:bg-[#33335a] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-[#1717cf] hover:bg-[#2525e0] text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default DifficultyModal;
