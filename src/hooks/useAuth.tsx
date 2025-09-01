import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthService } from '@/services/auth';
import { User } from '@/types/database';
import { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se Supabase está configurado
    if (!isSupabaseConfigured()) {
      // Fallback para localStorage
      const isAuthenticated = localStorage.getItem('scorehub_admin_authenticated') === 'true';
      if (isAuthenticated) {
        // Cria um usuário mock para testes
        setUser({
          id: 'mock-user',
          email: 'hubcentrodeinovacao@gmail.com',
          full_name: 'Admin ScoreHUB',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setSession({ access_token: 'mock-token' } as Session);
      }
      setLoading(false);
      return;
    }

    // Carrega sessão inicial do Supabase
    const loadSession = async () => {
      try {
        const session = await AuthService.getSession();
        setSession(session);

        if (session) {
          const user = await AuthService.getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Monitora mudanças na autenticação
    const { data: { subscription } } = AuthService.onAuthStateChange(async (authenticated) => {
      if (authenticated) {
        const session = await AuthService.getSession();
        const user = await AuthService.getCurrentUser();
        setSession(session);
        setUser(user);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Fallback para localStorage - validação simples
        if (email === 'hubcentrodeinovacao@gmail.com' && password === 'Soudecristo') {
          localStorage.setItem('scorehub_admin_authenticated', 'true');
          setUser({
            id: 'mock-user',
            email: 'hubcentrodeinovacao@gmail.com',
            full_name: 'Admin ScoreHUB',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          setSession({ access_token: 'mock-token' } as Session);
        } else {
          throw new Error('Credenciais inválidas');
        }
      } else {
        const { user: authUser, session } = await AuthService.signIn(email, password);
        setSession(session);
        
        if (authUser) {
          const userProfile = await AuthService.getCurrentUser();
          setUser(userProfile);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        // Fallback para localStorage
        localStorage.removeItem('scorehub_admin_authenticated');
        setUser(null);
        setSession(null);
      } else {
        await AuthService.signOut();
        setUser(null);
        setSession(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!session
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para garantir que o usuário está autenticado
export const useAuthRequired = (): AuthContextType => {
  const auth = useAuth();
  
  if (!auth.loading && !auth.isAuthenticated) {
    throw new Error('Authentication required');
  }
  
  return auth;
};