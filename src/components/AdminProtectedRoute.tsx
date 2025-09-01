import React, { useState, useEffect } from 'react';
import { AdminConfirmDialog } from '@/components/AdminConfirmDialog';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminConfirm, setShowAdminConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Verificar se há autenticação admin válida (com timeout de 10 minutos)
    const adminAuth = localStorage.getItem('scorehub_admin_auth');
    const adminAuthTime = localStorage.getItem('scorehub_admin_auth_time');
    
    if (adminAuth && adminAuthTime) {
      const authTime = parseInt(adminAuthTime);
      const now = Date.now();
      const tenMinutes = 10 * 60 * 1000; // 10 minutos em ms
      
      if (now - authTime < tenMinutes) {
        setIsAdminAuthenticated(true);
      } else {
        // Auth expirada, remover
        localStorage.removeItem('scorehub_admin_auth');
        localStorage.removeItem('scorehub_admin_auth_time');
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized && !isAdminAuthenticated) {
      setShowAdminConfirm(true);
    }
  }, [isInitialized, isAdminAuthenticated]);

  const handleAdminConfirmed = () => {
    // Salvar autenticação admin com timestamp
    localStorage.setItem('scorehub_admin_auth', 'true');
    localStorage.setItem('scorehub_admin_auth_time', Date.now().toString());
    setIsAdminAuthenticated(true);
    setShowAdminConfirm(false);
  };

  const handleAdminCancel = () => {
    // Redirecionar para dashboard se cancelar
    window.location.href = '/';
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <>
        {/* Placeholder para evitar flash */}
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-muted to-accent/10">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-primary/20 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
        
        <AdminConfirmDialog
          isOpen={showAdminConfirm}
          onClose={handleAdminCancel}
          onConfirm={handleAdminConfirmed}
          title="Acesso Restrito - Área Administrativa"
          description="Esta é uma área restrita. Digite sua senha de administrador para continuar."
        />
      </>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;