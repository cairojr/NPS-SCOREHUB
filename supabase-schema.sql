-- ScoreHUB Database Schema for Supabase
-- Grupo Donadel Guimarães NPS System

-- Enable RLS (Row Level Security) globally
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create companies table
CREATE TABLE public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    gender TEXT NOT NULL CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro-nao-informar')),
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Insert companies (19 companies from Grupo Donadel Guimarães)
INSERT INTO public.companies (name, slug) VALUES
    ('Posto Point Centro', 'posto-point-centro'),
    ('Posto Point J. Vitória', 'posto-point-j-vitoria'),
    ('Posto Point - União do Norte', 'posto-point-uniao-do-norte'),
    ('Posto Point - Cachoeira da Serra', 'posto-point-cachoeira-da-serra'),
    ('Posto Tigre Centro', 'posto-tigre-centro'),
    ('Posto Tigre Filial', 'posto-tigre-filial'),
    ('Posto Caiuri', 'posto-caiuri'),
    ('Hospital Jardim Vitória', 'hospital-jardim-vitoria'),
    ('CIG (Centro de Imagens Guarantã)', 'cig-centro-imagens-guaranta'),
    ('Laboratório Jardim Vitória - Guarantã', 'laboratorio-jardim-vitoria-guaranta'),
    ('Clínica do Trabalhador', 'clinica-do-trabalhador'),
    ('CEMEP - Centro de Especialidades Eldo Peixoto', 'cemep-centro-especialidades-eldo-peixoto'),
    ('Laboratório Jardim Vitória - União do Norte', 'laboratorio-jardim-vitoria-uniao-do-norte'),
    ('Laboratório Jardim Vitória - Colíder', 'laboratorio-jardim-vitoria-colider'),
    ('Laboratório Jardim Vitória - Nova Guarita', 'laboratorio-jardim-vitoria-nova-guarita'),
    ('Clínica e Laboratório Jardim Vitória - Terra Nova', 'clinica-laboratorio-jardim-vitoria-terra-nova'),
    ('Clínica e Laboratório Jardim Vitória - Castelo do Sonhos', 'clinica-laboratorio-jardim-vitoria-castelo-do-sonhos'),
    ('Clínica e Laboratório Jardim Vitória - Moraes Almeida', 'clinica-laboratorio-jardim-vitoria-moraes-almeida'),
    ('CINP (Centro de Imagens Novo Progresso)', 'cinp-centro-imagens-novo-progresso');

-- Create evaluation summary view for reports
CREATE OR REPLACE VIEW public.evaluation_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(e.id) as total_evaluations,
    ROUND(AVG(e.score::numeric), 2) as average_score,
    -- NPS Calculation: % Promoters - % Detractors
    ROUND(
        (COUNT(CASE WHEN e.score >= 9 THEN 1 END)::numeric / COUNT(e.id)::numeric * 100) -
        (COUNT(CASE WHEN e.score <= 6 THEN 1 END)::numeric / COUNT(e.id)::numeric * 100), 
        1
    ) as nps_score,
    COUNT(CASE WHEN e.score >= 9 THEN 1 END) as promoters,
    COUNT(CASE WHEN e.score = 7 OR e.score = 8 THEN 1 END) as passives,
    COUNT(CASE WHEN e.score <= 6 THEN 1 END) as detractors,
    MAX(e.created_at) as latest_evaluation
FROM public.companies c
LEFT JOIN public.evaluations e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Companies: Everyone can read, only authenticated users can modify
CREATE POLICY "Anyone can view companies" ON public.companies 
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert companies" ON public.companies 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update companies" ON public.companies 
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Users: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage users" ON public.users 
    FOR ALL USING (auth.role() = 'service_role');

-- Evaluations: Anyone can insert, authenticated users can view all
CREATE POLICY "Anyone can insert evaluations" ON public.evaluations 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view all evaluations" ON public.evaluations 
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update evaluations" ON public.evaluations 
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete evaluations" ON public.evaluations 
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_evaluations_company_id ON public.evaluations(company_id);
CREATE INDEX idx_evaluations_created_at ON public.evaluations(created_at);
CREATE INDEX idx_evaluations_score ON public.evaluations(score);
CREATE INDEX idx_companies_slug ON public.companies(slug);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;