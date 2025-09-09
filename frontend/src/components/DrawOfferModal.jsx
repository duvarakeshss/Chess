import React from 'react';
import { FaHandshake, FaTimes, FaCheck } from 'react-icons/fa';

const DrawOfferModal = ({ isOpen, onAccept, onDecline, onCancel, playerName = "Opponent" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] border border-[#242447] rounded-xl p-6 max-w-sm w-full shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#242447] rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHandshake className="w-8 h-8 text-[#1717cf]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Draw Offer</h2>
          <p className="text-gray-300 text-sm">
            {playerName} has offered a draw. Do you accept?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDecline}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            <FaTimes className="text-sm" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            <FaCheck className="text-sm" />
            Accept
          </button>
        </div>

        {/* Cancel button for the offerer */}
        <button
          onClick={onCancel}
          className="w-full mt-3 text-gray-400 hover:text-white text-sm py-2 transition-colors"
        >
          Cancel Offer
        </button>
      </div>
    </div>
  );
};

export default DrawOfferModal;
