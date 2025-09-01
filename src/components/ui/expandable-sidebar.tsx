import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  BarChart3, 
  Home, 
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { CustomThemeToggle } from '@/components/ui/custom-theme-toggle';

const ExpandableSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const menuItems = [
    {
      title: 'Dashboard Principal',
      path: '/',
      icon: Home,
      tooltip: 'Página inicial'
    },
    {
      title: 'Coletar Avaliações',
      path: '/evaluation',
      icon: Star,
      tooltip: 'Processo de avaliação NPS'
    },
    {
      title: 'Relatórios Admin',
      path: '/admin',
      icon: BarChart3,
      tooltip: 'Dashboard administrativo'
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-sidebar border border-sidebar-border rounded-lg p-2 shadow-lg"
      >
        <Menu className="w-5 h-5 text-sidebar-foreground" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="group fixed left-0 top-0 z-40 h-screen w-12 hover:w-64 bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out overflow-hidden hidden lg:block">
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-4 border-b border-sidebar-border">
          <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="flex flex-col overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
            <span className="font-bold text-sm whitespace-nowrap text-sidebar-foreground">ScoreHUB</span>
            <span className="text-xs text-sidebar-foreground/60 whitespace-nowrap">NPS System</span>
          </div>
        </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-4 space-y-2">
        {/* Theme Toggle - First Option */}
        <div className="relative">
          <div className="w-full rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors duration-200">
            <div className="flex items-center gap-3 px-2 py-2">
              <Palette className="w-5 h-5 flex-shrink-0 text-sidebar-foreground" />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                <CustomThemeToggle 
                  showText={true}
                  className="text-sidebar-foreground hover:text-sidebar-accent-foreground"
                />
              </div>
            </div>
          </div>
          {/* Tooltip for collapsed state */}
          <div className="absolute left-12 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-sidebar-foreground text-sidebar text-xs rounded opacity-0 group-hover:opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
            Alternar tema
          </div>
        </div>

        {/* Separator */}
        <div className="my-2 border-t border-sidebar-border" />

        {/* Menu Items */}
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.path} className="relative">
              <button
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-sidebar-ring",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                )}
                title={item.tooltip}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  {item.title}
                </span>
              </button>
              
              {/* Tooltip for collapsed state */}
              <div className="absolute left-12 top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-sidebar-foreground text-sidebar text-xs rounded opacity-0 group-hover:opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                {item.tooltip}
              </div>
            </div>
          );
        })}

        {/* Separator */}
        <div className="my-4 border-t border-sidebar-border" />

        {/* Settings */}
        <div className="relative">
          <button
            onClick={() => {
              // Implementar modal ou página de configurações futuras
              console.log('Configurações clicked - implementar modal/página de configurações');
            }}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            title="Configurações"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              Configurações
            </span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-2 py-4 space-y-2">
        <div className="relative">
          <div className="w-full flex items-center gap-3 px-2 py-2 rounded-lg">
            <User className="w-5 h-5 flex-shrink-0 text-sidebar-foreground" />
            <div className="flex flex-col overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              <span className="text-xs font-medium text-sidebar-foreground whitespace-nowrap">
                {user?.full_name || user?.email || 'Admin'}
              </span>
              <span className="text-xs text-sidebar-foreground/60 whitespace-nowrap">
                Grupo Donadel Guimarães
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:outline-none focus:ring-2 focus:ring-sidebar-ring"
            title="Fazer logout"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              Sair
            </span>
          </button>
        </div>
      </div>
    </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="fixed left-0 top-0 h-full w-80 bg-sidebar border-r border-sidebar-border shadow-xl">
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <div>
                  <span className="font-bold text-sm text-sidebar-foreground">ScoreHUB</span>
                  <p className="text-xs text-sidebar-foreground/60">NPS System</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              >
                <X className="w-5 h-5 text-sidebar-foreground" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-2">
              {/* Theme Toggle - First Option */}
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-sidebar-accent/50">
                <Palette className="w-5 h-5 text-sidebar-foreground" />
                <CustomThemeToggle 
                  showText={true}
                  className="text-sidebar-foreground flex-1"
                />
              </div>

              {/* Separator */}
              <div className="my-4 border-t border-sidebar-border" />

              {/* Mobile Menu Items */}
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-sidebar-ring",
                      isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.title}</span>
                  </button>
                );
              })}

              {/* Separator */}
              <div className="my-4 border-t border-sidebar-border" />

              {/* Settings */}
              <button 
                onClick={() => {
                  console.log('Configurações clicked (mobile) - implementar modal/página de configurações');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Configurações</span>
              </button>
            </nav>

            {/* Mobile Footer */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-sidebar-border p-4 space-y-2">
              <div className="flex items-center gap-3 px-3 py-2">
                <User className="w-5 h-5 text-sidebar-foreground" />
                <div>
                  <p className="text-sm font-medium text-sidebar-foreground">
                    {user?.full_name || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60">
                    Grupo Donadel Guimarães
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Sair</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export { ExpandableSidebar };