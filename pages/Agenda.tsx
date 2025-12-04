import React, { useState } from 'react';
import { 
  SchoolEvent, 
  Student, 
  EventAudience, 
  EventStatus 
} from '../types';
import { 
  Calendar, 
  Clock, 
  MessageCircle, 
  Send, 
  Plus, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface AgendaProps {
  events: SchoolEvent[];
  students: Student[];
  onAddEvent: (e: SchoolEvent) => void;
  onUpdateEvent: (e: SchoolEvent) => void;
  onDeleteEvent: (id: string) => void;
}

const Agenda: React.FC<AgendaProps> = ({ 
  events, 
  students, 
  onAddEvent, 
  onUpdateEvent, 
  onDeleteEvent 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  
  // WhatsApp Simulation State
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);

  const initialFormState: Partial<SchoolEvent> = {
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    audience: 'GLOBAL',
    targetId: '',
    status: 'DRAFT',
    whatsappStatus: 'PENDING',
    deliveryStats: { total: 0, success: 0, failed: 0 }
  };
  const [formData, setFormData] = useState<Partial<SchoolEvent>>(initialFormState);

  // Calendar Logic
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr);
  };

  const handleOpenModal = (event?: SchoolEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData(event);
    } else {
      setEditingEvent(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const eventToSave = {
      ...formData,
      id: editingEvent ? editingEvent.id : crypto.randomUUID(),
      createdAt: editingEvent ? editingEvent.createdAt : new Date().toISOString()
    } as SchoolEvent;

    if (editingEvent) {
      onUpdateEvent(eventToSave);
    } else {
      onAddEvent(eventToSave);
    }
    setIsModalOpen(false);
  };

  // Helper para limpar telefone
  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  // --- WHATSAPP HANDLER ---
  const handlePublishAndSend = async (event: SchoolEvent) => {
    if (event.whatsappStatus === 'COMPLETED') {
        if(!confirm('Este evento já foi enviado. Deseja reenviar?')) return;
    }

    setIsSending(true);
    setSendProgress(0);

    // 1. Determine Recipients
    let recipients: Student[] = [];
    if (event.audience === 'GLOBAL') recipients = students;
    else if (event.audience === 'CLASS') recipients = students.filter(s => s.schoolClass === event.targetId);
    else if (event.audience === 'STUDENT') recipients = students.filter(s => s.id === event.targetId);

    const total = recipients.length || 1;
    let successCount = 0;
    
    // Update status to SENDING
    onUpdateEvent({ ...event, status: 'PUBLISHED', whatsappStatus: 'SENDING' });

    // 2. Lógica de Envio
    // Se for UM aluno específico, abrimos o WhatsApp Web Realmente
    if (event.audience === 'STUDENT' && recipients.length === 1) {
       const student = recipients[0];
       if (student.contactPhone) {
          const phone = cleanPhone(student.contactPhone);
          // Adiciona 55 se não tiver
          const finalPhone = phone.length <= 11 ? `55${phone}` : phone;
          
          const message = encodeURIComponent(
             `*Escola Berçário Pintando 7*\n\n` +
             `Olá ${student.guardianName}, nova atualização na agenda:\n\n` +
             `*${event.title}*\n` +
             `📅 ${new Date(event.date).toLocaleDateString('pt-BR')} às ${event.time}\n` +
             `📝 ${event.description}\n\n` +
             `Acesse o app para mais detalhes.`
          );
          
          // Abre WhatsApp em nova aba
          window.open(`https://wa.me/${finalPhone}?text=${message}`, '_blank');
          successCount = 1;
          setSendProgress(100);
       }
    } else {
       // Se for EM MASSA (Turma/Global), mantemos a simulação pois o navegador bloqueia abrir 50 abas
       // Em produção, isso chamaria sua API de Backend (ex: Z-API, Twilio)
       
       for (let i = 0; i < recipients.length; i++) {
         // Simula delay de rede e processamento da API
         await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
         
         // Mock success (simulando 100% de sucesso para teste)
         successCount++;
         setSendProgress(Math.round(((i + 1) / total) * 100));
       }
    }

    // 3. Complete
    onUpdateEvent({ 
      ...event, 
      status: 'PUBLISHED', 
      whatsappStatus: 'COMPLETED',
      deliveryStats: {
        total: recipients.length,
        success: successCount,
        failed: recipients.length - successCount
      }
    });

    setIsSending(false);
    setSendProgress(0);
  };

  // KPIs
  const publishedEvents = events.filter(e => e.status === 'PUBLISHED').length;
  const messagesSent = events.reduce((acc, curr) => acc + (curr.deliveryStats?.success || 0), 0);
  const totalRecipients = events.reduce((acc, curr) => acc + (curr.deliveryStats?.total || 0), 0);
  const successRate = totalRecipients > 0 ? Math.round((messagesSent / totalRecipients) * 100) : 100;

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Agenda Escolar</h2>
          <p className="text-stone-500 font-medium">Eventos e Comunicação</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-yellow text-brand-brown px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md shadow-yellow-100 text-sm hover:shadow-lg hover:scale-105 active:scale-95 border border-yellow-200"
        >
          <Plus size={18} />
          <span>Novo Evento</span>
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-green-50 text-brand-green rounded-2xl flex items-center justify-center">
             <MessageCircle size={24} />
           </div>
           <div>
             <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">Mensagens Enviadas</p>
             <h3 className="text-2xl font-black text-stone-800">{messagesSent}</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 text-brand-blue rounded-2xl flex items-center justify-center">
             <CheckCircle size={24} />
           </div>
           <div>
             <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">Taxa de Entrega</p>
             <h3 className="text-2xl font-black text-stone-800">{successRate}%</h3>
           </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center">
             <Calendar size={24} />
           </div>
           <div>
             <p className="text-xs font-bold text-stone-400 uppercase tracking-wide">Eventos Publicados</p>
             <h3 className="text-2xl font-black text-stone-800">{publishedEvents}</h3>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
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
              const dayEvents = getEventsForDay(day);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

              return (
                <div key={day} className={`min-h-[100px] rounded-2xl p-2 border ${isToday ? 'border-brand-blue/30 bg-blue-50/30' : 'border-stone-100 bg-stone-50/30'} flex flex-col gap-1 hover:border-brand-blue/50 transition-colors`}>
                  <span className={`text-xs font-bold mb-1 block text-right ${isToday ? 'text-brand-blue' : 'text-stone-400'}`}>{day}</span>
                  {dayEvents.map(ev => (
                    <div 
                      key={ev.id} 
                      onClick={() => handleOpenModal(ev)}
                      className={`text-[10px] font-bold p-1.5 rounded-lg truncate cursor-pointer transition-all hover:scale-105 ${
                        ev.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-600'
                      }`}
                      title={ev.title}
                    >
                      {ev.time} {ev.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Events List */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 p-8 flex flex-col">
          <h3 className="text-lg font-black text-stone-800 mb-6">Próximos Eventos</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .filter(e => new Date(e.date) >= new Date())
              .map(event => (
                <div key={event.id} className="bg-stone-50 p-4 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-stone-100">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-md w-fit mb-1">
                        {new Date(event.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})} • {event.time}
                      </span>
                      <h4 className="font-bold text-stone-800 text-sm leading-tight">{event.title}</h4>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenModal(event)} className="p-1.5 text-stone-400 hover:text-brand-blue rounded-lg"><Eye size={14}/></button>
                      <button onClick={() => onDeleteEvent(event.id)} className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg"><Trash2 size={14}/></button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-stone-500 line-clamp-2 mb-3 leading-relaxed">{event.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                     <span className="text-[10px] font-bold uppercase text-stone-400 flex items-center gap-1">
                       <Users size={10} /> {event.audience === 'GLOBAL' ? 'Todos' : event.audience === 'CLASS' ? 'Turma' : 'Aluno'}
                     </span>
                     
                     {event.status === 'PUBLISHED' ? (
                       <div className="flex items-center gap-1.5">
                          <CheckCircle size={12} className="text-green-500" />
                          <span className="text-[10px] font-bold text-green-600">Enviado ({event.deliveryStats?.success}/{event.deliveryStats?.total})</span>
                       </div>
                     ) : (
                       <button 
                         onClick={() => handlePublishAndSend(event)}
                         disabled={isSending}
                         className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm transition-all disabled:opacity-50"
                       >
                         {isSending ? <Loader2 size={10} className="animate-spin"/> : <Send size={10} />}
                         {event.audience === 'STUDENT' ? 'Enviar WhatsApp' : 'Publicar'}
                       </button>
                     )}
                  </div>
                </div>
            ))}
            {events.length === 0 && <p className="text-stone-400 text-center italic text-sm">Nenhum evento futuro.</p>}
          </div>
        </div>
      </div>

      {/* Sending Overlay */}
      {isSending && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
           <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl animate-pop">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                 <MessageCircle size={32} />
                 <div className="absolute inset-0 border-4 border-green-500/30 rounded-full animate-ping" />
              </div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Enviando Notificações</h3>
              <p className="text-stone-500 text-sm font-medium mb-6">Disparando mensagens via WhatsApp...</p>
              
              <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${sendProgress}%` }} />
              </div>
              <p className="text-xs font-bold text-stone-400">{sendProgress}% concluído</p>
           </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-pop border border-stone-100 max-h-[90vh] overflow-y-auto">
             <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-6 border-b border-stone-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-stone-800">
                {editingEvent ? 'Editar Evento' : 'Novo Evento'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-stone-50 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all hover:rotate-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Título do Evento</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 bg-stone-50 border-none rounded-xl text-stone-800 font-bold focus:ring-2 focus:ring-brand-blue/10 outline-none"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ex: Reunião de Pais"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Data</label>
                    <input type="date" required className="w-full px-4 py-3 bg-stone-50 rounded-xl font-medium text-stone-700 outline-none" 
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Hora</label>
                    <input type="time" required className="w-full px-4 py-3 bg-stone-50 rounded-xl font-medium text-stone-700 outline-none" 
                      value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Público Alvo</label>
                <select 
                  className="w-full px-4 py-3 bg-stone-50 rounded-xl font-bold text-stone-700 outline-none"
                  value={formData.audience} onChange={e => setFormData({...formData, audience: e.target.value as EventAudience})}
                >
                  <option value="GLOBAL">Todos os Responsáveis</option>
                  <option value="CLASS">Turma Específica</option>
                  <option value="STUDENT">Aluno Específico</option>
                </select>
              </div>

              {formData.audience === 'CLASS' && (
                 <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Selecione a Turma</label>
                    <select className="w-full px-4 py-3 bg-stone-50 rounded-xl font-medium text-stone-700" value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})}>
                       <option value="">Selecione...</option>
                       <option value="Berçário 1">Berçário 1</option>
                       <option value="Berçário 2">Berçário 2</option>
                       <option value="Maternal 1">Maternal 1</option>
                    </select>
                 </div>
              )}

              {formData.audience === 'STUDENT' && (
                 <div>
                    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Selecione o Aluno</label>
                    <select className="w-full px-4 py-3 bg-stone-50 rounded-xl font-medium text-stone-700" value={formData.targetId} onChange={e => setFormData({...formData, targetId: e.target.value})}>
                       <option value="">Selecione...</option>
                       {students.map(s => <option key={s.id} value={s.id}>{s.fullName}</option>)}
                    </select>
                 </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Descrição</label>
                <textarea 
                  className="w-full px-4 py-3 bg-stone-50 rounded-xl font-medium text-stone-700 h-24 resize-none outline-none focus:ring-2 focus:ring-brand-blue/10"
                  placeholder="Detalhes do evento..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-3">
                 <MessageCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
                 <p className="text-xs text-green-800 font-medium leading-relaxed">
                    <strong>Importante:</strong> Para envio individual, o WhatsApp Web abrirá automaticamente. Para envio em massa (Turma/Global), o sistema simulará o processo (requer API paga para envio real).
                 </p>
              </div>

              <div className="flex gap-2 pt-4">
                 <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-bold text-stone-500 hover:bg-stone-50 transition-colors">Cancelar</button>
                 <button type="submit" className="flex-1 py-3.5 bg-brand-yellow text-brand-brown rounded-2xl font-bold hover:bg-yellow-400 shadow-lg shadow-yellow-100 transition-colors">Salvar Rascunho</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agenda;