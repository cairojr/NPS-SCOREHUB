import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  BarChart3, 
  User,
  Settings,
  TrendingUp,
  Calendar,
  Users,
  Shield
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpandableSidebar } from '@/components/ui/expandable-sidebar';
import { useAuth } from '@/hooks/useAuth';
import { EvaluationsService } from '@/services/evaluations';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [todayEvaluations, setTodayEvaluations] = useState(0);
  const [totalEvaluations, setTotalEvaluations] = useState(0);
  const [averageNPS, setAverageNPS] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Carrega estatísticas do hoje
        const todayStats = await EvaluationsService.getTodayStats();
        setTodayEvaluations(todayStats.total_today);

        // Carrega todas as avaliações para estatísticas gerais
        const allEvaluations = await EvaluationsService.getAll();
        setTotalEvaluations(allEvaluations.length);

        if (allEvaluations.length > 0) {
          const avgScore = allEvaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) / allEvaluations.length;
          setAverageNPS(Math.round(avgScore * 10) / 10);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        // Fallback para localStorage se Supabase falhar
        const today = new Date().toDateString();
        const todayCount = localStorage.getItem(`scorehub_evaluations_${today}`);
        setTodayEvaluations(todayCount ? parseInt(todayCount) : 0);

        const allEvaluations = JSON.parse(localStorage.getItem('scorehub_evaluations') || '[]');
        setTotalEvaluations(allEvaluations.length);

        if (allEvaluations.length > 0) {
          const avgScore = allEvaluations.reduce((sum: number, evaluation: {score: number}) => sum + evaluation.score, 0) / allEvaluations.length;
          setAverageNPS(Math.round(avgScore * 10) / 10);
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);


  const menuItems = [
    {
      title: 'Coletar Avaliações',
      description: 'Iniciar processo de avaliação NPS',
      icon: Star,
      path: '/evaluation',
      color: 'bg-green-500',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Relatórios Admin',
      description: 'Dashboard administrativo completo',
      icon: BarChart3,
      path: '/admin',
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-blue-600'
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
      <ExpandableSidebar />
      
      {/* Main Content */}
      <main className="flex-1 lg:ml-12 ml-0 transition-all duration-300">
        {/* Header */}
        <div className="border-b border-border/20 bg-card/50 dark:bg-card/30 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                ScoreHUB
              </h1>
              <div className="text-sm text-muted-foreground">
                Sistema NPS - Grupo Donadel Guimarães
              </div>
            </div>
            
          </div>
        </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-bold mb-4">Bem-vindo ao Dashboard</h2>
          <p className="text-muted-foreground text-lg">
            Escolha uma das opções abaixo para começar
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="card-gradient p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hoje</p>
                  <p className="text-2xl font-bold text-green-600">{todayEvaluations}</p>
                  <p className="text-xs text-muted-foreground">Avaliações</p>
                </div>
                <Calendar className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="card-gradient p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold text-blue-600">{totalEvaluations}</p>
                  <p className="text-xs text-muted-foreground">Avaliações</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="card-gradient p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">NPS Médio</p>
                  <p className="text-2xl font-bold text-purple-600">{averageNPS}</p>
                  <p className="text-xs text-muted-foreground">Pontuação</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Card 
                className="card-gradient p-8 hover:shadow-elevated transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center mb-6">
                  <div className={`p-4 rounded-xl bg-gradient-to-r ${item.gradient} text-white mr-4 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                
                <Button 
                  className="w-full btn-primary group-hover:bg-primary/90"
                  size="lg"
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  Acessar
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <Card className="card-gradient p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              Configurações Rápidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                <Building2 className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">19 Empresas</p>
                  <p className="text-sm text-muted-foreground">Grupo Donadel Guimarães</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                <User className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">{user?.full_name || user?.email || 'Admin Logado'}</p>
                  <p className="text-sm text-muted-foreground">Sessão ativa</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-muted/50 rounded-lg">
                <Star className="w-5 h-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Sistema NPS</p>
                  <p className="text-sm text-muted-foreground">Escala 0-10</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
      </main>
    </div>
  );
};

export default Dashboard;