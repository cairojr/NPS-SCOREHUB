import { supabase } from '@/lib/supabase';
import { Evaluation, EvaluationFormData, EvaluationFilters, NPSBreakdown } from '@/types/database';

export class EvaluationsService {
  /**
   * Cria uma nova avaliação
   */
  static async create(evaluationData: EvaluationFormData): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .insert([evaluationData])
      .select(`
        *,
        companies(name)
      `)
      .single();

    if (error) {
      console.error('Error creating evaluation:', error);
      throw new Error('Erro ao criar avaliação');
    }

    return data;
  }

  /**
   * Busca todas as avaliações com filtros opcionais
   */
  static async getAll(filters?: EvaluationFilters): Promise<Evaluation[]> {
    let query = supabase
      .from('evaluations')
      .select(`
        *,
        companies(name, slug)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (filters?.company_id) {
      query = query.eq('company_id', filters.company_id);
    }

    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }

    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    if (filters?.min_score !== undefined) {
      query = query.gte('score', filters.min_score);
    }

    if (filters?.max_score !== undefined) {
      query = query.lte('score', filters.max_score);
    }

    if (filters?.gender) {
      query = query.eq('gender', filters.gender);
    }

    if (filters?.age_from !== undefined) {
      query = query.gte('age', filters.age_from);
    }

    if (filters?.age_to !== undefined) {
      query = query.lte('age', filters.age_to);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching evaluations:', error);
      throw new Error('Erro ao carregar avaliações');
    }

    return data || [];
  }

  /**
   * Busca avaliações por empresa
   */
  static async getByCompany(companyId: string): Promise<Evaluation[]> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        companies(name, slug)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluations by company:', error);
      throw new Error('Erro ao carregar avaliações da empresa');
    }

    return data || [];
  }

  /**
   * Calcula NPS para uma empresa específica
   */
  static async calculateNPS(companyId?: string): Promise<NPSBreakdown> {
    let query = supabase.from('evaluations').select('score');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error calculating NPS:', error);
      throw new Error('Erro ao calcular NPS');
    }

    const evaluations = data || [];
    const total = evaluations.length;

    if (total === 0) {
      return {
        promoters: 0,
        passives: 0,
        detractors: 0,
        nps_score: 0,
        total_evaluations: 0
      };
    }

    const promoters = evaluations.filter(e => e.score >= 9).length;
    const passives = evaluations.filter(e => e.score === 7 || e.score === 8).length;
    const detractors = evaluations.filter(e => e.score <= 6).length;

    const nps_score = Math.round(((promoters / total) - (detractors / total)) * 100);

    return {
      promoters,
      passives,
      detractors,
      nps_score,
      total_evaluations: total
    };
  }

  /**
   * Busca estatísticas de avaliações do dia atual
   */
  static async getTodayStats(): Promise<{
    total_today: number;
    average_score_today: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('evaluations')
      .select('score')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    if (error) {
      console.error('Error fetching today stats:', error);
      return { total_today: 0, average_score_today: 0 };
    }

    const evaluations = data || [];
    const total_today = evaluations.length;
    const average_score_today = total_today > 0 
      ? Math.round((evaluations.reduce((sum, e) => sum + e.score, 0) / total_today) * 10) / 10 
      : 0;

    return {
      total_today,
      average_score_today
    };
  }

  /**
   * Busca uma avaliação por ID
   */
  static async getById(id: string): Promise<Evaluation | null> {
    const { data, error } = await supabase
      .from('evaluations')
      .select(`
        *,
        companies(name, slug)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching evaluation:', error);
      return null;
    }

    return data;
  }

  /**
   * Atualiza uma avaliação
   */
  static async update(id: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const { data, error } = await supabase
      .from('evaluations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        companies(name, slug)
      `)
      .single();

    if (error) {
      console.error('Error updating evaluation:', error);
      throw new Error('Erro ao atualizar avaliação');
    }

    return data;
  }

  /**
   * Deleta uma avaliação
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting evaluation:', error);
      throw new Error('Erro ao deletar avaliação');
    }
  }
}