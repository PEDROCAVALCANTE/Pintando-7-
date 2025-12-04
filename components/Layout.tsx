import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Utensils, 
  LogOut, 
  Menu, 
  X,
  Palette,
  Wallet,
  CalendarDays
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
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, color: 'text-brand-blue', activeBg: 'bg-blue-50' },
    { id: 'students', label: 'Meus Alunos', icon: Users, color: 'text-brand-green', activeBg: 'bg-green-50' },
    { id: 'nutrition', label: 'Nutrição', icon: Utensils, color: 'text-brand-pink', activeBg: 'bg-pink-50' },
    { id: 'expenses', label: 'Despesas', icon: Wallet, color: 'text-brand-red', activeBg: 'bg-red-50' },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays, color: 'text-brand-yellow', activeBg: 'bg-yellow-50' },
  ];

  // URL da Logo (Mesma do Login)
  const logoUrl = "https://iili.io/fIiTt9e.png";

  return (
    <div className="min-h-screen bg-brand-cream flex font-sans text-stone-600 selection:bg-brand-red/20">
      {/* Sidebar - Desktop (Minimalist) */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 bg-white fixed h-full z-20 border-r border-stone-100/80 transition-all duration-300 shadow-[2px_0_24px_-12px_rgba(0,0,0,0.05)]">
        <div className="h-32 flex items-center justify-center pt-4">
          <div className="hidden lg:block px-6">
            {/* Imagem da Logo para manter consistência com Login */}
            <img src={logoUrl} alt="Pintando 7" className="w-full h-auto object-contain max-h-24" />
          </div>
          <div className="lg:hidden">
             <img src={logoUrl} alt="P7" className="w-12 h-auto object-contain" />
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-2 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3.5 rounded-2xl transition-all duration-300 group font-bold relative ${
                  isActive
                    ? `${item.activeBg} ${item.color} shadow-sm`
                    : 'text-stone-400 hover:bg-stone-50 hover:text-stone-700'
                }`}
              >
                <div className="flex items-center justify-center w-6 lg:w-auto">
                    <Icon size={22} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                </div>
                <span className="hidden lg:block text-sm tracking-wide">{item.label}</span>
                {isActive && <div className={`absolute right-3 w-1.5 h-1.5 rounded-full ${item.color.replace('text', 'bg')} hidden lg:block`} />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          {/* User Profile Card Minimal */}
          <div className="bg-stone-50 p-3 rounded-2xl flex items-center gap-3 transition-all hover:bg-stone-100 cursor-pointer group border border-stone-100">
            <div className="w-9 h-9 rounded-full bg-white text-brand-red flex items-center justify-center font-black shadow-sm text-sm border border-stone-100">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1 hidden lg:block">
              <p className="text-xs font-bold text-stone-700 truncate">{user?.name}</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wide">Admin</p>
            </div>
            <button onClick={logout} className="hidden lg:block text-stone-300 hover:text-brand-red transition-colors p-1">
                <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white/80 backdrop-blur-md z-30 px-6 py-4 flex items-center justify-between border-b border-stone-100">
         <div className="h-10 flex items-center">
             <img src={logoUrl} alt="P7" className="h-full w-auto object-contain" />
         </div>
         <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-stone-600 p-2 rounded-xl hover:bg-stone-50">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white pt-24 px-6 animate-fade-in flex flex-col h-full">
           <nav className="flex flex-col space-y-2 flex-1">
              {navItems.map((item) => (
                 <button
                    key={item.id}
                    onClick={() => {
                       onNavigate(item.id);
                       setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center space-x-4 p-4 rounded-2xl text-base font-bold transition-all ${
                       activePage === item.id 
                       ? `${item.activeBg} ${item.color}` 
                       : 'text-stone-600 hover:bg-stone-50'
                    }`}
                 >
                    <item.icon size={24} />
                    <span>{item.label}</span>
                 </button>
              ))}
           </nav>
           
           <div className="pb-8">
              <button onClick={logout} className="w-full flex items-center justify-center space-x-3 p-4 text-red-500 font-bold bg-red-50 rounded-2xl">
                 <LogOut size={20} />
                 <span>Sair</span>
              </button>
           </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 md:ml-20 lg:ml-64 p-6 lg:p-10 pt-28 md:pt-10 overflow-x-hidden relative">
        {/* Subtle Background Blobs (Optional - very transparent) */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.15]">
           <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-yellow/20 rounded-full blur-[100px]" />
           <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
           {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;