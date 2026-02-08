import React from 'react';
import { motion } from 'framer-motion';
import { FruitType } from '../types';
import { FRUIT_CONFIG } from '../constants';

interface FruitProps {
  type: FruitType;
  index: number; // Position in stack (0 is bottom)
  isTop: boolean;
}

export const Fruit: React.FC<FruitProps> = ({ type, index, isTop }) => {
  const config = FRUIT_CONFIG[type];

  return (
    <motion.div
      initial={{ scale: 0, y: -20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        w-14 h-14 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-28 lg:h-28
        flex items-center justify-center 
        text-4xl sm:text-5xl md:text-7xl lg:text-8xl 
        select-none relative z-10
        -mb-3 sm:-mb-4 md:-mb-5
      `}
      style={{
        zIndex: index,
      }}
    >
      <span className="filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.2)] hover:scale-110 transition-transform duration-200">
        {config.emoji}
      </span>
    </motion.div>
  );
};