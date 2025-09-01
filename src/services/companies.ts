import { supabase } from '@/lib/supabase';
import { Company } from '@/types/database';

export class CompaniesService {
  /**
   * Busca todas as empresas
   */
  static async getAll(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching companies:', error);
      throw new Error('Erro ao carregar empresas');
    }

    return data || [];
  }

  /**
   * Busca uma empresa por ID
   */
  static async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching company:', error);
      return null;
    }

    return data;
  }

  /**
   * Busca uma empresa por slug
   */
  static async getBySlug(slug: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching company by slug:', error);
      return null;
    }

    return data;
  }

  /**
   * Cria uma nova empresa
   */
  static async create(company: Omit<Company, 'id' | 'created_at' | 'updated_at'>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert([company])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      throw new Error('Erro ao criar empresa');
    }

    return data;
  }

  /**
   * Atualiza uma empresa
   */
  static async update(id: string, updates: Partial<Company>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      throw new Error('Erro ao atualizar empresa');
    }

    return data;
  }

  /**
   * Deleta uma empresa
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting company:', error);
      throw new Error('Erro ao deletar empresa');
    }
  }
}