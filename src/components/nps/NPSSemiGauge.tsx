import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface NPSSemiGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  companyName?: string;
}

const NPSSemiGauge: React.FC<NPSSemiGaugeProps> = ({ 
  score, 
  size = 'lg', 
  showLabels = true,
  companyName 
}) => {
  const [npsScore, setNpsScore] = useState(0);
  
  // Calculate NPS based on all evaluations for the company
  useEffect(() => {
    if (companyName) {
      const evaluations = JSON.parse(localStorage.getItem('scorehub_evaluations') || '[]');
      const companyEvaluations = evaluations.filter((evaluation: { empresa: string; score: number }) => evaluation.empresa === companyName);
      
      if (companyEvaluations.length > 0) {
        const promoters = companyEvaluations.filter((evaluation: { empresa: string; score: number }) => evaluation.score >= 9).length;
        const detractors = companyEvaluations.filter((evaluation: { empresa: string; score: number }) => evaluation.score <= 6).length;
        const total = companyEvaluations.length;
        
        const calculatedNPS = Math.round(((promoters - detractors) / total) * 100);
        setNpsScore(calculatedNPS);
      }
    }
  }, [companyName, score]);

  const sizeClasses = {
    sm: 'w-72 h-36',
    md: 'w-80 h-40',
    lg: 'w-96 h-48'
  };

  // Calculate angle for the needle (0-10 scale mapped to 180 degrees)
  const angle = (score / 10) * 180 - 90;

  const getScoreDetails = (score: number) => {
    if (score <= 3) return {
      text: 'Muito Ruim',
      emoji: '😞',
      color: '#DC2626',
      bgColor: 'from-red-50 to-red-100',
      textColor: 'text-red-600',
      zone: 'DETRACTORS'
    };
    if (score <= 6) return {
      text: 'Ruim', 
      emoji: '☹️',
      color: '#EF4444',
      bgColor: 'from-red-50 to-red-100',
      textColor: 'text-red-600',
      zone: 'DETRACTORS'
    };
    if (score <= 7) return {
      text: 'Regular',
      emoji: '😐',
      color: '#F59E0B',
      bgColor: 'from-yellow-50 to-yellow-100',
      textColor: 'text-yellow-600',
      zone: 'PASSIVES'
    };
    if (score <= 8) return {
      text: 'Bom',
      emoji: '🙂',
      color: '#F59E0B',
      bgColor: 'from-yellow-50 to-yellow-100',
      textColor: 'text-yellow-600',
      zone: 'PASSIVES'
    };
    return {
      text: 'Excelente',
      emoji: '😊',
      color: '#059669',
      bgColor: 'from-green-50 to-green-100',
      textColor: 'text-green-600',
      zone: 'PROMOTERS'
    };
  };

  const scoreDetails = getScoreDetails(score);
  const radius = size === 'sm' ? 100 : size === 'md' ? 120 : 150;
  const strokeWidth = size === 'sm' ? 18 : size === 'md' ? 22 : 28;
  const needleLength = radius - 35;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Main Gauge */}
      <div className={`relative ${sizeClasses[size]} flex items-end justify-center`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-full backdrop-blur-sm"></div>
        <svg 
          className="w-full h-full drop-shadow-xl" 
          viewBox={`0 0 ${radius * 2 + 60} ${radius + 50}`}
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Premium gradients matching the reference images */}
            <linearGradient id="detractorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#F87171" />
            </linearGradient>
            <linearGradient id="passiveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>
            <linearGradient id="promoterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--muted))" />
              <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.2)" />
            </linearGradient>
            
            {/* Shadow filters */}
            <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.15)"/>
            </filter>
          </defs>
          
          {/* Background track with premium look */}
          <path
            d={`M ${30} ${radius + 30} A ${radius} ${radius} 0 0 1 ${radius * 2 + 30} ${radius + 30}`}
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth={strokeWidth + 6}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
            opacity="0.3"
          />
          
          {/* Detractor segment (0-6) - Red gradient */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            d={`M ${30} ${radius + 30} A ${radius} ${radius} 0 0 1 ${radius + 30 + radius * Math.cos(Math.PI * 0.6)} ${radius + 30 + radius * Math.sin(Math.PI * 0.6)}`}
            fill="none"
            stroke="url(#detractorGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
          />
          
          {/* Passive segment (7-8) - Amber gradient */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            d={`M ${radius + 30 + radius * Math.cos(Math.PI * 0.6)} ${radius + 30 + radius * Math.sin(Math.PI * 0.6)} A ${radius} ${radius} 0 0 1 ${radius + 30 + radius * Math.cos(Math.PI * 0.2)} ${radius + 30 + radius * Math.sin(Math.PI * 0.2)}`}
            fill="none"
            stroke="url(#passiveGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
          />
          
          {/* Promoter segment (9-10) - Green gradient */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
            d={`M ${radius + 30 + radius * Math.cos(Math.PI * 0.2)} ${radius + 30 + radius * Math.sin(Math.PI * 0.2)} A ${radius} ${radius} 0 0 1 ${radius * 2 + 30} ${radius + 30}`}
            fill="none"
            stroke="url(#promoterGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#gaugeShadow)"
          />
          
          {/* Score markers */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((marker) => {
            const markerAngle = (marker / 10) * 180;
            const markerRad = (markerAngle * Math.PI) / 180;
            const isMainMarker = marker % 2 === 0 || marker === 6 || marker === 8;
            const markerSize = isMainMarker ? 12 : 6;
            const x1 = (radius + 30) + (radius - markerSize) * Math.cos(markerRad);
            const y1 = (radius + 30) + (radius - markerSize) * Math.sin(markerRad);
            const x2 = (radius + 30) + (radius + 5) * Math.cos(markerRad);
            const y2 = (radius + 30) + (radius + 5) * Math.sin(markerRad);
            
            return (
              <line
                key={marker}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="hsl(var(--foreground))"
                strokeWidth={isMainMarker ? "3" : "2"}
                strokeLinecap="round"
                opacity={isMainMarker ? "0.8" : "0.4"}
              />
            );
          })}
          
          {/* Zone labels */}
          <text x={radius * 0.4} y={radius + 15} 
                fill="#DC2626" 
                fontSize="12" 
                fontWeight="600" 
                textAnchor="middle">
            DETRACTORS
          </text>
          <text x={radius + 30} y={radius * 0.4} 
                fill="#F59E0B" 
                fontSize="12" 
                fontWeight="600" 
                textAnchor="middle">
            PASSIVES
          </text>
          <text x={radius * 1.6 + 30} y={radius + 15} 
                fill="#059669" 
                fontSize="12" 
                fontWeight="600" 
                textAnchor="middle">
            PROMOTERS
          </text>
          
          {/* Animated needle with premium design */}
          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ 
              duration: 2, 
              type: "spring", 
              stiffness: 60,
              damping: 12,
              delay: 0.8
            }}
            style={{ transformOrigin: `${radius + 30}px ${radius + 30}px` }}
          >
            {/* Needle shadow */}
            <line
              x1={radius + 30}
              y1={radius + 30}
              x2={radius + 30 + needleLength + 2}
              y2={radius + 30 + 2}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Main needle */}
            <line
              x1={radius + 30}
              y1={radius + 30}
              x2={radius + 30 + needleLength}
              y2={radius + 30}
              stroke={scoreDetails.color}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Needle base circle with gradient */}
            <circle
              cx={radius + 30}
              cy={radius + 30}
              r="12"
              fill="url(#trackGradient)"
              stroke={scoreDetails.color}
              strokeWidth="3"
              filter="url(#gaugeShadow)"
            />
            {/* Inner circle */}
            <circle
              cx={radius + 30}
              cy={radius + 30}
              r="6"
              fill={scoreDetails.color}
            />
            {/* Needle tip */}
            <circle
              cx={radius + 30 + needleLength}
              cy={radius + 30}
              r="4"
              fill={scoreDetails.color}
              filter="url(#gaugeShadow)"
            />
          </motion.g>
        </svg>

        {/* Center NPS Score Display */}
        {companyName && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, type: "spring" }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 shadow-xl border"
          >
            <div className="text-center">
              <div className="text-sm font-medium text-muted-foreground mb-1">NPS Score</div>
              <div className="text-3xl font-bold text-primary">{npsScore}</div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Score display with emoji and text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, type: "spring" }}
        className={`text-center p-6 rounded-3xl bg-gradient-to-br ${scoreDetails.bgColor} dark:from-gray-800 dark:to-gray-900 border-2 border-white/20 shadow-2xl backdrop-blur-sm`}
      >
        <div className="text-5xl mb-3">{scoreDetails.emoji}</div>
        <div className={`text-3xl md:text-4xl font-bold ${scoreDetails.textColor} mb-2`}>
          {score}/10
        </div>
        <div className={`text-xl font-semibold ${scoreDetails.textColor} mb-1`}>
          {scoreDetails.text}
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {scoreDetails.zone}
        </div>
      </motion.div>
      
      {/* Enhanced scale labels */}
      {showLabels && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="flex justify-between w-full max-w-md text-sm text-muted-foreground font-medium"
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg"></div>
            <span className="text-center">0-6<br/>Detratores</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full shadow-lg"></div>
            <span className="text-center">7-8<br/>Neutros</span>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-lg"></div>
            <span className="text-center">9-10<br/>Promotores</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export { NPSSemiGauge };