import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { Student, AllergySeverity } from '../types';
import { AlertTriangle, TrendingUp, Users, Activity } from 'lucide-react';

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

  // Dummy BMI grouping
  const bmiData = [
    { name: 'Baixo Peso', count: Math.floor(totalStudents * 0.1) },
    { name: 'Peso Adequado', count: Math.floor(totalStudents * 0.7) },
    { name: 'Sobrepeso', count: Math.floor(totalStudents * 0.15) },
    { name: 'Obesidade', count: Math.floor(totalStudents * 0.05) },
  ];

  const StatCard = ({ title, value, icon: Icon, color, subText }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {subText && <p className={`text-xs mt-2 font-medium ${color.text}`}>{subText}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color.bg}`}>
        <Icon className={`w-6 h-6 ${color.text}`} />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500">Monitoramento diário de saúde e alunos</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Exportar Relatório
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
          subText="+2 novos esta semana"
        />
        <StatCard 
          title="Restrições Alimentares" 
          value={studentsWithAllergies} 
          icon={AlertTriangle} 
          color={{ bg: 'bg-orange-100', text: 'text-orange-500' }}
          subText={`${Math.round((studentsWithAllergies/totalStudents)*100 || 0)}% do total`}
        />
        <StatCard 
          title="Alergias Graves" 
          value={severeAllergies} 
          icon={Activity} 
          color={{ bg: 'bg-red-100', text: 'text-brand-red' }}
          subText="Atenção prioritária"
        />
        <StatCard 
          title="Consumo Médio" 
          value="87%" 
          icon={TrendingUp} 
          color={{ bg: 'bg-green-100', text: 'text-brand-green' }}
          subText="Refeições aceitas hoje"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Allergy Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição de Restrições</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allergiesData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allergiesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#F59E0B' : '#3B82F6'} />
                  ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
             {allergiesData.map((d, i) => (
                 <div key={i} className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: i === 1 ? '#F59E0B' : '#3B82F6' }}></div>
                     <span className="text-sm text-slate-600 font-medium">{d.name} ({d.value})</span>
                 </div>
             ))}
          </div>
        </div>

        {/* Nutritional Status */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Estado Nutricional (IMC Agregado)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmiData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;