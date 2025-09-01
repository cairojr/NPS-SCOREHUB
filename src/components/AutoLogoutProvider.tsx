import React from 'react';
import { useAutoLogout } from '@/hooks/useAutoLogout';

interface AutoLogoutProviderProps {
  children: React.ReactNode;
}

export const AutoLogoutProvider: React.FC<AutoLogoutProviderProps> = ({ children }) => {
  // Ativa logout automático após 3 minutos com aviso de 30 segundos
  useAutoLogout({
    timeoutMinutes: 3,
    warningMinutes: 0.5
  });

  return <>{children}</>;
};