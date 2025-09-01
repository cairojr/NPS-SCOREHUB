-- ScoreHUB Safe Setup - Só executa o que não existe
-- Verificação e criação segura

-- Verifica se tabela companies tem dados
DO $$
BEGIN
    -- Se a tabela companies estiver vazia, insere as empresas
    IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
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
        
        RAISE NOTICE '✅ Inseridas 19 empresas do Grupo Donadel Guimarães';
    ELSE
        RAISE NOTICE '✅ Empresas já existem na tabela';
    END IF;
END $$;

-- Cria tabela users se não existir
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'operator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria tabela evaluations se não existir
CREATE TABLE IF NOT EXISTS public.evaluations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    gender TEXT NOT NULL CHECK (gender IN ('masculino', 'feminino', 'outro', 'prefiro-nao-informar')),
    age INTEGER NOT NULL CHECK (age > 0 AND age <= 120),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id)
);

-- Cria view se não existir
CREATE OR REPLACE VIEW public.evaluation_summary AS
SELECT 
    c.id as company_id,
    c.name as company_name,
    COUNT(e.id) as total_evaluations,
    ROUND(AVG(e.score::numeric), 2) as average_score,
    -- NPS Calculation: % Promoters - % Detractors
    CASE 
        WHEN COUNT(e.id) > 0 THEN
            ROUND(
                (COUNT(CASE WHEN e.score >= 9 THEN 1 END)::numeric / COUNT(e.id)::numeric * 100) -
                (COUNT(CASE WHEN e.score <= 6 THEN 1 END)::numeric / COUNT(e.id)::numeric * 100), 
                1
            )
        ELSE 0
    END as nps_score,
    COUNT(CASE WHEN e.score >= 9 THEN 1 END) as promoters,
    COUNT(CASE WHEN e.score = 7 OR e.score = 8 THEN 1 END) as passives,
    COUNT(CASE WHEN e.score <= 6 THEN 1 END) as detractors,
    MAX(e.created_at) as latest_evaluation
FROM public.companies c
LEFT JOIN public.evaluations e ON c.id = e.company_id
GROUP BY c.id, c.name
ORDER BY c.name;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation (só cria se não existir)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilita RLS se não estiver
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Políticas (só cria se não existir)
DO $$
BEGIN
    -- Companies policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Anyone can view companies') THEN
        CREATE POLICY "Anyone can view companies" ON public.companies FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Authenticated users can insert companies') THEN
        CREATE POLICY "Authenticated users can insert companies" ON public.companies FOR INSERT WITH CHECK (auth.role() = 'authenticated');
    END IF;

    -- Evaluations policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evaluations' AND policyname = 'Anyone can insert evaluations') THEN
        CREATE POLICY "Anyone can insert evaluations" ON public.evaluations FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evaluations' AND policyname = 'Authenticated users can view all evaluations') THEN
        CREATE POLICY "Authenticated users can view all evaluations" ON public.evaluations FOR SELECT USING (auth.role() = 'authenticated');
    END IF;

    -- Users policies  
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Users can view own profile') THEN
        CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
    END IF;
END $$;

-- Indexes (só cria se não existir)
CREATE INDEX IF NOT EXISTS idx_evaluations_company_id ON public.evaluations(company_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON public.evaluations(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluations_score ON public.evaluations(score);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '🎉 ScoreHUB configurado com sucesso!';
    RAISE NOTICE '✅ Tabelas verificadas/criadas';
    RAISE NOTICE '✅ 19 empresas inseridas (se necessário)';  
    RAISE NOTICE '✅ Políticas de segurança ativas';
    RAISE NOTICE '✅ Indexes otimizados';
    RAISE NOTICE '🚀 Pronto para produção!';
END $$;