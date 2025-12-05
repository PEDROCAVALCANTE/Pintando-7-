import React, { useState } from 'react';
import { Appointment, WeeklyGoal } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle, 
  Circle, 
  Clock, 
  Trash2,
  Target
} from 'lucide-react';

interface NutritionPanelProps {
  appointments: Appointment[];
  goals: WeeklyGoal[];
  onAddAppointment: (apt: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onAddGoal: (goal: WeeklyGoal) => void;
  onToggleGoal: (id: string, status: boolean) => void;
  onDeleteGoal: (id: string) => void;
}

const NutritionPanel: React.FC<NutritionPanelProps> = ({
  appointments,
  goals,
  onAddAppointment,
  onDeleteAppointment,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const isSameDay = (d1: Date, d2: Date) => d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  const getAppointmentsForDay = (date: Date) => appointments.filter(apt => isSameDay(new Date(apt.date), date));

  const [aptForm, setAptForm] = useState({ title: '', time: '09:00', type: 'Consultation' as const });

  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    const dateTime = new Date(selectedDate);
    const [hours, minutes] = aptForm.time.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes));

    onAddAppointment({
      id: crypto.randomUUID(),
      title: aptForm.title,
      date: dateTime.toISOString(),
      type: aptForm.type
    });
    setIsAptModalOpen(false);
    setAptForm({ title: '', time: '09:00', type: 'Consultation' });
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    onAddGoal({ id: crypto.randomUUID(), text: newGoalText, completed: false, createdAt: new Date().toISOString() });
    setNewGoalText('');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Agenda & Metas</h2>
          <p className="text-stone-500 font-medium">Planejamento Nutricional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        {/* Calendar Card */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-stone-800 flex items-center gap-2">
              {monthNames[currentDate.getMonth()]} <span className="text-stone-300">{currentDate.getFullYear()}</span>
            </h3>
            <div className="flex gap-2 bg-stone-50 rounded-2xl p-1">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-xl text-stone-600 shadow-sm transition-all"><ChevronLeft size={18} /></button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-xl text-stone-600 shadow-sm transition-all"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-stone-300 uppercase py-2">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const dayApts = getAppointmentsForDay(date);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`h-24 rounded-2xl p-3 text-left relative transition-all flex flex-col justify-between group ${
                    isSelected ? 'bg-brand-blue text-white shadow-lg shadow-blue-200 scale-105' : 
                    isToday ? 'bg-brand-yellow/10 text-brand-brown' : 'bg-stone-50 hover:bg-stone-100 text-stone-600'
                  }`}
                >
                  <span className={`text-sm font-bold`}>{day}</span>
                  <div className="flex gap-1">
                    {dayApts.slice(0, 3).map((_, idx) => (
                       <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-brand-green'}`} />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-8">
          
          {/* Daily Agenda */}
          <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-stone-800 text-lg">Eventos</h3>
                <p className="text-stone-400 text-xs font-bold uppercase tracking-wider">{selectedDate.getDate()} de {monthNames[selectedDate.getMonth()]}</p>
              </div>
              <button onClick={() => setIsAptModalOpen(true)} className="bg-brand-blue text-white w-10 h-10 rounded-2xl flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 hover:scale-105 active:scale-95">
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {getAppointmentsForDay(selectedDate).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-stone-300">
                  <CalendarIcon size={32} className="mb-2 opacity-50" />
                  <p className="text-xs font-bold uppercase tracking-widest">Vazio</p>
                </div>
              ) : (
                getAppointmentsForDay(selectedDate).map(apt => (
                  <div key={apt.id} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 group hover:bg-white hover:shadow-md transition-all">
                    <div className="text-brand-blue font-bold text-xs bg-blue-50 px-2 py-1 rounded-lg">
                      {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-stone-800 text-sm">{apt.title}</h4>
                      <p className="text-[10px] text-stone-400 uppercase font-bold">{apt.type}</p>
                    </div>
                    <button onClick={() => onDeleteAppointment(apt.id)} className="text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-[2rem] shadow-xl p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10">
               <Target size={120} />
             </div>
            <h3 className="font-black text-xl mb-6 relative z-10">Metas da Semana</h3>
            
            <form onSubmit={handleAddGoal} className="flex gap-2 mb-6 relative z-10">
              <input 
                type="text" 
                placeholder="Nova meta..." 
                className="flex-1 px-4 py-3 text-sm bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 text-white placeholder-purple-200 font-medium transition-all"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
              />
              <button type="submit" className="bg-white text-brand-purple px-4 rounded-xl hover:bg-purple-50 transition-colors font-bold hover:scale-105 active:scale-95">
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-3 relative z-10">
              {goals.map((goal, index) => (
                <div 
                  key={goal.id} 
                  className="flex items-center gap-3 group animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <button onClick={() => onToggleGoal(goal.id, goal.completed)} className="shrink-0 text-white/80 hover:text-white transition-colors hover:scale-110">
                    {goal.completed ? <CheckCircle size={20} className="text-green-300" /> : <Circle size={20} />}
                  </button>
                  <span className={`text-sm flex-1 font-medium ${goal.completed ? 'opacity-50 line-through' : 'opacity-100'}`}>
                    {goal.text}
                  </span>
                  <button onClick={() => onDeleteGoal(goal.id)} className="text-white/40 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
               {goals.length === 0 && <p className="text-purple-200 text-sm italic opacity-60">Sem metas definidas.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* Modal */}
      {isAptModalOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 animate-pop">
            <h3 className="text-xl font-black text-stone-800 mb-6">Novo Evento</h3>
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <input 
                type="text" required
                className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-medium text-stone-800"
                placeholder="Título do evento"
                value={aptForm.title} onChange={e => setAptForm({...aptForm, title: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="time" required
                  className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-medium text-stone-800"
                  value={aptForm.time} onChange={e => setAptForm({...aptForm, time: e.target.value})}
                />
                 <select 
                  className="w-full p-4 bg-stone-50 rounded-2xl outline-none font-medium text-stone-800"
                  value={aptForm.type} onChange={e => setAptForm({...aptForm, type: e.target.value as any})}
                 >
                   <option value="Consultation">Consulta</option>
                   <option value="Meeting">Reunião</option>
                   <option value="Review">Revisão</option>
                 </select>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsAptModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-stone-500 hover:bg-stone-50">Cancelar</button>
                <button type="submit" className="flex-1 py-3.5 bg-brand-blue text-white rounded-2xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPanel;