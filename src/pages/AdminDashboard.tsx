import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ExpandableSidebar } from '@/components/ui/expandable-sidebar';
import { 
  BarChart3, 
  Building2, 
  Users, 
  Download, 
  Calendar,
  TrendingUp,
  MessageSquare,
  Filter,
  RefreshCw
} from 'lucide-react';
import { CompaniesService } from '@/services/companies';
import { EvaluationsService } from '@/services/evaluations';
import type { Company, Evaluation } from '@/types/database';

interface CompanyNPSData {
  company: Company;
  nps_score: number;
  total_evaluations: number;
  promoters: number;
  passives: number;
  detractors: number;
  average_score: number;
  recent_evaluations: Evaluation[];
}

const AdminDashboard: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [companyNPSData, setCompanyNPSData] = useState<CompanyNPSData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Function to load all data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Load companies and evaluations from Supabase
      const [companiesData, evaluationsData] = await Promise.all([
        CompaniesService.getAll(),
        EvaluationsService.getAll()
      ]);

      setCompanies(companiesData);
      setEvaluations(evaluationsData);

      // Process data by company
      const companyData: CompanyNPSData[] = [];
      
      for (const company of companiesData) {
        const companyEvaluations = evaluationsData.filter(e => e.company_id === company.id);
        
        if (companyEvaluations.length > 0) {
          const npsBreakdown = await EvaluationsService.calculateNPS(company.id);
          const averageScore = companyEvaluations.reduce((sum, e) => sum + e.score, 0) / companyEvaluations.length;
          
          companyData.push({
            company,
            ...npsBreakdown,
            average_score: Math.round(averageScore * 10) / 10,
            recent_evaluations: companyEvaluations.slice(0, 5) // Last 5 evaluations
          });
        }
      }
      
      // Sort by NPS score (best first)
      companyData.sort((a, b) => b.nps_score - a.nps_score);
      setCompanyNPSData(companyData);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      
      // Fallback to localStorage if Supabase fails
      const stored = localStorage.getItem('scorehub_evaluations');
      if (stored) {
        const data = JSON.parse(stored).map((item: { timestamp: string | Date }) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setEvaluations(data as Evaluation[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadDashboardData]);

  // Get filtered data based on selected company and date
  const getFilteredData = () => {
    let filteredEvaluations = evaluations;
    let filteredCompanyData = companyNPSData;

    // Filter by company
    if (selectedCompany !== 'all') {
      const company = companies.find(c => c.id === selectedCompany);
      filteredEvaluations = evaluations.filter(e => e.company_id === selectedCompany);
      filteredCompanyData = companyNPSData.filter(cd => cd.company.id === selectedCompany);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      filteredEvaluations = filteredEvaluations.filter(e => 
        new Date(e.created_at) >= startDate
      );
    }

    return { evaluations: filteredEvaluations, companyData: filteredCompanyData };
  };

  const { evaluations: filteredEvaluations, companyData: filteredCompanyData } = getFilteredData();

  // Calculate overall NPS from filtered data
  const calculateOverallNPS = () => {
    if (filteredEvaluations.length === 0) return { nps: 0, detractors: 0, passive: 0, promoters: 0 };
    
    const detractors = filteredEvaluations.filter(e => e.score <= 6).length;
    const passive = filteredEvaluations.filter(e => e.score >= 7 && e.score <= 8).length;
    const promoters = filteredEvaluations.filter(e => e.score >= 9).length;
    
    const total = filteredEvaluations.length;
    const nps = Math.round(((promoters - detractors) / total) * 100);
    
    return {
      nps,
      detractors: Math.round((detractors / total) * 100),
      passive: Math.round((passive / total) * 100),
      promoters: Math.round((promoters / total) * 100)
    };
  };

  const getAverageScore = () => {
    if (filteredEvaluations.length === 0) return 0;
    const sum = filteredEvaluations.reduce((acc, e) => acc + e.score, 0);
    return (sum / filteredEvaluations.length).toFixed(1);
  };

  const getNPSColor = (nps: number) => {
    if (nps >= 50) return 'text-green-600';
    if (nps >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getNPSClassification = (nps: number) => {
    if (nps < 0) return { label: 'CRÍTICO', color: 'bg-red-500', textColor: 'text-red-600' };
    if (nps < 50) return { label: 'REGULAR', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    return { label: 'EXCELENTE', color: 'bg-green-500', textColor: 'text-green-600' };
  };

  const exportData = (format: 'json' | 'csv') => {
    const companyName = selectedCompany === 'all' ? 'todas-empresas' : 
      companies.find(c => c.id === selectedCompany)?.name.toLowerCase().replace(/\s+/g, '-') || 'dados';
      
    if (format === 'json') {
      const dataStr = JSON.stringify(filteredEvaluations, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scorehub-${companyName}-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    } else if (format === 'csv') {
      const headers = ['Empresa', 'Score', 'Sexo', 'Idade', 'Comentário', 'Data'];
      const csvData = [
        headers.join(','),
        ...filteredEvaluations.map(e => {
          const company = companies.find(c => c.id === e.company_id);
          return [
            `"${company?.name || 'N/A'}"`,
            e.score,
            `"${e.gender}"`,
            e.age,
            `"${e.comment || ''}"`,
            `"${new Date(e.created_at).toLocaleString('pt-BR')}"`
          ].join(',');
        })
      ].join('\n');
      
      const dataBlob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scorehub-${companyName}-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  const { nps, detractors, passive, promoters } = calculateOverallNPS();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <ExpandableSidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-12 ml-0 transition-all duration-300 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="title-hero mb-4">Dashboard Administrativo</h1>
            <div className="flex items-center gap-4">
              <p className="text-lg text-muted-foreground">Análises do ScoreHUB - Sistema NPS Premium</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Dados em tempo real</span>
                <span>•</span>
                <span>Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={loadDashboardData}
              variant="outline"
              size="sm"
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              onClick={() => {
                localStorage.removeItem('scorehub_admin_authenticated');
                window.location.href = '/';
              }}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="card-elegant p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <span className="font-medium">Filtros:</span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1">
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="select-elegant">
                    <Building2 className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Empresas</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="select-elegant">
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Últimos 7 dias</SelectItem>
                    <SelectItem value="month">Últimos 30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => exportData('csv')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={() => exportData('json')} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Score NPS</p>
                <p className={`text-4xl font-bold ${getNPSColor(nps)} mb-1`}>
                  {nps > 0 ? '+' : ''}{nps}
                </p>
                <div className="flex items-center gap-1">
                  <div className="text-xs font-medium px-2 py-1 bg-muted dark:bg-muted/50 text-foreground rounded-full">
                    {nps >= 50 ? 'Excelente' : nps >= 0 ? 'Bom' : 'Crítico'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <TrendingUp className="w-10 h-10 text-primary mb-2" />
                <div className="text-xs text-muted-foreground">Net Promoter Score</div>
              </div>
            </div>
          </Card>

          <Card className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Nota Média</p>
                <p className="text-4xl font-bold text-primary mb-1">{getAverageScore()}</p>
                <div className="text-xs text-muted-foreground">de 10.0</div>
              </div>
              <div className="text-right">
                <BarChart3 className="w-10 h-10 text-secondary mb-2" />
                <div className="text-xs text-muted-foreground">Pontuação Média</div>
              </div>
            </div>
          </Card>

          <Card className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Avaliações</p>
                <p className="text-4xl font-bold text-accent mb-1">{filteredEvaluations.length}</p>
                <div className="text-xs text-muted-foreground">respostas coletadas</div>
              </div>
              <div className="text-right">
                <Users className="w-10 h-10 text-accent mb-2" />
                <div className="text-xs text-muted-foreground">Base de Dados</div>
              </div>
            </div>
          </Card>

          <Card className="card-gradient p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Com Comentários</p>
                <p className="text-4xl font-bold text-tertiary mb-1">
                  {filteredEvaluations.filter(e => e.comment).length}
                </p>
                <div className="text-xs text-muted-foreground">
                  {filteredEvaluations.length > 0 ? 
                    Math.round((filteredEvaluations.filter(e => e.comment).length / filteredEvaluations.length) * 100) : 0
                  }% do total
                </div>
              </div>
              <div className="text-right">
                <MessageSquare className="w-10 h-10 text-tertiary mb-2" />
                <div className="text-xs text-muted-foreground">Feedback Qualitativo</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Company Breakdown - Only show when viewing all companies */}
        {selectedCompany === 'all' && companyNPSData.length > 0 && (
          <Card className="card-gradient p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="title-section">Performance por Empresa</h3>
              <div className="text-sm text-muted-foreground">
                {companyNPSData.length} empresas com avaliações
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companyNPSData.slice(0, 6).map((companyData, index) => {
                const classification = getNPSClassification(companyData.nps_score);
                
                return (
                  <Card key={companyData.company.id} className="relative p-4 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20">
                    {/* Score médio no canto */}
                    <div className="absolute top-2 right-2 flex flex-col items-end">
                      <div className={`text-xs font-bold ${classification.textColor} mb-1`}>
                        +{companyData.average_score} SCORE
                      </div>
                      <div className={`px-2 py-1 rounded-full text-white text-xs font-bold ${classification.color}`}>
                        {classification.label}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3 pr-20">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-primary'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${getNPSColor(companyData.nps_score)}`}>
                        {companyData.nps_score > 0 ? '+' : ''}{companyData.nps_score}
                      </div>
                    </div>
                  
                  <div className="mb-3">
                    <h4 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                      {companyData.company.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {companyData.total_evaluations} avaliações • Média: {companyData.average_score}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      <div className="font-bold text-red-600">{companyData.detractors}</div>
                      <div className="text-red-500">Det.</div>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                      <div className="font-bold text-yellow-600">{companyData.passives}</div>
                      <div className="text-yellow-500">Neu.</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                      <div className="font-bold text-green-600">{companyData.promoters}</div>
                      <div className="text-green-500">Pro.</div>
                    </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {companyNPSData.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  Ver todas as {companyNPSData.length} empresas
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Guia de Interpretação do NPS */}
        <Card className="card-gradient p-6 mb-8">
          <div className="mb-6">
            <h3 className="title-section flex items-center gap-2">
              📊 Guia de Interpretação do NPS
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              O NPS varia de -100 a +100. Quanto mais alto, melhor. Use este guia para entender seu desempenho e as ações estratégicas recomendadas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Crítico */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  🚨
                </div>
                <div>
                  <h4 className="font-bold text-red-800 dark:text-red-300">CRÍTICO</h4>
                  <p className="text-xs text-red-600 dark:text-red-400">-100 a 0</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <h5 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-2">O que significa:</h5>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Muitos clientes insatisfeitos (detratores). Risco alto de cancelamento e boca a boca negativo.
                  </p>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <h5 className="font-semibold text-red-800 dark:text-red-300 text-sm mb-2">Ações recomendadas:</h5>
                  <ul className="text-xs text-red-700 dark:text-red-400 space-y-1">
                    <li>• Encontrar principais causas da insatisfação</li>
                    <li>• Follow-up ativo com detratores</li>
                    <li>• Ajustar processos de atendimento</li>
                    <li>• Implementar melhorias rápidas</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Regular */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  😐
                </div>
                <div>
                  <h4 className="font-bold text-yellow-800 dark:text-yellow-300">REGULAR</h4>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">1 a 49</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2">O que significa:</h5>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Há mais promotores que detratores, mas não o suficiente para crescimento sustentável.
                  </p>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <h5 className="font-semibold text-yellow-800 dark:text-yellow-300 text-sm mb-2">Ações recomendadas:</h5>
                  <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
                    <li>• Mapear pontos fortes e reforçá-los</li>
                    <li>• Melhorar tempo de resposta</li>
                    <li>• Trabalhar retenção e fidelização</li>
                    <li>• Engajar clientes satisfeitos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Excelente */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  🚀
                </div>
                <div>
                  <h4 className="font-bold text-green-800 dark:text-green-300">EXCELENTE</h4>
                  <p className="text-xs text-green-600 dark:text-green-400">50 a 100</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <h5 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2">O que significa:</h5>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Forte base de promotores. Clientes leais recomendam sua marca ativamente.
                  </p>
                </div>
                
                <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3">
                  <h5 className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2">Ações recomendadas:</h5>
                  <ul className="text-xs text-green-700 dark:text-green-400 space-y-1">
                    <li>• Programa de indicações (referrals)</li>
                    <li>• Usar feedback como prova social</li>
                    <li>• Manter padrão de excelência</li>
                    <li>• Advocacy: defensores da marca</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Dica Extra */}
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                💡
              </div>
              <div>
                <h5 className="font-semibold text-primary mb-2">Dica Estratégica:</h5>
                <p className="text-sm text-muted-foreground">
                  O ideal não é apenas olhar o número do NPS, mas também as <strong>respostas abertas</strong> que os clientes dão junto com a nota. 
                  O feedback qualitativo mostra exatamente onde atacar para subir de nível.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* NPS Breakdown - Enhanced Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* NPS Distribution */}
          <Card className="card-gradient p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="title-section">Distribuição NPS</h3>
              <div className="text-sm text-muted-foreground">
                Total: {filteredEvaluations.length} avaliações
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md"></div>
                    <div className="text-xs text-red-600 font-medium mt-1">😞</div>
                  </div>
                  <div>
                    <span className="font-semibold text-red-800">Detratores</span>
                    <div className="text-sm text-red-600">Notas 0-6</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-600">{detractors}%</div>
                  <div className="text-sm text-red-500">
                    {filteredEvaluations.filter(e => e.score <= 6).length} pessoas
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md"></div>
                    <div className="text-xs text-yellow-600 font-medium mt-1">😐</div>
                  </div>
                  <div>
                    <span className="font-semibold text-yellow-800">Neutros</span>
                    <div className="text-sm text-yellow-600">Notas 7-8</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-600">{passive}%</div>
                  <div className="text-sm text-yellow-500">
                    {filteredEvaluations.filter(e => e.score >= 7 && e.score <= 8).length} pessoas
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-md"></div>
                    <div className="text-xs text-green-600 font-medium mt-1">😊</div>
                  </div>
                  <div>
                    <span className="font-semibold text-green-800">Promotores</span>
                    <div className="text-sm text-green-600">Notas 9-10</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{promoters}%</div>
                  <div className="text-sm text-green-500">
                    {filteredEvaluations.filter(e => e.score >= 9).length} pessoas
                  </div>
                </div>
              </div>
            </div>

            {/* NPS Formula */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="text-center">
                <div className="text-sm text-blue-600 font-medium mb-2">Cálculo NPS</div>
                <div className="text-xs text-blue-700">
                  NPS = % Promotores ({promoters}%) - % Detratores ({detractors}%) = 
                  <span className={`font-bold ${getNPSColor(nps)} ml-1`}>
                    {nps > 0 ? '+' : ''}{nps}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Demographics */}
          <Card className="card-gradient p-6">
            <h3 className="title-section mb-6">Perfil Demográfico</h3>
            <div className="space-y-6">
              {/* Gender distribution */}
              <div>
                <p className="text-sm font-semibold mb-3 text-foreground">Distribuição por Sexo</p>
                <div className="space-y-2">
                  {['masculino', 'feminino', 'outro', 'prefiro-nao-informar'].map(gender => {
                    const count = filteredEvaluations.filter(e => e.gender === gender).length;
                    const percentage = filteredEvaluations.length > 0 ? Math.round((count / filteredEvaluations.length) * 100) : 0;
                    return (
                      <div key={gender} className="flex justify-between items-center p-2 bg-muted/50 dark:bg-card/50 rounded-lg">
                        <span className="capitalize text-sm font-medium">
                          {gender === 'prefiro-nao-informar' ? 'Não informado' : gender}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{count}</div>
                          <div className="text-xs text-muted-foreground">({percentage}%)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Age groups */}
              <div>
                <p className="text-sm font-semibold mb-3 text-foreground">Faixas Etárias</p>
                <div className="space-y-2">
                  {[
                    { label: '18-25', min: 18, max: 25 },
                    { label: '26-35', min: 26, max: 35 },
                    { label: '36-50', min: 36, max: 50 },
                    { label: '51+', min: 51, max: 120 }
                  ].map(range => {
                    const count = filteredEvaluations.filter(e => e.age >= range.min && e.age <= range.max).length;
                    const percentage = filteredEvaluations.length > 0 ? Math.round((count / filteredEvaluations.length) * 100) : 0;
                    return (
                      <div key={range.label} className="flex justify-between items-center p-2 bg-muted/50 dark:bg-card/50 rounded-lg">
                        <span className="text-sm font-medium">{range.label} anos</span>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{count}</div>
                          <div className="text-xs text-muted-foreground">({percentage}%)</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Evaluations */}
        <Card className="card-gradient p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="title-section">Avaliações Recentes</h3>
            <Badge variant="outline">{filteredEvaluations.length} total</Badge>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-2">Empresa</th>
                  <th className="text-left p-2">Score</th>
                  <th className="text-left p-2">Perfil</th>
                  <th className="text-left p-2">Data</th>
                  <th className="text-left p-2">Comentário</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluations.slice(0, 10).map((evaluation, index) => {
                  const company = companies.find(c => c.id === evaluation.company_id);
                  const createdDate = new Date(evaluation.created_at);
                  
                  return (
                    <tr key={evaluation.id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="p-2">
                        <div className="font-medium text-xs">{company?.name || 'N/A'}</div>
                      </td>
                      <td className="p-2">
                        <Badge 
                          className={
                            evaluation.score <= 6 ? 'bg-red-500 text-white' :
                            evaluation.score <= 8 ? 'bg-yellow-500 text-yellow-900' :
                            'bg-green-500 text-white'
                          }
                        >
                          {evaluation.score}/10
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="text-xs">
                          <div className="capitalize">{evaluation.gender}</div>
                          <div className="text-muted-foreground">{evaluation.age} anos</div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs text-muted-foreground">
                          {createdDate.toLocaleDateString('pt-BR')}
                          <br />
                          {createdDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-xs text-muted-foreground max-w-xs truncate">
                          {evaluation.comment || '-'}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;