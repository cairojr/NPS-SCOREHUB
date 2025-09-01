// Database Types para ScoreHUB
export interface Company {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'operator';
  created_at: string;
  updated_at: string;
}

export interface Evaluation {
  id: string;
  company_id: string;
  score: number; // 0-10
  gender: 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar';
  age: number;
  comment?: string;
  created_at: string;
  created_by?: string;
}

export interface EvaluationSummary {
  company_id: string;
  company_name: string;
  total_evaluations: number;
  average_score: number;
  nps_score: number;
  promoters: number;
  passives: number;
  detractors: number;
  latest_evaluation: string;
}

// Tipos para formulários
export interface EvaluationFormData {
  company_id: string;
  score: number;
  gender: 'masculino' | 'feminino' | 'outro' | 'prefiro-nao-informar';
  age: number;
  comment?: string;
}

export interface CompanyWithStats extends Company {
  total_evaluations?: number;
  average_score?: number;
  nps_score?: number;
}

// Enums para validação
export enum Gender {
  MASCULINO = 'masculino',
  FEMININO = 'feminino',
  OUTRO = 'outro',
  PREFIRO_NAO_INFORMAR = 'prefiro-nao-informar'
}

export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator'
}

// Tipos para relatórios
export interface NPSBreakdown {
  promoters: number;
  passives: number;
  detractors: number;
  nps_score: number;
  total_evaluations: number;
}

export interface EvaluationFilters {
  company_id?: string;
  date_from?: string;
  date_to?: string;
  min_score?: number;
  max_score?: number;
  gender?: Gender;
  age_from?: number;
  age_to?: number;
}