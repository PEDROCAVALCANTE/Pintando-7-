import React, { useState } from 'react';
import { Student, MealType, AIAnalysisResult, MealLog } from '../types';
import { generateStudentReport } from '../services/geminiService';
import { ArrowLeft, BrainCircuit, Activity, Clock, ChevronDown, CheckCircle, AlertTriangle, FileText, Loader2, Salad } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentProfileProps {
  student: Student;
  onBack: () => void;
  logs: MealLog[]; // In a real app, fetch these based on student ID
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

  const handleGenerateReport = async () => {
    setIsLoadingAi(true);
    const result = await generateStudentReport(student);
    setAiResult(result);
    setIsLoadingAi(false);
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
    setIsLogOpen(false);
  };

  const studentLogs = logs.filter(l => l.studentId === student.id);
  const chartData = studentLogs.slice(-7).map(l => ({
    name: new Date(l.date).toLocaleDateString('pt-BR', {weekday: 'short'}),
    consumption: l.consumptionPercentage
  }));

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-brand-blue transition-colors font-medium">
        <ArrowLeft size={20} />
        Voltar para lista
      </button>

      {/* Header Profile */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start">
         <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-white shadow-md">
            {student.fullName.charAt(0)}
         </div>
         <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">{student.fullName}</h1>
            <div className="flex flex-wrap gap-3 mb-4">
              <span className="bg-blue-50 text-brand-blue px-3 py-1 rounded-full text-sm font-bold">{student.schoolClass}</span>
              <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-bold">{student.shift}</span>
              {student.medical.hasRestriction && (
                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm font-bold border border-red-100 flex items-center gap-1">
                  <AlertTriangle size={14} />
                  Restrições Alimentares
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Responsável</p>
                 <p className="font-medium">{student.guardianName}</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Contato</p>
                 <p className="font-medium">{student.contactPhone}</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Peso</p>
                 <p className="font-medium">{student.weightKg} kg</p>
               </div>
               <div>
                 <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">Altura</p>
                 <p className="font-medium">{student.heightCm} cm</p>
               </div>
            </div>
         </div>
         <div className="flex flex-col gap-2 w-full md:w-auto">
            <button 
              onClick={() => setIsLogOpen(!isLogOpen)}
              className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              <Salad size={20} />
              Registrar Refeição
            </button>
            <button 
              onClick={handleGenerateReport}
              disabled={isLoadingAi}
              className="bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoadingAi ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
              Análise Nutricional AI
            </button>
         </div>
      </div>

      {/* Log Meal Form Area (Collapsible) */}
      {isLogOpen && (
        <div className="bg-brand-blue/5 border border-brand-blue/20 rounded-2xl p-6 animate-fade-in-down">
          <h3 className="font-bold text-brand-blue mb-4">Registrar Consumo Alimentar</h3>
          <form onSubmit={handleAddLog} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Refeição</label>
              <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                value={logMealType} onChange={e => setLogMealType(e.target.value as MealType)}>
                {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Consumo (%)</label>
              <input type="range" min="0" max="100" step="10" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                value={logPercentage} onChange={e => setLogPercentage(Number(e.target.value))} />
              <div className="text-right text-sm font-bold text-brand-blue">{logPercentage}%</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Comportamento</label>
               <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg outline-none"
                value={logMood} onChange={e => setLogMood(e.target.value as any)}>
                <option value="Happy">Comeu bem</option>
                <option value="Neutral">Normal</option>
                <option value="Fussy">Agitado</option>
                <option value="Refused">Recusou</option>
              </select>
            </div>
            <button type="submit" className="bg-brand-green text-white font-bold py-2.5 px-4 rounded-lg hover:bg-green-600 transition-colors">
              Salvar Registro
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: AI & Medical */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* AI Result Card */}
          {aiResult && (
             <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <BrainCircuit size={100} className="text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-2">
                   <BrainCircuit /> Relatório Nutricional Inteligente
                </h3>
                
                <div className="space-y-4 relative z-10">
                   <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                      <p className="text-slate-700 leading-relaxed">{aiResult.summary}</p>
                   </div>
                   
                   <div>
                      <h4 className="font-bold text-purple-700 mb-2">Recomendações:</h4>
                      <ul className="space-y-2">
                         {aiResult.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700 text-sm">
                               <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                               {rec}
                            </li>
                         ))}
                      </ul>
                   </div>

                   <div className="flex items-center gap-2 pt-2 border-t border-purple-100">
                      <span className="text-sm font-bold text-slate-500">Nível de Risco:</span>
                      <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wide">
                         {aiResult.riskAssessment}
                      </span>
                   </div>
                </div>
             </div>
          )}

          {/* Medical Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Activity className="text-red-500" /> Dados de Saúde
             </h3>
             <div className="space-y-4">
                {student.medical.allergies.length > 0 ? (
                   <div>
                      <p className="text-sm font-bold text-slate-500 mb-2">Alergias Cadastradas</p>
                      <div className="flex flex-wrap gap-2">
                         {student.medical.allergies.map(a => (
                            <span key={a.id} className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-sm border border-red-100 font-medium">
                               {a.name} • <span className="text-xs uppercase opacity-75">{a.severity}</span>
                            </span>
                         ))}
                      </div>
                   </div>
                ) : (
                   <p className="text-slate-500 italic">Sem alergias cadastradas.</p>
                )}
                
                {student.medical.medicalNotes && (
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notas Clínicas</p>
                      <p className="text-slate-700">{student.medical.medicalNotes}</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Col: Stats & History */}
        <div className="space-y-6">
           {/* Weekly Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Consumo Semanal</h3>
              <div className="h-48">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                       <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
                       <Bar dataKey="consumption" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Recent Logs List */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Histórico Recente</h3>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                 {studentLogs.length === 0 ? (
                    <p className="text-center text-slate-400 py-4">Nenhum registro ainda.</p>
                 ) : (
                    studentLogs.slice().reverse().map(log => (
                       <div key={log.id} className="flex items-start gap-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                             log.consumptionPercentage >= 75 ? 'bg-green-100 text-green-600' :
                             log.consumptionPercentage >= 50 ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                          }`}>
                             <span className="text-xs font-bold">{log.consumptionPercentage}%</span>
                          </div>
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{log.mealType}</p>
                             <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(log.date).toLocaleDateString()}
                             </p>
                             <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded mt-1 inline-block">
                                Humor: {log.mood === 'Happy' ? '😊 Bem' : log.mood === 'Neutral' ? '😐 Normal' : log.mood === 'Fussy' ? '😫 Agitado' : '😡 Recusou'}
                             </span>
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