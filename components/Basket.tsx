import React from 'react';
import { motion } from 'framer-motion';
import { BasketModel } from '../types';
import { Fruit } from './Fruit';
import { BASKET_CAPACITY } from '../constants';

interface BasketProps {
  basket: BasketModel;
  isSelected: boolean;
  isValidTarget: boolean;
  onClick: () => void;
}

export const Basket: React.FC<BasketProps> = ({ basket, isSelected, isValidTarget, onClick }) => {
  const isFull = basket.fruits.length >= BASKET_CAPACITY;
  const isSolved = isFull && basket.fruits.every(f => f === basket.fruits[0]);

  return (
    <motion.div
      layout
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.3 } }}
      className="flex flex-col items-center justify-end h-60 sm:h-72 md:h-[26rem] lg:h-[30rem] w-20 sm:w-24 md:w-36 lg:w-40 relative mx-1 sm:mx-2 md:mx-4 group"
    >
      {/* Click Area / Selection Indicator */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={isSelected ? { y: -20 } : { y: 0 }}
        className={`
          w-full h-full flex flex-col justify-end items-center pb-2 sm:pb-4
          transition-all duration-300 rounded-b-[2rem] sm:rounded-b-[3rem] rounded-t-2xl
          relative outline-none
          ${isValidTarget ? 'cursor-pointer' : ''}
        `}
      >
          {/* Transparent Basket Structure with Black Outline */}
          <div className={`
            absolute bottom-0 w-full h-[60%] z-20 pointer-events-none
            border-[3px] border-t-0
            ${isSolved ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] bg-yellow-400/10' : 'border-black/70'}
            ${isSelected ? 'bg-black/5' : 'bg-transparent'}
            rounded-b-[2rem] sm:rounded-b-[3rem] rounded-t-sm
            transition-all duration-500
            overflow-visible backdrop-blur-[0px]
          `}>
             {/* Rim of the basket */}
             <div className={`
               absolute -top-[3px] left-[-3px] right-[-3px] h-[6px] 
               border-[3px] rounded-full
               ${isSolved ? 'border-yellow-500' : 'border-black/70'}
             `}></div>
          </div>
          
          {/* Fruits Stack */}
          <div className="flex flex-col-reverse items-center justify-start w-full mb-6 sm:mb-8 z-10 pb-2 sm:pb-4">
             {basket.fruits.map((fruit, index) => (
               <Fruit 
                 key={`${basket.id}-${index}`} 
                 type={fruit} 
                 index={index} 
                 isTop={index === basket.fruits.length - 1} 
               />
             ))}
          </div>

          {/* Selection Arrow/Indicator */}
          {isSelected && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="absolute -top-12 sm:-top-16 text-3xl sm:text-5xl filter drop-shadow-lg animate-bounce"
             >
               👇
             </motion.div>
          )}

          {isSolved && (
             <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-8 sm:-bottom-10 bg-yellow-400 text-yellow-900 text-[10px] sm:text-sm font-black px-2 sm:px-4 py-1 sm:py-2 rounded-full shadow-xl z-30 tracking-wider border-2 border-yellow-600 whitespace-nowrap"
             >
               MATCH!
             </motion.div>
          )}

      </motion.button>
    </motion.div>
  );
};