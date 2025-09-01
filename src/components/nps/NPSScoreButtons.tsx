import React from 'react';
import { motion } from 'framer-motion';

interface NPSScoreButtonsProps {
  selectedScore?: number;
  onScoreSelect: (score: number) => void;
}

const NPSScoreButtons: React.FC<NPSScoreButtonsProps> = ({ selectedScore, onScoreSelect }) => {
  const getButtonClass = (score: number) => {
    const baseClass = "nps-score-btn";
    
    if (selectedScore === score) {
      if (score <= 6) return `${baseClass} nps-detractor ring-4 ring-red-200 scale-110`;
      if (score <= 8) return `${baseClass} nps-passive ring-4 ring-yellow-200 scale-110`;
      return `${baseClass} nps-promoter ring-4 ring-green-200 scale-110`;
    }
    
    if (score <= 6) return `${baseClass} nps-detractor opacity-80`;
    if (score <= 8) return `${baseClass} nps-passive opacity-80`;
    return `${baseClass} nps-promoter opacity-80`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-6 md:grid-cols-11 gap-2 md:gap-3 justify-items-center max-w-4xl mx-auto">
        {Array.from({ length: 11 }, (_, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onScoreSelect(i)}
            className={getButtonClass(i)}
          >
            {i}
          </motion.button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-between text-xs text-muted-foreground max-w-2xl mx-auto px-4">
        <div className="text-center">
          <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded mx-auto mb-1"></div>
          <div>Detratores</div>
          <div className="font-medium">0 - 6</div>
        </div>
        
        <div className="text-center">
          <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded mx-auto mb-1"></div>
          <div>Neutros</div>
          <div className="font-medium">7 - 8</div>
        </div>
        
        <div className="text-center">
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded mx-auto mb-1"></div>
          <div>Promotores</div>
          <div className="font-medium">9 - 10</div>
        </div>
      </div>
    </div>
  );
};

export { NPSScoreButtons };