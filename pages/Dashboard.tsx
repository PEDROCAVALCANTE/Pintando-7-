import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Student, AllergySeverity } from '../types';
import { AlertTriangle, TrendingUp, Users, Activity, Download, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  students: Student[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  // Calculations for KPIs
  const totalStudents = students.length;
  const studentsWithAllergies = students.filter(s => s.medical.hasRestriction || s.medical.allergies.length > 0).length;
  const severeAllergies = students.filter(s => s.medical.allergies.some(a => a.severity === AllergySeverity.SEVERE)).length;
  
  // Data for Charts
  const allergiesData = [
    { name: 'Sem Restrições', value: totalStudents - studentsWithAllergies },
    { name: 'Com Restrições', value: studentsWithAllergies },
  ];

  const bmiData = [
    { name: 'Baixo Peso', count: Math.floor(totalStudents * 0.1) },
    { name: 'Adequado', count: Math.floor(totalStudents * 0.7) },
    { name: 'Sobrepeso', count: Math.floor(totalStudents * 0.15) },
    { name: 'Obesidade', count: Math.floor(totalStudents * 0.05) },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subText, gradient }: any) => (
    <div className={`relative overflow-hidden p-6 rounded-[2rem] shadow-[0_8px_30px_-6px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 group bg-gradient-to-br ${gradient} border border-white`}>
      {/* Decorative Circles */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${color.bg.replace('bg-', 'bg-')}`} />
      <div className={`absolute -right-10 top-10 w-16 h-16 rounded-full opacity-10 ${color.bg.replace('bg-', 'bg-')}`} />

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-transform group-hover:scale-110 duration-300 bg-white`}>
            <Icon className={`w-7 h-7 ${color.text}`} />
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
        
        {subText && (
          <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wide ${color.bg} ${color.text}`}>
             {subText}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-1">Dashboard</h2>
          <p className="text-slate-500 font-medium text-lg">Resumo diário do berçário</p>
        </div>
        <div>
            <button className="bg-white hover:bg-slate-50 text-slate-600 px-6 py-3.5 rounded-2xl text-sm font-bold shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] transition-all flex items-center gap-2 border border-slate-100 group">
                <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
                <span>Exportar Relatório</span>
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Alunos" 
          value={totalStudents} 
          icon={Users} 
          color={{ bg: 'bg-blue-100', text: 'text-brand-blue' }}
          gradient="from-white to-blue-50"
          subText="Ativos"
        />
        <StatCard 
          title="Restrições" 
          value={studentsWithAllergies} 
          icon={AlertTriangle} 
          color={{ bg: 'bg-orange-100', text: 'text-orange-500' }}
          gradient="from-white to-orange-50"
          subText="Atenção"
        />
        <StatCard 
          title="Casos Graves" 
          value={severeAllergies} 
          icon={Activity} 
          color={{ bg: 'bg-red-100', text: 'text-brand-red' }}
          gradient="from-white to-red-50"
          subText="Prioridade"
        />
        <StatCard 
          title="Consumo Médio" 
          value="87%" 
          icon={TrendingUp} 
          color={{ bg: 'bg-green-100', text: 'text-brand-green' }}
          gradient="from-white to-green-50"
          subText="Hoje"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Allergy Distribution */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-black text-slate-800">Restrições Alimentares</h3>
             <button className="text-slate-300 hover:text-brand-blue transition-colors">
               <ArrowUpRight size={20} />
             </button>
          </div>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allergiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={8}
                >
                  {allergiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#F59E0B' : '#F1F5F9'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', padding: '12px 20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black text-slate-800">{studentsWithAllergies}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Restrições</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-2">
             {allergiesData.map((d, i) => (
                 <div key={i} className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
                     <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-orange-400' : 'bg-slate-300'}`}></div>
                     <span className="text-sm text-slate-600 font-bold">{d.name} <span className="text-slate-900 ml-1">{d.value}</span></span>
                 </div>
             ))}
          </div>
        </div>

        {/* Nutritional Status */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-50 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-black text-slate-800">Indicadores de IMC</h3>
             <button className="text-slate-300 hover:text-brand-green transition-colors">
               <ArrowUpRight size={20} />
             </button>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} 
                />
                <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 12}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', fontWeight: 'bold', padding: '12px 20px' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10B981" 
                  radius={[12, 12, 12, 12]} 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;