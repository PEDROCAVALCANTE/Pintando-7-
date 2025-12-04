
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
  Target,
  MoreVertical
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

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.date), date));
  };

  // Appointment Form State
  const [aptForm, setAptForm] = useState({
    title: '',
    time: '09:00',
    type: 'Consultation' as const
  });

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
    onAddGoal({
      id: crypto.randomUUID(),
      text: newGoalText,
      completed: false,
      createdAt: new Date().toISOString()
    });
    setNewGoalText('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel do Nutricionista</h2>
          <p className="text-slate-500">Gestão de agenda e metas nutricionais</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Calendar */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-brand-green flex items-center gap-2">
              <CalendarIcon /> {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                <ChevronLeft />
              </button>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
                <ChevronRight />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-bold text-slate-400 uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 md:h-32 bg-slate-50/50 rounded-xl"></div>
            ))}
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
                  className={`h-24 md:h-32 rounded-xl p-2 text-left relative transition-all border ${
                    isSelected 
                      ? 'bg-brand-blue/5 border-brand-blue ring-1 ring-brand-blue' 
                      : isToday 
                        ? 'bg-brand-yellow/10 border-brand-yellow' 
                        : 'bg-white border-slate-100 hover:border-brand-blue/30'
                  }`}
                >
                  <span className={`inline-block w-7 h-7 text-sm font-bold rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-brand-blue text-white' : isToday ? 'bg-brand-yellow text-brand-red' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  
                  {/* Appointment Dots/List */}
                  <div className="mt-2 space-y-1 overflow-hidden">
                    {dayApts.slice(0, 3).map((apt, idx) => (
                      <div key={apt.id} className="text-[0.65rem] truncate px-1.5 py-0.5 rounded bg-brand-green/10 text-brand-green font-bold border border-brand-green/20">
                        {apt.title}
                      </div>
                    ))}
                    {dayApts.length > 3 && (
                      <div className="text-[0.6rem] text-slate-400 pl-1">
                        +{dayApts.length - 3} mais
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Daily Agenda & Goals */}
        <div className="space-y-6">
          
          {/* Daily Agenda Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Agenda do Dia</h3>
                <p className="text-slate-500 text-sm">{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
              </div>
              <button 
                onClick={() => setIsAptModalOpen(true)}
                className="bg-brand-blue text-white p-2 rounded-lg hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-3 min-h-[150px]">
              {getAppointmentsForDay(selectedDate).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
                  <CalendarIcon size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">Nenhum agendamento</p>
                </div>
              ) : (
                getAppointmentsForDay(selectedDate).map(apt => (
                  <div key={apt.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group">
                    <div className="mt-1 text-brand-blue">
                      <Clock size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{apt.title}</h4>
                      <p className="text-xs text-slate-500">
                        {new Date(apt.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {apt.type === 'Consultation' ? 'Consulta' : apt.type === 'Meeting' ? 'Reunião' : 'Revisão'}
                      </p>
                    </div>
                    <button 
                      onClick={() => onDeleteAppointment(apt.id)}
                      className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Weekly Goals Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Target size={100} className="text-brand-purple" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <Target className="text-brand-purple" /> Metas da Semana
            </h3>
            
            <form onSubmit={handleAddGoal} className="flex gap-2 mb-4 relative z-10">
              <input 
                type="text" 
                placeholder="Nova meta..." 
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-purple/20"
                value={newGoalText}
                onChange={(e) => setNewGoalText(e.target.value)}
              />
              <button type="submit" className="bg-brand-purple text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                <Plus size={18} />
              </button>
            </form>

            <div className="space-y-2 relative z-10">
              {goals.length === 0 && <p className="text-slate-400 text-sm italic">Nenhuma meta definida.</p>}
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center gap-3 group">
                  <button 
                    onClick={() => onToggleGoal(goal.id, goal.completed)}
                    className={`shrink-0 transition-colors ${goal.completed ? 'text-green-500' : 'text-slate-300 hover:text-slate-400'}`}
                  >
                    {goal.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </button>
                  <span className={`text-sm flex-1 ${goal.completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                    {goal.text}
                  </span>
                  <button 
                    onClick={() => onDeleteGoal(goal.id)}
                    className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Add Appointment Modal */}
      {isAptModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Novo Agendamento</h3>
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Título / Aluno</label>
                <input 
                  type="text" 
                  required
                  className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20"
                  placeholder="Ex: Consulta Gabriel"
                  value={aptForm.title}
                  onChange={e => setAptForm({...aptForm, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Horário</label>
                   <input 
                    type="time" 
                    required
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20"
                    value={aptForm.time}
                    onChange={e => setAptForm({...aptForm, time: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
                   <select 
                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/20 bg-white"
                    value={aptForm.type}
                    onChange={e => setAptForm({...aptForm, type: e.target.value as any})}
                   >
                     <option value="Consultation">Consulta</option>
                     <option value="Meeting">Reunião</option>
                     <option value="Review">Revisão</option>
                   </select>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setIsAptModalOpen(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-blue-600 shadow-lg shadow-blue-200">
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NutritionPanel;
