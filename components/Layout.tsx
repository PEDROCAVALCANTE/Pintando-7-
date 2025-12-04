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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'nutrition', label: 'Nutrição', icon: Utensils },
  ];

  // Componente interno para renderizar o logo colorido
  const BrandLogo = ({ size = 'normal' }: { size?: 'normal' | 'small' }) => (
    <div className={`flex flex-col items-center justify-center ${size === 'normal' ? 'scale-100' : 'scale-90'}`}>
       {/* Parte superior: ESCOLA BERÇÁRIO (Vermelho) */}
       <h2 className="text-brand-red font-bold tracking-wider uppercase text-[0.65rem] md:text-xs mb-1">
         Escola Berçário
       </h2>
       
       {/* Parte central: Logo Artístico */}
       <div className="relative flex items-center justify-center">
         {/* Ícone da Paleta atrás */}
         <div className="absolute -z-10 opacity-10 rotate-12">
            <Palette size={60} className="text-brand-brown" />
         </div>

         {/* Texto "Pintando" colorido letra a letra/grupo */}
         <h1 className="font-display text-3xl md:text-4xl font-black tracking-tight drop-shadow-sm" style={{ textShadow: '2px 2px 0px #fff' }}>
           <span className="text-brand-red">P</span>
           <span className="text-brand-green">int</span>
           <span className="text-brand-blue">and</span>
           <span className="text-brand-pink">o</span>
         </h1>
         
         {/* O número 7 grande e vermelho */}
         <span className="font-display text-4xl md:text-5xl font-black text-brand-red ml-1 rotate-6 transform" 
               style={{ textShadow: '2px 2px 0px #fff' }}>
           7
         </span>
       </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shadow-lg fixed h-full z-10">
        <div className="p-6 flex flex-col items-center justify-center border-b border-slate-100 bg-white">
          <BrandLogo />
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-bold ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30 translate-x-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-brand-blue'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-xl mb-3 flex items-center space-x-3 border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-brand-yellow flex items-center justify-center text-brand-red font-black border-2 border-white shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-brand-blue font-bold truncate uppercase tracking-wider">ADMINISTRADOR</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 p-2 text-slate-400 hover:text-brand-red transition-colors font-medium"
          >
            <LogOut size={18} />
            <span className="text-sm">Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-slate-200 shadow-sm px-4 py-2 flex items-center justify-between">
         <div className="scale-75 origin-left">
            <BrandLogo size="small" />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 bg-slate-100 p-2 rounded-lg">
            {isMobileMenuOpen ? <X /> : <Menu />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-10 bg-white pt-24 px-4">
           <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => {
                       onNavigate(item.id);
                       setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-4 p-4 rounded-xl text-lg font-bold shadow-sm ${
                       activePage === item.id ? 'bg-brand-blue text-white' : 'text-slate-600 bg-slate-50'
                    }`}
                 >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                 </button>
              ))}
              <button onClick={logout} className="flex items-center space-x-4 p-4 text-brand-red font-bold mt-8 border-t border-slate-100 pt-8">
                 <LogOut size={24} />
                 <span>Sair</span>
              </button>
           </nav>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pt-24 md:pt-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;