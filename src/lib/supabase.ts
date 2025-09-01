import { createClient } from '@supabase/supabase-js';

// Essas variáveis serão configuradas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Verifica se o Supabase está configurado
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://placeholder.supabase.co' && 
         supabaseAnonKey !== 'placeholder-key';
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos do banco de dados
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      evaluations: {
        Row: {
          id: string;
          company_id: string;
          score: number;
          gender: string;
          age: number;
          comment: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          score: number;
          gender: string;
          age: number;
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          company_id?: string;
          score?: number;
          gender?: string;
          age?: number;
          comment?: string | null;
          created_at?: string;
          created_by?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      evaluation_summary: {
        Row: {
          company_id: string;
          company_name: string;
          total_evaluations: number;
          average_score: number;
          nps_score: number;
          promoters: number;
          passives: number;
          detractors: number;
          latest_evaluation: string;
        };
      };
    };
  };
}

// Cliente tipado
export const supabaseTyped = createClient<Database>(supabaseUrl, supabaseAnonKey);