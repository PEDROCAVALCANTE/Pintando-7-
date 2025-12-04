import React, { useState, useMemo } from 'react';
import { 
  Expense, 
  EXPENSE_CATEGORIES, 
  PaymentMethod 
} from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  X, 
  Save, 
  Calendar, 
  Tag, 
  CreditCard,
  FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area
} from 'recharts';

interface ExpensesPageProps {
  expenses: Expense[];
  onAddExpense: (e: Expense) => void;
  onUpdateExpense: (e: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const InputWithIcon = ({ 
  label, icon: Icon, value, onChange, type = "text", required = false, placeholder = "", step = undefined 
}: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-slate-300 group-focus-within:text-brand-blue transition-colors duration-300" />
      </div>
      <input
        type={type}
        required={required}
        step={step}
        className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all duration-300 font-semibold text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // Form State
  const initialFormState: Partial<Expense> = {
    description: '',
    amount: 0,
    category: 'Outros',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Pix',
    supplier: '',
    notes: ''
  };
  const [formData, setFormData] = useState<Partial<Expense>>(initialFormState);

  // --- Derived Data & KPIs ---
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            e.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = e.date.startsWith(filterMonth);
      return matchesSearch && matchesMonth;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm, filterMonth]);

  const totalMonth = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  
  // Comparativo com mês anterior
  const prevMonthDate = new Date(filterMonth + '-01');
  prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
  const prevMonthStr = prevMonthDate.toISOString().slice(0, 7);
  const prevMonthTotal = expenses
    .filter(e => e.date.startsWith(prevMonthStr))
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  const percentageChange = prevMonthTotal === 0 ? 0 : ((totalMonth - prevMonthTotal) / prevMonthTotal) * 100;

