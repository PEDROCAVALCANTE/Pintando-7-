import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Student, AllergySeverity } from '../types';
import { AlertTriangle, TrendingUp, Users, Activity, Download } from 'lucide-react';

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
    { name: 'Peso Adequado', count: Math.floor(totalStudents * 0.7) },
    { name: 'Sobrepeso', count: Math.floor(totalStudents * 0.15) },
    { name: 'Obesidade', count: Math.floor(totalStudents * 0.05) },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-shadow duration-300 flex items-center justify-between group">
      <div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${color.bg} group-hover:scale-110 duration-300`}>
          <Icon className={`w-6 h-6 ${color.text}`} />
        </div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
      {subText && (
        <div className="text-right">
           <span className={`text-xs font-bold px-3 py-1 rounded-full ${color.bg} ${color.text}`}>
             {subText}
           </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h2>
          <p className="text-slate-500 font-medium">Resumo diário do berçário</p>
        </div>
        <div>
            <button className="bg-white hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                <Download size={18} />
                <span>Exportar Dados</span>
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total de Alunos" 
          value={totalStudents} 
          icon={Users} 
          color={{ bg: 'bg-blue-50', text: 'text-brand-blue' }}
          subText="Ativos"
        />
        <StatCard 
          title="Restrições" 
          value={studentsWithAllergies} 
          icon={AlertTriangle} 
          color={{ bg: 'bg-orange-50', text: 'text-orange-500' }}
          subText="Atenção"
        />
        <StatCard 
          title="Casos Graves" 
          value={severeAllergies} 
          icon={Activity} 
          color={{ bg: 'bg-red-50', text: 'text-brand-red' }}
          subText="Prioridade"
        />
        <StatCard 
          title="Consumo" 
          value="87%" 
          icon={TrendingUp} 
          color={{ bg: 'bg-green-50', text: 'text-brand-green' }}
          subText="Hoje"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Allergy Distribution */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Restrições Alimentares</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allergiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {allergiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#F59E0B' : '#E2E8F0'} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
             {allergiesData.map((d, i) => (
                 <div key={i} className="flex items-center gap-3">
                     <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-orange-400' : 'bg-slate-200'}`}></div>
                     <span className="text-sm text-slate-500 font-bold">{d.name} <span className="text-slate-800">({d.value})</span></span>
                 </div>
             ))}
          </div>
        </div>

        {/* Nutritional Status */}
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <h3 className="text-xl font-bold text-slate-800 mb-8">Indicadores de IMC</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc', radius: 8}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[8, 8, 8, 8]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;