import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Star, 
  BarChart3, 
  Home, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

const ScoreHubSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
    <Sidebar 
      collapsible="icon"
      className="border-r border-sidebar-border data-[state=collapsed]:hover:w-64 transition-all duration-300 ease-in-out group"
    >
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <Building2 className="w-6 h-6 text-primary flex-shrink-0" />
          <div className="flex flex-col overflow-hidden opacity-100 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:group-hover:opacity-100 transition-opacity duration-300">
            <span className="font-bold text-sm whitespace-nowrap">ScoreHUB</span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">NPS System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    tooltip={item.tooltip}
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Configurações">
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Informações do usuário">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-medium whitespace-nowrap">
                      {user?.full_name || user?.email || 'Admin'}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Grupo Donadel Guimarães
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Fazer logout"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export { ScoreHubSidebar };