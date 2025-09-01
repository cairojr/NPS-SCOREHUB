import { useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface UseAutoLogoutProps {
  timeoutMinutes?: number;
  warningMinutes?: number;
}

export const useAutoLogout = ({ 
  timeoutMinutes = 3, 
  warningMinutes = 0.5 
}: UseAutoLogoutProps = {}) => {
  const { signOut, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    // Limpa timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    if (!isAuthenticated) return;

    // Timer de aviso (30 segundos antes do logout)
    const warningTime = (timeoutMinutes - warningMinutes) * 60 * 1000;
    warningRef.current = setTimeout(() => {
      toast({
        title: "⚠️ Sessão expirando",
        description: `Sua sessão expirará em ${warningMinutes * 60} segundos por inatividade.`,
        variant: "destructive",
      });
    }, warningTime);

    // Timer de logout automático
    const timeoutTime = timeoutMinutes * 60 * 1000;
    timeoutRef.current = setTimeout(async () => {
      toast({
        title: "🔒 Sessão expirada",
        description: "Você foi desconectado por inatividade.",
        variant: "destructive",
      });
      
      setTimeout(async () => {
        await signOut();
      }, 2000); // Aguarda 2s para mostrar o toast
    }, timeoutTime);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Inicia o timer
    resetTimer();

    // Eventos que resetam o timer (atividade do usuário)
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Adiciona listeners para detectar atividade
    const resetTimerHandler = () => resetTimer();
    
    events.forEach(event => {
      document.addEventListener(event, resetTimerHandler, true);
    });

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      
      events.forEach(event => {
        document.removeEventListener(event, resetTimerHandler, true);
      });
    };
  }, [isAuthenticated, timeoutMinutes, warningMinutes]);

  return { resetTimer };
};