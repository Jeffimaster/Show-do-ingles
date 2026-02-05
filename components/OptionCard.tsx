
import React from 'react';

interface OptionCardProps {
  index: number;
  text: string;
  onClick: () => void;
  disabled: boolean;
  state: 'idle' | 'selected' | 'correct' | 'wrong';
}

export const OptionCard: React.FC<OptionCardProps> = ({ index, text, onClick, disabled, state }) => {
  const letters = ['A', 'B', 'C', 'D'];
  
  const getColors = () => {
    switch (state) {
      case 'selected': return 'bg-yellow-200 border-yellow-400 text-blue-900 scale-[1.01]';
      case 'correct': return 'bg-green-500 border-green-300 text-white animate-pulse';
      case 'wrong': return 'bg-red-500 border-red-300 text-white';
      default: return 'bg-blue-800/20 border-blue-500/30 hover:border-yellow-400/50 hover:bg-blue-700/40 text-white';
    }
  };

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full p-2.5 mb-1 border rounded-lg text-left transition-all duration-200 flex items-center gap-3 group ${getColors()}`}
    >
      <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center font-black text-sm border 
        ${state === 'idle' ? 'bg-blue-900 border-yellow-400/50 text-yellow-400 group-hover:bg-yellow-400 group-hover:text-blue-900' : 'bg-white/10 border-white/20'}`}>
        {letters[index]}
      </div>
      <span className="text-sm font-semibold leading-tight">{text}</span>
    </button>
  );
};
