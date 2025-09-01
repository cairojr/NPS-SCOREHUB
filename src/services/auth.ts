import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';

export class AuthService {
  /**
   * Faz login com email e senha
   */
  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Error signing in:', error);
      throw new Error('Credenciais inválidas');
    }

    return data;
  }

  /**
   * Cadastra um novo usuário
   */
  static async signUp(email: string, password: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      throw new Error('Erro ao criar conta');
    }

    return data;
  }

  /**
   * Faz logout
   */
  static async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error);
      throw new Error('Erro ao fazer logout');
    }
  }

  /**
   * Busca o usuário atual
   */
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // Busca dados adicionais do usuário na tabela users
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  }

  /**
   * Verifica se o usuário está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  }

  /**
   * Obtém a sessão atual
   */
  static async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  /**
   * Monitora mudanças no estado de autenticação
   */
  static onAuthStateChange(callback: (authenticated: boolean) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(!!session);
    });
  }

  /**
   * Atualiza o perfil do usuário
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw new Error('Erro ao atualizar perfil');
    }

    return data;
  }

  /**
   * Redefine senha
   */
  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('Error resetting password:', error);
      throw new Error('Erro ao redefinir senha');
    }
  }

  /**
   * Atualiza senha
   */
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      console.error('Error updating password:', error);
      throw new Error('Erro ao atualizar senha');
    }
  }
}