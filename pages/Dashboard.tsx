import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Student, AllergySeverity } from '../types';
import { AlertTriangle, TrendingUp, Users, Activity, Download, ArrowUpRight } from 'lucide-react';

interface DashboardProps {
  students: Student[];
}

const Dashboard: React.FC<DashboardProps> = ({ students }) => {
  const totalStudents = students.length;
  const studentsWithAllergies = students.filter(s => s.medical.hasRestriction || s.medical.allergies.length > 0).length;
  const severeAllergies = students.filter(s => s.medical.allergies.some(a => a.severity === AllergySeverity.SEVERE)).length;
  
  const allergiesData = [
    { name: 'Sem Restrições', value: totalStudents - studentsWithAllergies },
    { name: 'Com Restrições', value: studentsWithAllergies },
  ];

  const bmiData = [
    { name: 'Baixo', count: Math.floor(totalStudents * 0.1) },
    { name: 'Adequado', count: Math.floor(totalStudents * 0.7) },
    { name: 'Sobrepeso', count: Math.floor(totalStudents * 0.15) },
    { name: 'Obesidade', count: Math.floor(totalStudents * 0.05) },
  ];

  // Minimalist Stat Card with Staggered Animation
  const StatCard = ({ title, value, icon: Icon, color, subText, delay }: any) => (
    <div 
      className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300 group flex items-start justify-between opacity-0 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div>
        <p className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
        <h3 className="text-4xl font-black text-stone-800 tracking-tight">{value}</h3>
        {subText && (
          <span className="inline-block mt-2 text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-lg">
            {subText}
          </span>
        )}
      </div>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color.bg} transition-transform duration-500 ease-out group-hover:rotate-12 group-hover:scale-110`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Visão Geral</h2>
          <p className="text-stone-400 font-medium mt-1">Acompanhamento em tempo real</p>
        </div>
        <button className="bg-white hover:bg-stone-50 text-stone-600 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm border border-stone-100 transition-all flex items-center gap-2 hover:scale-105 active:scale-95">
            <Download size={16} />
            <span>Relatório PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Alunos" 
          value={totalStudents} 
          icon={Users} 
          color={{ bg: 'bg-blue-50', text: 'text-brand-blue' }}
          subText="Ativos"
          delay={100}
        />
        <StatCard 
          title="Restrições" 
          value={studentsWithAllergies} 
          icon={AlertTriangle} 
          color={{ bg: 'bg-orange-50', text: 'text-orange-500' }}
          subText="Atenção"
          delay={200}
        />
        <StatCard 
          title="Casos Graves" 
          value={severeAllergies} 
          icon={Activity} 
          color={{ bg: 'bg-red-50', text: 'text-brand-red' }}
          subText="Prioritário"
          delay={300}
        />
        <StatCard 
          title="Consumo" 
          value="87%" 
          icon={TrendingUp} 
          color={{ bg: 'bg-green-50', text: 'text-brand-green' }}
          subText="Média Dia"
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div 
          className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col opacity-0 animate-fade-in-up"
          style={{ animationDelay: '500ms' }}
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-stone-800">Restrições Alimentares</h3>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allergiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                  isAnimationActive={true}
                  animationDuration={1500}
                >
                  {allergiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#F59E0B' : '#E7E5E4'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-stone-800 animate-pop" style={{ animationDelay: '1s' }}>{studentsWithAllergies}</span>
                <span className="text-[10px] font-bold text-stone-400 uppercase">Alunos</span>
            </div>
          </div>
          <div className="flex justify-center gap-6">
             <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-stone-200"></div>
                 <span className="text-xs font-bold text-stone-500">Sem Restrição</span>
             </div>
             <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                 <span className="text-xs font-bold text-stone-500">Com Restrição</span>
             </div>
          </div>
        </div>

        <div 
          className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100 flex flex-col opacity-0 animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-stone-800">Distribuição IMC</h3>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#a8a29e', fontSize: 10, fontWeight: 600}} 
                  dy={10} 
                />
                <YAxis hide />
                <Tooltip 
                    cursor={{fill: '#fafaf9', radius: 8}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#10B981" 
                  radius={[8, 8, 8, 8]}
                  animationDuration={2000}
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