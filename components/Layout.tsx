import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  LogOut, 
  Menu, 
  X,
  Palette
} from 'lucide-react';
import { useAuth } from '../App';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const { logout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, color: 'text-brand-blue', activeBg: 'bg-brand-blue/10' },
    { id: 'students', label: 'Meus Alunos', icon: Users, color: 'text-brand-green', activeBg: 'bg-brand-green/10' },
    { id: 'nutrition', label: 'Nutrição', icon: Utensils, color: 'text-brand-pink', activeBg: 'bg-brand-pink/10' },
  ];

  // Componente interno para renderizar o logo colorido
  const BrandLogo = ({ size = 'normal' }: { size?: 'normal' | 'small' }) => (
    <div className={`flex flex-col items-center justify-center ${size === 'normal' ? 'scale-100' : 'scale-90'}`}>
       {/* Parte central: Logo Artístico */}
       <div className="relative flex items-center justify-center">
         {/* Ícone da Paleta atrás - Mais sutil no minimalismo */}
         <div className="absolute -z-10 opacity-5 rotate-12">
            <Palette size={50} className="text-brand-brown" />
         </div>

         {/* Texto "Pintando" colorido */}
         <h1 className="font-display text-3xl md:text-3xl font-black tracking-tight select-none">
           <span className="text-brand-red">P</span>
           <span className="text-brand-green">int</span>
           <span className="text-brand-blue">and</span>
           <span className="text-brand-pink">o</span>
         </h1>
         
         {/* O número 7 */}
         <span className="font-display text-4xl md:text-4xl font-black text-brand-red ml-1 rotate-6 transform select-none">
           7
         </span>
       </div>
       <p className="text-[10px] tracking-[0.2em] text-slate-400 font-bold uppercase mt-1">Gestão Escolar</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-600">
      {/* Sidebar - Desktop (Minimalista: Sem borda direita, apenas espaçamento) */}
      <aside className="hidden md:flex flex-col w-72 bg-white fixed h-full z-10 px-6 py-8">
        <div className="mb-12">
          <BrandLogo />
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group font-medium ${
                  isActive
                    ? `${item.activeBg} ${item.color} shadow-sm font-bold`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm">{item.label}</span>
                {isActive && <div className={`ml-auto w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')}`} />}
              </button>
            );
          })}
        </nav>

        <div className="pt-6 mt-auto">
          <div className="bg-slate-50 p-4 rounded-3xl mb-4 flex items-center space-x-3 transition-colors hover:bg-slate-100 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-blue font-black shadow-sm group-hover:scale-105 transition-transform">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Gestor</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 text-slate-400 hover:text-brand-red transition-colors text-sm font-medium rounded-2xl hover:bg-red-50"
          >
            <LogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md z-20 px-6 py-4 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
         <div className="scale-75 origin-left">
            <BrandLogo size="small" />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors">
            {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-white pt-24 px-6 animate-fade-in">
           <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => {
                       onNavigate(item.id);
                       setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-4 p-5 rounded-3xl text-lg font-bold transition-all ${
                       activePage === item.id 
                       ? `${item.activeBg} ${item.color}` 
                       : 'text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                 </button>
              ))}
              <button onClick={logout} className="flex items-center space-x-4 p-5 text-red-500 font-bold mt-8 rounded-3xl hover:bg-red-50">
                 <LogOut size={24} />
                 <span>Encerrar Sessão</span>
              </button>
           </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-10 pt-28 md:pt-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;