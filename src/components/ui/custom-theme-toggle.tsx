import React from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

interface CustomThemeToggleProps {
  showText?: boolean;
  className?: string;
}

const CustomThemeToggle: React.FC<CustomThemeToggleProps> = ({ 
  showText = true, 
  className = "" 
}) => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 ${className}`}
      title={`Alternar para ${isDark ? 'modo claro' : 'modo escuro'}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 flex-shrink-0" />
      ) : (
        <Moon className="w-4 h-4 flex-shrink-0" />
      )}
      {showText && (
        <span className="font-medium">
          {isDark ? 'Modo Claro' : 'Modo Escuro'}
        </span>
      )}
    </button>
  );
};

export { CustomThemeToggle };