import React, { useState } from 'react';
import { Student, MealType, AIAnalysisResult, MealLog } from '../types';
import { generateStudentReport } from '../services/geminiService';
import { ArrowLeft, BrainCircuit, Activity, Clock, ChevronDown, CheckCircle, AlertTriangle, FileText, Loader2, Salad, BellRing, Utensils } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  logs: MealLog[];
  onAddLog: (log: MealLog) => void;
}

const StudentProfile: React.FC<StudentProfileProps> = ({ student, onBack, logs, onAddLog }) => {
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  
  // Log Form State
  const [logMealType, setLogMealType] = useState<MealType>(MealType.LUNCH);
  const [logPercentage, setLogPercentage] = useState(100);
  const [logMood, setLogMood] = useState<'Happy' | 'Neutral' | 'Fussy' | 'Refused'>('Happy');

  // Simulation state
  const [notificationSent, setNotificationSent] = useState(false);

  const handleGenerateReport = async () => {
    setIsLoadingAi(true);
    const result = await generateStudentReport(student);
    setAiResult(result);
    setIsLoadingAi(false);
  };

  const notifyGuardian = (reason: string) => {
    if (Notification.permission === 'granted') {
      new Notification(`Alerta: ${student.fullName}`, {
        body: `Notificação enviada: ${reason}`,
        icon: '/vite.svg'
      });
    }
    setNotificationSent(true);
    setTimeout(() => setNotificationSent(false), 4000);
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: MealLog = {
      id: crypto.randomUUID(),
      studentId: student.id,
      date: new Date().toISOString(),
      mealType: logMealType,
      consumptionPercentage: logPercentage,
      mood: logMood,
      notes: ''
    };
    onAddLog(newLog);
    
    if (logMood === 'Refused' || logPercentage < 30) {
      notifyGuardian(`Recusou a refeição (${logMealType}).`);
    }

    setIsLogOpen(false);
  };

  const studentLogs = logs.filter(l => l.studentId === student.id);
  const chartData = studentLogs.slice(-7).map(l => ({
    name: new Date(l.date).toLocaleDateString('pt-BR', {weekday: 'short'}),
    consumption: l.consumptionPercentage
  }));

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
         <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-2xl shadow-sm">
            <ArrowLeft size={18} />
            Voltar
         </button>
      </div>

      {/* Profile Header Minimal */}
      <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] relative overflow-hidden">
         {notificationSent && (
            <div className="absolute top-0 left-0 w-full bg-green-500 text-white p-2 text-center text-xs font-bold animate-fade-in-down flex items-center justify-center gap-2 z-10">
              <BellRing size={14} />
              Responsável notificado!
            </div>
         )}
         
         <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center text-4xl font-black text-slate-300 shadow-inner">
               {student.fullName.charAt(0)}
            </div>
            
            <div className="flex-1 text-center md:text-left">
               <h1 className="text-3xl font-black text-slate-800 mb-2">{student.fullName}</h1>
               <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                  <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide">{student.schoolClass}</span>
                  {student.medical.hasRestriction && (
                     <span className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide border border-transparent">
                        Restrições
                     </span>
                  )}
               </div>
               
               <div className="flex flex-wrap justify-center md:justify-start gap-8 text-slate-600">
                  <div className="text-center md:text-left">
                     <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Responsável</p>
                     <p className="font-bold text-sm">{student.guardianName}</p>
                  </div>
                  <div className="text-center md:text-left">
                     <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1">Contato</p>
                     <p className="font-bold text-sm">{student.contactPhone}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
               <button 
                 onClick={() => setIsLogOpen(!isLogOpen)}
                 className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 text-sm"
               >
                 <Utensils size={18} />
                 Registrar Refeição
               </button>
               <button 
                 onClick={handleGenerateReport}
                 disabled={isLoadingAi}
                 className="bg-purple-50 hover:bg-purple-100 text-purple-700 px-6 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
               >
                 {isLoadingAi ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
                 Gerar Relatório IA
               </button>
            </div>
         </div>
      </div>

      {/* Log Meal Form (Inline) */}
      {isLogOpen && (
        <div className="bg-white rounded-[2rem] p-8 shadow-xl animate-fade-in-down border border-slate-50 relative z-20">
          <div className="flex justify-between items-center mb-6">
             <h3 className="font-black text-slate-800 text-lg">Nova Refeição</h3>
             <button onClick={() => setIsLogOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">Cancelar</button>
          </div>
          <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipo</label>
              <select className="w-full p-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700"
                value={logMealType} onChange={e => setLogMealType(e.target.value as MealType)}>
                {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Aceitação ({logPercentage}%)</label>
              <input type="range" min="0" max="100" step="10" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-green"
                value={logPercentage} onChange={e => setLogPercentage(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Reação</label>
               <select className="w-full p-3 bg-slate-50 rounded-2xl outline-none font-bold text-slate-700"
                value={logMood} onChange={e => setLogMood(e.target.value as any)}>
                <option value="Happy">Comeu bem</option>
                <option value="Neutral">Normal</option>
                <option value="Fussy">Agitado</option>
                <option value="Refused">Recusou</option>
              </select>
            </div>
            <button type="submit" className="bg-brand-green text-white font-bold py-3.5 px-6 rounded-2xl hover:bg-green-600 transition-colors shadow-lg shadow-green-200">
              Salvar
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Result */}
          {aiResult && (
             <div className="bg-purple-600 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-purple-500 opacity-20">
                   <BrainCircuit size={150} />
                </div>
                
                <h3 className="text-xl font-black mb-6 flex items-center gap-3 relative z-10">
                   <BrainCircuit /> Análise Inteligente
                </h3>
                
                <div className="space-y-6 relative z-10">
                   <p className="leading-relaxed font-medium opacity-90">{aiResult.summary}</p>
                   
                   <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-sm">
                      <h4 className="font-bold mb-4 opacity-80 uppercase text-xs tracking-widest">Recomendações</h4>
                      <ul className="space-y-3">
                         {aiResult.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-sm font-medium">
                               <CheckCircle size={18} className="text-green-300 shrink-0" />
                               {rec}
                            </li>
                         ))}
                      </ul>
                   </div>
                </div>
             </div>
          )}

          {/* Medical */}
          <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
             <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
                <Activity className="text-red-500" /> Histórico de Saúde
             </h3>
             <div className="space-y-6">
                {student.medical.allergies.length > 0 ? (
                   <div className="flex flex-wrap gap-3">
                      {student.medical.allergies.map(a => (
                         <span key={a.id} className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-bold">
                            {a.name} ({a.severity})
                         </span>
                      ))}
                   </div>
                ) : (
                   <p className="text-slate-400 font-medium">Nenhuma alergia registrada.</p>
                )}
                
                {student.medical.medicalNotes && (
                   <div className="bg-slate-50 p-6 rounded-2xl">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wide">Notas Clínicas</p>
                      <p className="text-slate-700 font-medium leading-relaxed">{student.medical.medicalNotes}</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Col */}
        <div className="space-y-8">
           {/* Chart */}
           <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-black text-slate-800 mb-6">Consumo Semanal</h3>
              <div className="h-40">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} />
                       <Tooltip cursor={{fill: '#f1f5f9', radius: 8}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                       <Bar dataKey="consumption" fill="#10B981" radius={[6, 6, 6, 6]} barSize={32} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* History */}
           <div className="bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <h3 className="text-lg font-black text-slate-800 mb-6">Histórico</h3>
              <div className="space-y-0 relative">
                 {/* Timeline Line */}
                 <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-100"></div>

                 {studentLogs.length === 0 ? (
                    <p className="text-slate-400 font-medium text-center py-4">Sem registros.</p>
                 ) : (
                    studentLogs.slice().reverse().map(log => (
                       <div key={log.id} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm ${
                             log.consumptionPercentage >= 75 ? 'bg-green-100 text-green-600' :
                             log.consumptionPercentage >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                          }`}>
                             <span className="text-[10px] font-black">{log.consumptionPercentage}%</span>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-2xl flex-1">
                             <div className="flex justify-between items-start">
                                <p className="font-bold text-slate-800 text-sm">{log.mealType}</p>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(log.date).toLocaleDateString()}</span>
                             </div>
                             <p className="text-xs text-slate-500 font-medium mt-1">
                                {log.mood === 'Happy' ? 'Comeu bem' : log.mood === 'Neutral' ? 'Normal' : log.mood === 'Fussy' ? 'Agitado' : 'Recusou'}
                             </p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;