  // Categoria mais cara
  const expensesByCategory = filteredExpenses.reduce((acc, curr) => {
    const cat = curr.category || 'Outros';
    acc[cat] = (acc[cat] || 0) + Number(curr.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(expensesByCategory).sort((a, b) => (b[1] as number) - (a[1] as number))[0];

  // Data for Charts
  const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({ name, value: value as number }));
  const COLORS = ['#009FE3', '#E6332A', '#3EB149', '#FFED00', '#E5007E', '#966036', '#8B5CF6', '#64748B'];

  // Monthly Trend Data (Last 6 months)
  const trendData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStr = d.toISOString().slice(0, 7); // YYYY-MM
      const total = expenses
        .filter(e => e.date.startsWith(mStr))
        .reduce((acc, curr) => acc + curr.amount, 0);
      data.push({
        name: d.toLocaleDateString('pt-BR', { month: 'short' }),
        total: total
      });
    }
    return data;
  }, [expenses]);

  const handleOpenModal = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData(expense);
    } else {
      setEditingExpense(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      onUpdateExpense({ ...formData, id: editingExpense.id } as Expense);
    } else {
      onAddExpense({ ...formData, id: crypto.randomUUID(), createdAt: new Date().toISOString() } as Expense);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Financeiro</h2>
          <p className="text-slate-400 font-medium">Controle de Despesas</p>
        </div>
        <div className="flex gap-3">
          <input 
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/10"
          />
          <button 
            onClick={() => handleOpenModal()}
            className="bg-brand-red hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md shadow-red-100 text-sm hover:shadow-lg hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>Nova Despesa</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Total no Mês</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(totalMonth)}</h3>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-brand-red flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            {percentageChange > 0 ? (
              <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingUp size={12} /> +{percentageChange.toFixed(1)}%
              </span>
            ) : (
              <span className="bg-green-50 text-green-500 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                <TrendingDown size={12} /> {percentageChange.toFixed(1)}%
              </span>
            )}
            <span className="text-[10px] text-slate-400 font-bold">vs. mês anterior</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between">
           <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Maior Categoria</p>
              <h3 className="text-xl font-black text-slate-800 tracking-tight truncate">
                {topCategory ? topCategory[0] : '---'}
              </h3>
              <p className="text-brand-red font-bold text-sm mt-1">{topCategory ? formatCurrency(topCategory[1]) : 'R$ 0,00'}</p>
           </div>
           <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center self-end">
              <PieChartIcon size={24} />
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between lg:col-span-2">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">Evolução Semestral</p>
           <div className="h-24 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E6332A" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#E6332A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: any) => formatCurrency(Number(value as any))}
                  />
                  <Area type="monotone" dataKey="total" stroke="#E6332A" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-black text-slate-800">Lançamentos</h3>
              <div className="relative group w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-brand-blue transition-colors" />
                <input 
                  type="text"
                  placeholder="Buscar despesa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-brand-blue/10 outline-none"
                />
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-50">
                   <th className="pb-3 pl-4 font-bold">Data</th>
                   <th className="pb-3 font-bold">Descrição</th>
                   <th className="pb-3 font-bold">Categoria</th>
                   <th className="pb-3 font-bold">Valor</th>
                   <th className="pb-3 pr-4 font-bold text-right">Ações</th>
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {filteredExpenses.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="py-8 text-center text-slate-400 font-medium italic">Nenhuma despesa encontrada neste período.</td>
                   </tr>
                 ) : (
                   filteredExpenses.map((expense) => (
                     <tr key={expense.id} className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                       <td className="py-4 pl-4 font-bold text-slate-500 whitespace-nowrap">
                         <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                               <Calendar size={14} />
                            </div>
                            {new Date(expense.date).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                         </div>
                       </td>
                       <td className="py-4 font-bold text-slate-700">
                         {expense.description}
                         <span className="block text-[10px] text-slate-400 uppercase font-bold mt-0.5">{expense.supplier}</span>
                       </td>
                       <td className="py-4">
                         <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                           {expense.category}
                         </span>
                       </td>
                       <td className="py-4 font-black text-slate-800">{formatCurrency(expense.amount)}</td>
                       <td className="py-4 pr-4 text-right">
                         <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenModal(expense)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                            <button onClick={() => onDeleteExpense(expense.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                         </div>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>

        {/* Charts Side */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 flex flex-col">
           <h3 className="text-lg font-black text-slate-800 mb-6">Por Categoria</h3>
           <div className="flex-1 min-h-[300px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={5}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => formatCurrency(Number(value as any))}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                 {pieData.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center text-xs">
                       <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                          <span className="font-bold text-slate-600">{entry.name}</span>
                       </div>
                       <span className="font-bold text-slate-400">{((entry.value / (totalMonth || 1)) * 100).toFixed(0)}%</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-pop border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-6 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">
                {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all hover:rotate-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-5">
                  <InputWithIcon 
                    label="Valor (R$)" 
                    icon={DollarSign} 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.amount} 
                    onChange={(e: any) => setFormData({...formData, amount: Number(e.target.value)})} 
                  />
                  <InputWithIcon 
                    label="Data" 
                    icon={Calendar} 
                    type="date" 
                    required 
                    value={formData.date} 
                    onChange={(e: any) => setFormData({...formData, date: e.target.value})} 
                  />
               </div>

               <InputWithIcon 
                 label="Descrição" 
                 icon={FileText} 
                 required 
                 placeholder="Ex: Compra de materiais de limpeza"
                 value={formData.description} 
                 onChange={(e: any) => setFormData({...formData, description: e.target.value})} 
               />

               <div className="grid grid-cols-2 gap-5">
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Categoria</label>
                    <div className="relative">
                      <select 
                        className="block w-full pl-4 pr-8 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/10 appearance-none text-sm transition-all"
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})}
                      >
                        {EXPENSE_CATEGORIES.map(cat => (
                           <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <Tag size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pagamento</label>
                    <div className="relative">
                      <select 
                        className="block w-full pl-4 pr-8 py-3 bg-slate-50 border-none rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/10 appearance-none text-sm transition-all"
                        value={formData.paymentMethod} 
                        onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                      >
                        <option value="Pix">Pix</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão Crédito">Cartão Crédito</option>
                        <option value="Cartão Débito">Cartão Débito</option>
                        <option value="Boleto">Boleto</option>
                        <option value="Transferência">Transferência</option>
                      </select>
                      <CreditCard size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                 </div>
               </div>

               <InputWithIcon 
                 label="Fornecedor / Favorecido" 
                 icon={TrendingUp} 
                 placeholder="Ex: Papelaria Silva"
                 value={formData.supplier} 
                 onChange={(e: any) => setFormData({...formData, supplier: e.target.value})} 
               />

               <div>
                 <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Observações</label>
                 <textarea 
                   className="block w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-slate-700 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-sm resize-none h-24"
                   placeholder="Detalhes adicionais..."
                   value={formData.notes}
                   onChange={e => setFormData({...formData, notes: e.target.value})}
                 />
               </div>

               <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-slate-400 font-bold hover:bg-slate-50 text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-green-600 text-white font-bold shadow-md shadow-green-100 flex items-center gap-2 text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
                  <Save size={16} />
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;