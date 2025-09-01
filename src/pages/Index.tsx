import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Building2, 
  Star, 
  TrendingUp,
  MessageSquare,
  Shield,
  Smartphone
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const Index: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Star,
      title: "Coleta de Avaliações",
      description: "Interface intuitiva para coletar avaliações NPS de 0 a 10 com animações elegantes"
    },
    {
      icon: Building2,
      title: "Multi-empresas",
      description: "Suporte para 19 empresas do Grupo Donadel Guimarães com dados separados"
    },
    {
      icon: BarChart3,
      title: "Relatórios Completos",
      description: "Dashboard administrativo com métricas NPS, gráficos e estatísticas detalhadas"
    },
    {
      icon: Users,
      title: "Dados Demográficos",
      description: "Coleta de informações como sexo, idade e comentários opcionais dos clientes"
    },
    {
      icon: Smartphone,
      title: "Responsivo",
      description: "Otimizado para tablets, desktop e mobile com design elegante"
    },
    {
      icon: Shield,
      title: "Offline Ready",
      description: "Funciona sem internet com sincronização automática quando online"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <ThemeToggle />
      {/* Hero Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="title-hero mb-6">ScoreHUB</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Sistema completo de avaliação NPS para o Grupo Donadel Guimarães. 
              Colete, analise e melhore a satisfação dos seus clientes.
            </p>

            <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate('/evaluation')}
                  className="btn-primary text-lg px-8 py-4"
                  size="lg"
                >
                  <Star className="w-6 h-6 mr-3" />
                  Iniciar Avaliação
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-white"
                  size="lg"
                >
                  <BarChart3 className="w-6 h-6 mr-3" />
                  Dashboard Admin
                </Button>
              </motion.div>
            </div>

            {/* Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="card-gradient p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">19</h3>
                  <p className="text-muted-foreground">Empresas Cadastradas</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="card-gradient p-6">
                  <div className="flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">NPS</h3>
                  <p className="text-muted-foreground">Cálculo Automático</p>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="card-gradient p-6">
                  <div className="flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold text-accent mb-2">100%</h3>
                  <p className="text-muted-foreground">Feedback Detalhado</p>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="title-section mb-4">Funcionalidades Principais</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Um sistema completo projetado especificamente para as necessidades 
              do Grupo Donadel Guimarães
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="card-gradient p-6 h-full hover:shadow-elevated transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-3 rounded-lg mr-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 px-4 md:px-8 bg-card/50 dark:bg-card/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="title-section mb-4">Empresas do Grupo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Sistema configurado para todas as unidades do Grupo Donadel Guimarães
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-center">
            {[
              'Posto Point Centro',
              'Posto Point J. Vitória',
              'Posto Point - União do Norte',
              'Posto Point - Cachoeira da Serra',
              'Posto Tigre Centro',
              'Posto Tigre Filial',
              'Posto Caiuri',
              'Hospital Jardim Vitória',
              'CIG (Centro de Imagens Guarantã)',
              'Laboratório Jardim Vitória - Guarantã',
              'Clínica do Trabalhador',
              'CEMEP - Centro de Especialidades Eldo Peixoto',
              'Laboratório Jardim Vitória - União do Norte',
              'Laboratório Jardim Vitória - Colíder',
              'Laboratório Jardim Vitória - Nova Guarita',
              'Clínica e Laboratório Jardim Vitória - Terra Nova',
              'Clínica e Laboratório Jardim Vitória - Castelo do Sonhos',
              'Clínica e Laboratório Jardim Vitória - Moraes Almeida',
              'CINP (Centro de Imagens Novo Progresso)'
            ].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.02 }}
              >
                <Card className="card-elegant p-4 hover:bg-primary/5 transition-all duration-200">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-primary mr-3 flex-shrink-0" />
                    <span className="text-sm font-medium text-left">{company}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <Card className="card-gradient p-12">
              <h2 className="title-section mb-6">Pronto para Começar?</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Inicie a coleta de avaliações agora ou acesse o dashboard 
                para visualizar relatórios detalhados.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/evaluation')}
                  className="btn-primary text-lg px-8 py-4"
                  size="lg"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Coletar Avaliações
                </Button>
                
                <Button 
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="text-lg px-8 py-4 border-primary text-primary hover:bg-primary hover:text-white"
                  size="lg"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Ver Relatórios
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 md:px-8 border-t border-border/20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">
            © 2024 ScoreHUB - Sistema NPS do Grupo Donadel Guimarães
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;