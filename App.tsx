import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Undo2, Lightbulb, Volume2, VolumeX, Shuffle, Plus } from 'lucide-react';
import { Basket } from './components/Basket';
import { VictoryModal } from './components/VictoryModal';
import { generateLevel, isValidMove, performMove, checkWin, addEmptyBasket, shuffleCurrentBaskets } from './utils/gameLogic';
import { getHintFromAI } from './services/geminiService';
import { BasketModel, FruitType } from './types';
import { LEVELS } from './constants';

const App: React.FC = () => {
  // Game State
  const [level, setLevel] = useState(1);
  const [baskets, setBaskets] = useState<BasketModel[]>([]);
  const [initialBaskets, setInitialBaskets] = useState<BasketModel[]>([]); // Store initial state for restart
  const [selectedBasketId, setSelectedBasketId] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<BasketModel[][]>([]);
  const [isWon, setIsWon] = useState(false);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  
  // Power-up States (Persistent across levels)
  const [addJarLives, setAddJarLives] = useState(3);
  const [shuffleLives, setShuffleLives] = useState(3);

  // Audio Mock State
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize Level
  const initLevel = useCallback((lvl: number) => {
    const config = LEVELS.find(l => l.level === lvl) || LEVELS[LEVELS.length - 1];
    const types = Object.values(FruitType).slice(0, config.types);
    const generatedBaskets = generateLevel({
      basketCount: config.baskets,
      emptyBaskets: config.empty,
      fruitTypes: types,
      shuffleDepth: 2, 
    });
    
    setBaskets(generatedBaskets);
    setInitialBaskets(JSON.parse(JSON.stringify(generatedBaskets))); // Save deep copy of start state
    setHistory([]);
    setMoves(0);
    setIsWon(false);
    setSelectedBasketId(null);
    setHintMessage(null);
  }, []);

  // Load level on mount or level change
  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // Handlers
  const handleBasketClick = async (basketId: string) => {
    if (isWon) return;
    setHintMessage(null);

    // If no basket selected, select this one (if not empty)
    if (!selectedBasketId) {
      const basket = baskets.find(b => b.id === basketId);
      if (basket && basket.fruits.length > 0) {
        setSelectedBasketId(basketId);
      }
      return;
    }

    // If clicking same basket, deselect
    if (selectedBasketId === basketId) {
      setSelectedBasketId(null);
      return;
    }

    // Attempt Move
    const source = baskets.find(b => b.id === selectedBasketId);
    const dest = baskets.find(b => b.id === basketId);

    if (source && dest && isValidMove(source, dest)) {
      // Save history
      setHistory(prev => [...prev, JSON.parse(JSON.stringify(baskets))]);
      
      // Perform move
      let newBaskets = performMove(baskets, selectedBasketId, basketId);
      
      // Check if the destination basket is now completed (Full and same type)
      const targetBasket = newBaskets.find(b => b.id === basketId);
      if (targetBasket) {
        const isFull = targetBasket.fruits.length === targetBasket.capacity;
        const isUniform = targetBasket.fruits.length > 0 && targetBasket.fruits.every(f => f === targetBasket.fruits[0]);
        
        if (isFull && isUniform) {
          // Basket is solved! Remove it from the game.
          newBaskets = newBaskets.filter(b => b.id !== basketId);
        }
      }

      setBaskets(newBaskets);
      setMoves(m => m + 1);
      setSelectedBasketId(null);

      // Check Win
      // We pass the new state (with solved baskets removed) to checkWin.
      // If only empty baskets remain, checkWin should return true.
      if (checkWin(newBaskets)) {
        setTimeout(() => setIsWon(true), 500);
      }
    } else {
      setSelectedBasketId(null);
    }
  };

  const handleUndo = () => {
    if (history.length === 0 || isWon) return;
    const previousState = history[history.length - 1];
    setBaskets(previousState);
    setHistory(prev => prev.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setSelectedBasketId(null);
    setHintMessage(null);
  };

  const handleReset = () => {
    // Restore the exact initial state of the current level
    if (initialBaskets.length > 0) {
      setBaskets(JSON.parse(JSON.stringify(initialBaskets)));
      setHistory([]);
      setMoves(0);
      setIsWon(false);
      setSelectedBasketId(null);
      setHintMessage(null);
    }
  };

  const handleAddJar = () => {
    if (addJarLives > 0 && !isWon) {
      setHistory(prev => [...prev, JSON.parse(JSON.stringify(baskets))]);
      const newBaskets = addEmptyBasket(baskets);
      setBaskets(newBaskets);
      setAddJarLives(prev => prev - 1);
      setHintMessage("Extra basket added! 🏺");
    }
  };

  const handleShuffle = () => {
    if (shuffleLives > 0 && !isWon) {
      setHistory(prev => [...prev, JSON.parse(JSON.stringify(baskets))]);
      const newBaskets = shuffleCurrentBaskets(baskets);
      setBaskets(newBaskets);
      setShuffleLives(prev => prev - 1);
      setHintMessage("Fruits shuffled! 🎲");
      setSelectedBasketId(null);
    }
  };

  const handleAIHint = async () => {
    if (isHintLoading || isWon) return;
    setIsHintLoading(true);
    setHintMessage("Consulting the Garden Sage...");
    
    const result = await getHintFromAI(baskets);
    setIsHintLoading(false);
    
    if (result) {
      setHintMessage(`💡 Move from Basket ${result.fromBasketIndex + 1} to ${result.toBasketIndex + 1}: ${result.explanation}`);
    } else {
      setHintMessage("The Sage is silent. (Check API Key or try again)");
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 flex flex-col overflow-hidden relative selection:bg-green-200">
      
      {/* Garden Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1558223637-259df9a79774?q=80&w=2970&auto=format&fit=crop")',
        }}
      >
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"></div>
      </div>

      {/* Header */}
      <header className="px-4 py-2 sm:py-4 md:py-6 flex justify-between items-center max-w-6xl mx-auto w-full z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/90 backdrop-blur rounded-full shadow-lg flex items-center justify-center text-2xl sm:text-3xl border-2 border-green-100">🍓</div>
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-2xl md:text-3xl text-green-900 leading-none drop-shadow-md shadow-white">Fruit Basket</h1>
            <p className="text-xs text-green-800 font-bold uppercase tracking-widest ml-1 bg-white/50 px-2 py-0.5 rounded-full inline-block">Garden Mix</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-2 rounded-full shadow-lg border border-white/60">
           <div className="text-center">
             <span className="text-[8px] sm:text-[10px] text-green-900/80 font-black uppercase block tracking-wider">Level</span>
             <span className="font-display font-bold text-xl sm:text-2xl text-green-900">{level}</span>
           </div>
           <div className="w-px h-6 sm:h-8 bg-green-900/10"></div>
           <div className="text-center">
             <span className="text-[8px] sm:text-[10px] text-green-900/80 font-black uppercase block tracking-wider">Moves</span>
             <span className="font-display font-bold text-xl sm:text-2xl text-green-900">{moves}</span>
           </div>
        </div>
        
        <button 
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 sm:p-3 rounded-full bg-white/80 hover:bg-white backdrop-blur shadow transition-all text-green-900"
        >
          {soundEnabled ? <Volume2 size={20} className="sm:w-6 sm:h-6" /> : <VolumeX size={20} className="sm:w-6 sm:h-6" />}
        </button>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-[90rem] mx-auto relative z-10 pt-4">
        
        {/* Hint Display */}
        <AnimatePresence>
          {hintMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-8 px-8 py-4 bg-white/95 backdrop-blur-xl border border-green-200 rounded-2xl shadow-xl text-green-900 text-base md:text-lg font-medium max-w-2xl text-center mx-4"
            >
              {hintMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Baskets Grid */}
        <div className="flex flex-wrap justify-center items-end gap-y-12 sm:gap-y-16 pb-24 px-1 sm:px-2 md:px-8 w-full select-none max-w-7xl">
          <AnimatePresence mode="popLayout">
            {baskets.map((basket) => (
              <Basket
                key={basket.id}
                basket={basket}
                isSelected={selectedBasketId === basket.id}
                isValidTarget={!!selectedBasketId && selectedBasketId !== basket.id && isValidMove(baskets.find(b => b.id === selectedBasketId)!, basket)}
                onClick={() => handleBasketClick(basket.id)}
              />
            ))}
          </AnimatePresence>
        </div>

      </main>

      {/* Controls Footer */}
      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-white/50 p-4 pb-6 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-3xl mx-auto flex justify-between items-center px-4 gap-2 md:gap-4">
          
          <button 
            onClick={handleReset}
            className="flex flex-col items-center gap-1 text-gray-800 hover:text-red-600 transition-colors group cursor-pointer active:scale-95"
          >
            <div className="p-3 bg-white rounded-full group-hover:bg-red-50 transition-colors shadow-md border border-gray-100 ring-1 ring-gray-100">
              <RotateCcw size={20} />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide">Restart</span>
          </button>

          {/* New Power-ups */}
          <button 
            onClick={handleShuffle}
            disabled={shuffleLives <= 0}
            className={`flex flex-col items-center gap-1 transition-colors group cursor-pointer active:scale-95 ${shuffleLives <= 0 ? 'opacity-40 cursor-not-allowed' : 'text-gray-800 hover:text-purple-600'}`}
          >
            <div className="p-3 bg-white rounded-full group-hover:bg-purple-50 transition-colors shadow-md border border-gray-100 ring-1 ring-gray-100 relative">
              <Shuffle size={20} />
              {shuffleLives > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {shuffleLives}
                </span>
              )}
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide">Shuffle</span>
          </button>

          <button 
            onClick={handleAddJar}
            disabled={addJarLives <= 0}
            className={`flex flex-col items-center gap-1 transition-colors group cursor-pointer active:scale-95 ${addJarLives <= 0 ? 'opacity-40 cursor-not-allowed' : 'text-gray-800 hover:text-orange-600'}`}
          >
            <div className="p-3 bg-white rounded-full group-hover:bg-orange-50 transition-colors shadow-md border border-gray-100 ring-1 ring-gray-100 relative">
              <Plus size={20} />
              {addJarLives > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {addJarLives}
                </span>
              )}
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide">Add Jar</span>
          </button>

          {/* AI Hint Button (Center) */}
          <button 
            onClick={handleAIHint}
            disabled={isHintLoading}
            className={`
              flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 -mt-8
              rounded-full font-bold text-white shadow-2xl shadow-green-900/20
              transform transition-all active:scale-95 hover:-translate-y-2 hover:shadow-green-500/30
              ${isHintLoading ? 'bg-green-400' : 'bg-gradient-to-br from-green-500 to-emerald-600'}
              border-4 border-white/80
            `}
          >
             <Lightbulb size={24} className={isHintLoading ? 'animate-pulse' : ''} />
          </button>

          <button 
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`flex flex-col items-center gap-1 transition-colors group cursor-pointer active:scale-95 ${history.length === 0 ? 'opacity-40 cursor-not-allowed text-gray-500' : 'text-gray-800 hover:text-blue-600'}`}
          >
            <div className="p-3 bg-white rounded-full group-hover:bg-blue-50 transition-colors shadow-md border border-gray-100 ring-1 ring-gray-100">
              <Undo2 size={20} />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide">Undo</span>
          </button>
          
        </div>
      </footer>

      <VictoryModal 
        isOpen={isWon}
        level={level}
        onNextLevel={() => {
          const nextLevel = level < LEVELS.length ? level + 1 : 1;
          setLevel(nextLevel);
        }}
        onReplay={() => initLevel(level)}
      />

    </div>
  );
};

export default App;