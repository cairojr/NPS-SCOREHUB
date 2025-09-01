import React from 'react';
import { motion } from 'framer-motion';

interface NPSGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const NPSGauge: React.FC<NPSGaugeProps> = ({ score, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  const radius = size === 'sm' ? 50 : size === 'md' ? 80 : 100;
  const strokeWidth = size === 'sm' ? 8 : size === 'md' ? 12 : 16;
  const circumference = 2 * Math.PI * radius * 0.75; // 3/4 circle
  
  // Calculate angle for the needle (0-10 scale mapped to 270 degrees)
  const angle = (score / 10) * 270 - 135; // -135 to start from left

  const getScoreColor = (score: number) => {
    if (score <= 6) return '#EF4444'; // Red
    if (score <= 8) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  };

  const getScoreZone = (score: number) => {
    if (score <= 6) return 'Detratores';
    if (score <= 8) return 'Neutros';
    return 'Promotores';
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background arc */}
          <path
            d={`M 25 150 A ${radius} ${radius} 0 0 1 175 150`}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored segments */}
          {/* Red segment (0-6) */}
          <path
            d={`M 25 150 A ${radius} ${radius} 0 0 1 ${100 + radius * Math.cos(Math.PI * 0.4)} ${150 + radius * Math.sin(Math.PI * 0.4)}`}
            fill="none"
            stroke="#EF4444"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.7}
          />
          
          {/* Yellow segment (7-8) */}
          <path
            d={`M ${100 + radius * Math.cos(Math.PI * 0.4)} ${150 + radius * Math.sin(Math.PI * 0.4)} A ${radius} ${radius} 0 0 1 ${100 + radius * Math.cos(Math.PI * 0.2)} ${150 + radius * Math.sin(Math.PI * 0.2)}`}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.7}
          />
          
          {/* Green segment (9-10) */}
          <path
            d={`M ${100 + radius * Math.cos(Math.PI * 0.2)} ${150 + radius * Math.sin(Math.PI * 0.2)} A ${radius} ${radius} 0 0 1 175 150`}
            fill="none"
            stroke="#10B981"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity={0.7}
          />
          
          {/* Needle */}
          <motion.g
            initial={{ rotate: -135 }}
            animate={{ rotate: angle }}
            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            style={{ transformOrigin: '100px 150px' }}
          >
            <line
              x1="100"
              y1="150"
              x2={100 - (radius - 20)}
              y2="150"
              stroke={getScoreColor(score)}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="150"
              r="8"
              fill={getScoreColor(score)}
            />
          </motion.g>
          
          {/* Score markers */}
          {[0, 2, 4, 6, 8, 10].map((marker) => {
            const markerAngle = (marker / 10) * 270 - 135;
            const markerRad = (markerAngle * Math.PI) / 180;
            const x1 = 100 + (radius - 15) * Math.cos(markerRad);
            const y1 = 150 + (radius - 15) * Math.sin(markerRad);
            const x2 = 100 + (radius - 5) * Math.cos(markerRad);
            const y2 = 150 + (radius - 5) * Math.sin(markerRad);
            
            return (
              <line
                key={marker}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6B7280"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        {/* Score display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="text-center"
          >
            <div 
              className="text-4xl md:text-5xl font-bold mb-2"
              style={{ color: getScoreColor(score) }}
            >
              {score}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {getScoreZone(score)}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Labels */}
      <div className="flex justify-between w-full max-w-xs mt-4 text-xs text-muted-foreground">
        <span>0 - Muito ruim</span>
        <span>10 - Excelente</span>
      </div>
    </div>
  );
};

export { NPSGauge };