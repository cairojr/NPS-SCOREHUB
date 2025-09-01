import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, MessageSquare, CheckCircle2, RotateCcw, Settings, BarChart3, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExpandableSidebar } from '@/components/ui/expandable-sidebar';
import { NPSSemiGauge } from '@/components/nps/NPSSemiGauge';
import { NPSScoreButtons } from '@/components/nps/NPSScoreButtons';
import { useAuth } from '@/hooks/useAuth';
import { CompaniesService } from '@/services/companies';
import { EvaluationsService } from '@/services/evaluations';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { AdminConfirmDialog } from '@/components/AdminConfirmDialog';
import type { Company } from '@/types/database';
interface EvaluationData {
  company_id: string;
  score: number;
  gender: string;
  age: number;
  comment?: string;
}
const EvaluationPanel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'score' | 'demographics' | 'success'>('score');
  const [evaluationData, setEvaluationData] = useState<Partial<EvaluationData>>({});
  const [todayEvaluations, setTodayEvaluations] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    const loadData = async () => {
      try {
        // Carrega empresas do Supabase
        const companiesData = await CompaniesService.getAll();
        setCompanies(companiesData);

        // Carrega estatísticas do dia
        const todayStats = await EvaluationsService.getTodayStats();
        setTodayEvaluations(todayStats.total_today);

        // Verifica se há empresa selecionada previamente
        const savedCompanyId = localStorage.getItem('scorehub_selected_company_id');
        if (savedCompanyId) {
          const savedCompany = companiesData.find(c => c.id === savedCompanyId);
          if (savedCompany) {
            setSelectedCompany(savedCompany);
            setEvaluationData({
              company_id: savedCompany.id
            });
          } else {
            setShowCompanySelector(true);
          }
        } else {
          setShowCompanySelector(true);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        // Fallback para localStorage se Supabase falhar
        const today = new Date().toDateString();
        const stored = localStorage.getItem(`scorehub_evaluations_${today}`);
        setTodayEvaluations(stored ? parseInt(stored) : 0);
        setShowCompanySelector(true);
      }
    };

    loadData();
  }, []);
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setEvaluationData({
      ...evaluationData,
      company_id: company.id
    });
    localStorage.setItem('scorehub_selected_company_id', company.id);
    setShowCompanySelector(false);
  };
  const handleScoreSelect = (score: number) => {
    setEvaluationData({
      ...evaluationData,
      score
    });
    setCurrentStep('demographics');
  };
  const handleSubmit = async () => {
    if (!evaluationData.company_id || !evaluationData.gender || !evaluationData.age || evaluationData.score === undefined) {
      toast({
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Salva no Supabase
      await EvaluationsService.create({
        company_id: evaluationData.company_id,
        score: evaluationData.score,
        gender: evaluationData.gender as any,
        age: evaluationData.age,
        comment: evaluationData.comment || null
      });

      // Atualiza contador do dia
      const newCount = todayEvaluations + 1;
      setTodayEvaluations(newCount);

      // Feedback de sucesso
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi salva com sucesso no banco de dados.",
      });

      setCurrentStep('success');
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      
      // Fallback para localStorage se Supabase falhar
      const fallbackData = {
        empresa: selectedCompany?.name,
        score: evaluationData.score,
        sexo: evaluationData.gender,
        idade: evaluationData.age,
        comentario: evaluationData.comment,
        timestamp: new Date()
      };
      
      const today = new Date().toDateString();
      const existingData = JSON.parse(localStorage.getItem('scorehub_evaluations') || '[]');
      existingData.push(fallbackData);
      localStorage.setItem('scorehub_evaluations', JSON.stringify(existingData));
      
      const newCount = todayEvaluations + 1;
      setTodayEvaluations(newCount);
      localStorage.setItem(`scorehub_evaluations_${today}`, newCount.toString());

      toast({
        title: "Avaliação salva localmente",
        description: "Houve um problema na conexão. A avaliação foi salva localmente.",
        variant: "destructive",
      });

      setCurrentStep('success');
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setEvaluationData({
      company_id: selectedCompany?.id
    }); // Keep the company selected
    setCurrentStep('score');
  };
  const getSatisfactionLevel = (score: number) => {
    if (score <= 3) return {
      text: 'Muito Insatisfeito',
      color: 'text-red-600'
    };
    if (score <= 6) return {
      text: 'Insatisfeito',
      color: 'text-red-500'
    };
    if (score <= 7) return {
      text: 'Neutro',
      color: 'text-yellow-600'
    };
    if (score <= 8) return {
      text: 'Satisfeito',
      color: 'text-yellow-500'
    };
    return {
      text: 'Muito Satisfeito',
      color: 'text-green-600'
    };
  };
  const handleAdminAccess = () => {
    setShowAdminConfirm(true);
  };

  const handleAdminConfirmed = () => {
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <ExpandableSidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-12 ml-0 transition-all duration-300 p-4 md:p-8">
      
      <div className="max-w-4xl mx-auto">
        {/* Header with company selector */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="text-center mb-8">
          <h1 className="title-hero mb-4 text-blue-700">ScoreHUB</h1>
          <p className="text-lg text-muted-foreground mb-6">Sistema de Avaliação NPS - Grupo Donadel Guimarães</p>
          
          {/* Current company display with change option */}
          {selectedCompany && !showCompanySelector && <div className="flex items-center justify-center gap-4 mb-4">
              <div className="card-elegant p-4 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">{selectedCompany?.name}</span>
                <Button size="sm" variant="outline" onClick={() => setShowCompanySelector(true)} className="ml-2">
                  <Settings className="w-4 h-4 mr-1" />
                  Alterar
                </Button>
              </div>
            </div>}
          
          <div className="card-elegant p-4 inline-block">
            <p className="text-sm text-muted-foreground">Avaliações coletadas hoje:</p>
            <p className="text-2xl font-bold text-primary">{todayEvaluations}</p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Company Selection Modal */}
          {showCompanySelector && <motion.div key="company-selector" initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.9
        }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="card-gradient p-8 max-w-6xl w-full max-h-[85vh] overflow-y-auto">
                <div className="text-center mb-10">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, type: "spring" }}
                    className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full mb-6 shadow-glow"
                  >
                    <Building2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-4">
                    Selecione a Empresa
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Escolha uma das empresas do Grupo Donadel Guimarães para iniciar a avaliação NPS
                  </p>
                </div>

