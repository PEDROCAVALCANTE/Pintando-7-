import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  LogOut, 
  Menu, 
  X,
  Palette,
  Settings,
  HelpCircle
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

  // Componente interno para renderizar o logo colorido aprimorado
  const BrandLogo = ({ size = 'normal' }: { size?: 'normal' | 'small' }) => (
    <div className={`flex flex-col items-center justify-center ${size === 'normal' ? 'scale-100' : 'scale-90'} select-none`}>
       
       {/* Texto Superior em Arco (Simulado) */}
       <div className="mb-[-5px] relative h-8 w-40 flex justify-center items-end overflow-hidden">
          <svg viewBox="0 0 200 60" className="w-full h-full absolute top-0">
             <path id="curve" d="M 20,60 Q 100,10 180,60" fill="transparent" />
             <text width="200">
               <textPath href="#curve" startOffset="50%" textAnchor="middle" className="fill-brand-red font-bold text-[22px] uppercase tracking-widest font-sans">
                 Escola Berçário
               </textPath>
             </text>
          </svg>
       </div>

       {/* Parte central: Logo Artístico */}
       <div className="relative flex items-end justify-center">
         {/* Ícone da Paleta atrás */}
         <div className="absolute -z-10 opacity-[0.08] -rotate-12 top-[-10px] left-[-10px]">
            <Palette size={70} className="text-brand-brown" />
         </div>

         {/* Texto "Pintando" colorido e divertido */}
         <h1 className="font-display text-4xl font-black tracking-tight leading-none drop-shadow-sm">
           <span className="text-brand-red inline-block hover:-translate-y-1 transition-transform cursor-default">P</span>
           <span className="text-brand-green inline-block hover:-translate-y-1 transition-transform cursor-default delay-75">i</span>
           <span className="text-brand-blue inline-block hover:-translate-y-1 transition-transform cursor-default delay-100">n</span>
           <span className="text-brand-yellow inline-block hover:-translate-y-1 transition-transform cursor-default delay-150 text-shadow-sm">t</span>
           <span className="text-brand-pink inline-block hover:-translate-y-1 transition-transform cursor-default delay-200">a</span>
           <span className="text-brand-blue inline-block hover:-translate-y-1 transition-transform cursor-default delay-300">n</span>
           <span className="text-brand-green inline-block hover:-translate-y-1 transition-transform cursor-default delay-500">d</span>
           <span className="text-brand-pink inline-block hover:-translate-y-1 transition-transform cursor-default delay-700">o</span>
         </h1>
         
         {/* O número 7 Grande */}
         <span className="font-display text-5xl font-black text-brand-red ml-2 -rotate-12 transform shadow-brand-red/20 drop-shadow-md">
           7
         </span>
       </div>
       <p className="text-[9px] tracking-[0.3em] text-slate-400 font-bold uppercase mt-2 border-t border-slate-100 pt-1 w-32 text-center">Gestão Escolar</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-600">
      {/* Sidebar - Desktop (Minimalista e Clean) */}
      <aside className="hidden md:flex flex-col w-72 bg-white fixed h-full z-20 px-6 py-8 shadow-[1px_0_20px_rgba(0,0,0,0.02)]">
        <div className="mb-10 mt-2">
          <BrandLogo />
        </div>

        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-[20px] transition-all duration-300 group font-medium relative overflow-hidden ${
                  isActive
                    ? `${item.activeBg} ${item.color} shadow-sm font-bold`
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full ${item.color.replace('text', 'bg')}`} />}
                <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 mt-auto space-y-4">
          {/* User Profile Card */}
          <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 p-3 rounded-3xl flex items-center space-x-3 transition-all hover:shadow-md cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform text-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Gestor</p>
            </div>
            <Settings size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-3 text-slate-400 hover:text-brand-red transition-colors text-xs font-bold rounded-2xl hover:bg-red-50 uppercase tracking-wider"
          >
            <LogOut size={16} />
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/90 backdrop-blur-md z-30 px-6 py-3 flex items-center justify-between shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] border-b border-slate-50">
         <div className="scale-75 origin-left -ml-4">
            <BrandLogo size="small" />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors active:scale-95">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white/95 backdrop-blur-sm pt-28 px-6 animate-fade-in flex flex-col h-full">
           <nav className="flex flex-col space-y-3 flex-1">
              {navItems.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => {
                       onNavigate(item.id);
                       setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-4 p-5 rounded-[24px] text-lg font-bold transition-all ${
                       activePage === item.id 
                       ? `${item.activeBg} ${item.color} shadow-sm` 
                       : 'text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <item.icon size={26} />
                    <span>{item.label}</span>
                 </button>
              ))}
           </nav>
           
           <div className="pb-8">
              <button onClick={logout} className="w-full flex items-center justify-center space-x-3 p-5 text-red-500 font-bold bg-red-50 rounded-[24px] hover:bg-red-100 transition-colors">
                 <LogOut size={24} />
                 <span>Encerrar Sessão</span>
              </button>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 p-6 md:p-10 pt-28 md:pt-10 overflow-x-hidden relative">
        {/* Background Pattern Elements */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.4]">
           <div className="absolute top-[10%] right-[5%] w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl" />
           <div className="absolute bottom-[10%] left-[20%] w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl" />
           <div className="absolute top-[40%] left-[50%] w-40 h-40 bg-brand-pink/5 rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;