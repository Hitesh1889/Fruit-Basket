import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
  isOpen: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  level: number;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ isOpen, onNextLevel, onReplay, level }) => {
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center border-4 border-yellow-400 relative overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-yellow-50 -z-10" />
            
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-display font-bold text-amber-800 mb-2">Delicious!</h2>
            <p className="text-gray-600 mb-8 font-sans">Level {level} Complete</p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={onNextLevel}
                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
              >
                Next Level <span>➡️</span>
              </button>
              
              <button
                onClick={onReplay}
                className="w-full py-3 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl font-bold text-lg transform transition active:scale-95"
              >
                Replay Level
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