{(() => {
                  // Separar empresas por grupos
                  const fuelStations = companies.filter(company => 
                    company.name.includes('Posto')
                  );
                  
                  const healthUnits = companies.filter(company => 
                    !company.name.includes('Posto')
                  );

                  let animationIndex = 0;

                  const renderCompanyCard = (company: any) => {
                    const companyType = company.name.includes('Posto') ? 'posto' : 
                                       company.name.includes('Hospital') ? 'hospital' :
                                       company.name.includes('Laboratório') || company.name.includes('Clínica') ? 'clinica' :
                                       company.name.includes('CIG') || company.name.includes('CINP') ? 'imagem' : 'default';
                    
                    const iconClass = companyType === 'posto' ? 'from-blue-500 to-blue-600' :
                                     companyType === 'hospital' ? 'from-red-500 to-red-600' :
                                     companyType === 'clinica' ? 'from-green-500 to-green-600' :
                                     companyType === 'imagem' ? 'from-purple-500 to-purple-600' :
                                     'from-gray-500 to-gray-600';

                    const currentIndex = animationIndex++;

                    return (
                      <motion.div 
                        key={company.id} 
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: currentIndex * 0.08, type: "spring", stiffness: 200 }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card 
                          onClick={() => handleCompanySelect(company)}
                          className="relative cursor-pointer group overflow-hidden border-2 border-border/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl bg-card/50 backdrop-blur-sm"
                        >
                          <div className="p-6">
                            <div className="flex items-start gap-4 mb-4">
                              <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${iconClass} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300`}>
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-foreground text-base leading-tight mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                                  {company.name}
                                </h3>
                                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  companyType === 'posto' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' :
                                  companyType === 'hospital' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                                  companyType === 'clinica' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                                  companyType === 'imagem' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' :
                                  'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
                                }`}>
                                  {companyType === 'posto' ? '⛽ Posto' :
                                   companyType === 'hospital' ? '🏥 Hospital' :
                                   companyType === 'clinica' ? '🩺 Clínica' :
                                   companyType === 'imagem' ? '📊 Imagens' : '🏢 Empresa'}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-3 border-t border-border/20">
                              <span className="text-sm text-muted-foreground">Clique para selecionar</span>
                              <div className="w-5 h-5 rounded-full border-2 border-primary/30 group-hover:border-primary group-hover:bg-primary transition-all duration-200 flex items-center justify-center">
                                <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hover gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </Card>
                      </motion.div>
                    );
                  };

                  return (
                    <div className="space-y-10">
                      {/* Grupo: Postos de Combustível */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <div className="mb-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white text-lg">⛽</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-foreground">Postos de Combustível</h3>
                                <p className="text-sm text-muted-foreground">{fuelStations.length} unidades disponíveis</p>
                              </div>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 dark:from-blue-800 to-transparent"></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {fuelStations.map(company => renderCompanyCard(company))}
                        </div>
                      </motion.div>

                      {/* Grupo: Unidades de Saúde */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="mb-6">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-white text-lg">🏥</span>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-foreground">Unidades de Saúde</h3>
                                <p className="text-sm text-muted-foreground">{healthUnits.length} unidades disponíveis</p>
                              </div>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-green-200 dark:from-green-800 to-transparent"></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {healthUnits.map(company => renderCompanyCard(company))}
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}

                {/* Footer com botão voltar e informações extras */}
                <div className="mt-8 pt-6 border-t border-border/20">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowCompanySelector(false);
                        if (selectedCompany) {
                          // Se já tinha uma empresa selecionada, volta para a tela de avaliação
                          setCurrentStep('score');
                        } else {
                          // Se não tinha empresa, navega para a página inicial
                          navigate('/');
                        }
                      }}
                      className="flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Voltar
                    </Button>
                    
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {companies.length} empresas disponíveis no Grupo Donadel Guimarães
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>}

          {/* Score Selection - Main evaluation step */}
          {currentStep === 'score' && selectedCompany && !showCompanySelector && <motion.div key="score" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }}>
              <Card className="card-gradient p-8">
                <div className="text-center mb-8">
                  <h2 className="title-section mb-6">Como você avalia nosso atendimento?</h2>
                  <p className="text-muted-foreground mb-8">Dê uma nota de 0 a 10</p>
                </div>

                {evaluationData.score !== undefined && <div className="mb-8 flex justify-center">
                    <NPSSemiGauge score={evaluationData.score} companyName={selectedCompany?.name || ''} />
                  </div>}

                <NPSScoreButtons selectedScore={evaluationData.score} onScoreSelect={handleScoreSelect} />
              </Card>
            </motion.div>}

          {/* Step 3: Demographics */}
          {currentStep === 'demographics' && <motion.div key="demographics" initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }}>
              <Card className="card-gradient p-8">
                <div className="text-center mb-8">
                  <User className="w-16 h-16 mx-auto text-primary mb-4" />
                  <h2 className="title-section mb-4">Informações Adicionais</h2>
                  <p className="text-muted-foreground">Nos ajude com algumas informações</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sexo</label>
                    <Select onValueChange={value => setEvaluationData({
                  ...evaluationData,
                  gender: value
                })}>
                      <SelectTrigger className="select-elegant">
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Idade</label>
                    <Input type="number" min="1" max="120" placeholder="Digite sua idade" className="input-elegant" onChange={e => setEvaluationData({
                  ...evaluationData,
                  age: parseInt(e.target.value)
                })} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <MessageSquare className="w-4 h-4 inline mr-2" />
                      Comentário (opcional)
                    </label>
                    <Textarea placeholder="Deixe seu comentário ou sugestão..." className="input-elegant min-h-[100px] resize-none" onChange={e => setEvaluationData({
                  ...evaluationData,
                  comment: e.target.value
                })} />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button onClick={() => setCurrentStep('score')} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={handleSubmit} disabled={!evaluationData.gender || !evaluationData.age || loading} className="btn-primary">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {loading ? 'Enviando...' : 'Enviar Avaliação'}
                  </Button>
                </div>
              </Card>
            </motion.div>}

          {/* Step 4: Success */}
          {currentStep === 'success' && <motion.div key="success" initial={{
          opacity: 0,
          scale: 0.8
        }} animate={{
          opacity: 1,
          scale: 1
        }} exit={{
          opacity: 0,
          scale: 0.8
        }}>
              <Card className="card-gradient p-8 text-center">
                <motion.div initial={{
              scale: 0
            }} animate={{
              scale: 1
            }} transition={{
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}>
                  <CheckCircle2 className="w-24 h-24 mx-auto text-green-500 mb-6" />
                </motion.div>
                
                <h2 className="title-section text-green-600 mb-4">Avaliação Enviada!</h2>
                <p className="text-muted-foreground mb-8">
                  Obrigado pela sua avaliação! Sua opinião é muito importante para nós.
                </p>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8">
                  <h3 className="font-semibold text-green-800 mb-2">Resumo da Avaliação</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Empresa:</strong> {selectedCompany?.name}</p>
                    <p><strong>Nota:</strong> {evaluationData.score}/10</p>
                    <p><strong>Classificação:</strong> {getSatisfactionLevel(evaluationData.score!).text}</p>
                  </div>
                </div>

                <Button onClick={resetForm} className="btn-primary">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Nova Avaliação
                </Button>
              </Card>
            </motion.div>}
        </AnimatePresence>
      </div>

      {/* Admin Confirmation Dialog */}
      <AdminConfirmDialog
        isOpen={showAdminConfirm}
        onClose={() => setShowAdminConfirm(false)}
        onConfirm={handleAdminConfirmed}
        title="Acesso ao Painel Administrativo"
        description="Digite sua senha para acessar os relatórios administrativos"
      />
      </main>
    </div>
  );
};
export default EvaluationPanel;