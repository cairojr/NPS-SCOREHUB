import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Shield, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ClearDataConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalEvaluations: number;
}

export const ClearDataConfirmDialog: React.FC<ClearDataConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalEvaluations
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmStep, setConfirmStep] = useState<'warning' | 'password'>('warning');
  const { toast } = useToast();

  const handleFirstConfirm = () => {
    setConfirmStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simula delay de validação
    await new Promise(resolve => setTimeout(resolve, 800));

    // Valida senha (usando a mesma senha do login administrativo)
    if (password === 'Soudecristo') {
      toast({
        title: "Senha confirmada",
        description: "Iniciando limpeza dos dados...",
        variant: "destructive",
      });
      
      setTimeout(() => {
        onConfirm();
        handleClose();
      }, 1000);
    } else {
      toast({
        title: "Senha incorreta",
        description: "Verifique sua senha administrativa e tente novamente.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPassword('');
    setShowPassword(false);
    setIsLoading(false);
    setConfirmStep('warning');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="card-gradient p-8 shadow-elevated border-2 border-red-500/30">
              {confirmStep === 'warning' ? (
                <>
                  {/* Warning Step */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-500/20 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-red-600">ATENÇÃO</h2>
                        <p className="text-sm text-red-500">Ação irreversível</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleClose}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Warning Content */}
                  <div className="space-y-6">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                      <h3 className="font-bold text-red-800 dark:text-red-300 text-lg mb-4">
                        🚨 Você está prestes a excluir TODOS os dados!
                      </h3>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <Trash2 className="w-4 h-4" />
                          <span><strong>{totalEvaluations} avaliações</strong> serão permanentemente removidas</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <Trash2 className="w-4 h-4" />
                          <span>Todos os comentários dos clientes serão perdidos</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <Trash2 className="w-4 h-4" />
                          <span>Todo o histórico NPS será apagado</span>
                        </div>
                        <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                          <Trash2 className="w-4 h-4" />
                          <span>Os dados serão removidos tanto do banco online quanto do armazenamento local</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                      <p className="text-orange-800 dark:text-orange-300 text-center font-semibold">
                        ⚠️ Esta ação NÃO PODE ser desfeita!<br/>
                        Não há como recuperar os dados após a exclusão.
                      </p>
                    </div>

                    <div className="text-center text-sm text-muted-foreground">
                      <p>Se você tem certeza absoluta, clique em "Entendo os Riscos" para continuar.</p>
                      <p className="mt-1">Caso contrário, clique em "Cancelar" para voltar ao dashboard.</p>
                    </div>
                  </div>

                  {/* Warning Actions */}
                  <div className="flex gap-3 pt-6">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    
                    <Button
                      onClick={handleFirstConfirm}
                      variant="destructive"
                      className="flex-1"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Entendo os Riscos
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Password Step */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-500/20 rounded-full">
                        <Shield className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-red-600">Confirmação Final</h2>
                        <p className="text-sm text-red-500">Digite sua senha administrativa</p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={handleClose}
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
                    <p className="text-red-800 dark:text-red-300 text-sm text-center">
                      🔐 Para confirmar a exclusão de <strong>{totalEvaluations} avaliações</strong>,<br/>
                      digite sua senha administrativa abaixo:
                    </p>
                  </div>

                  {/* Password Form */}
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Senha Administrativa
                      </label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Digite sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10 input-elegant border-red-300 focus:border-red-500 focus:ring-red-500"
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Password Actions */}
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setConfirmStep('warning')}
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        ← Voltar
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="destructive"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            EXCLUIR TUDO
                          </>
                        )}
                      </Button>
                    </div>
                  </form>

                  <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
                    <p className="text-xs text-red-800 dark:text-red-300 text-center">
                      🔒 Após digitar a senha, todos os dados serão irreversivelmente excluídos
                    </p>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};