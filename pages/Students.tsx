import React, { useState } from 'react';
import { Student, AllergySeverity, Allergy } from '../types';
import { 
  Plus, Search, Filter, Edit2, Trash2, Eye, X, Save, AlertCircle, 
  User, Calendar, Weight, Ruler, Phone, Mail, MapPin, ChevronRight
} from 'lucide-react';

interface StudentsPageProps {
  students: Student[];
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudent: (s: Student) => void;
}

// --- Componente Auxiliar Minimalista ---
const InputWithIcon = ({ 
  label, icon: Icon, value, onChange, type = "text", required = false, placeholder = "", suffix = "" 
}: any) => (
  <div className="w-full">
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-300 group-focus-within:text-brand-blue transition-colors" />
      </div>
      <input
        type={type}
        required={required}
        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border-transparent rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 focus:border-transparent transition-all font-medium text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <span className="text-slate-400 font-bold text-xs">{suffix}</span>
        </div>
      )}
    </div>
  </div>
);

const StudentsPage: React.FC<StudentsPageProps> = ({ students, onAddStudent, onUpdateStudent, onDeleteStudent, onViewStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const initialFormState: Partial<Student> = {
    fullName: '',
    dateOfBirth: '',
    gender: 'M',
    heightCm: 0,
    weightKg: 0,
    guardianName: '',
    contactPhone: '',
    contactEmail: '',
    schoolClass: 'Berçário 1',
    shift: 'Matutino',
    teacherName: '',
    medical: {
      hasRestriction: false,
      allergies: [],
      intolerances: [],
      medicalNotes: '',
    }
  };
  const [formData, setFormData] = useState<Partial<Student>>(initialFormState);
  const [currentTab, setCurrentTab] = useState<'general' | 'health' | 'school'>('general');
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergySeverity, setNewAllergySeverity] = useState<AllergySeverity>(AllergySeverity.MILD);

  const filteredStudents = students.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.schoolClass.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData(JSON.parse(JSON.stringify(student))); // Deep copy
    } else {
      setEditingStudent(null);
      setFormData(initialFormState);
    }
    setCurrentTab('general');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const studentToSave = {
      ...formData,
      id: editingStudent ? editingStudent.id : crypto.randomUUID(),
    } as Student;

    if (editingStudent) {
      onUpdateStudent(studentToSave);
    } else {
      onAddStudent(studentToSave);
    }
    setIsModalOpen(false);
  };

  const addAllergy = () => {
    if (!newAllergyName) return;
    const newAllergy: Allergy = {
      id: crypto.randomUUID(),
      name: newAllergyName,
      severity: newAllergySeverity
    };
    setFormData(prev => ({
      ...prev,
      medical: {
        ...prev.medical!,
        hasRestriction: true,
        allergies: [...(prev.medical?.allergies || []), newAllergy]
      }
    }));
    setNewAllergyName('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Alunos</h2>
          <p className="text-slate-500 font-medium">Gestão de matrículas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-blue hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-200 transform hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span>Cadastrar Aluno</span>
        </button>
      </div>

      {/* Filter Bar Minimalist */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-blue transition-colors" />
          <input 
            type="text"
            placeholder="Buscar por nome ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-none shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] focus:outline-none focus:ring-2 focus:ring-brand-blue/10 text-slate-800 placeholder-slate-400 font-medium"
          />
        </div>
        <button className="px-5 py-3.5 bg-white rounded-2xl text-slate-600 hover:text-brand-blue shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex items-center gap-2 font-bold transition-colors">
          <Filter size={18} />
          <span className="hidden md:inline">Filtros</span>
        </button>
      </div>

      {/* Student List Minimalist */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div 
            key={student.id} 
            className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group border border-transparent hover:border-blue-50 relative overflow-hidden"
            onClick={() => onViewStudent(student)}
          >
            {/* Hover Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-green opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="flex items-center gap-4 mb-6">
               <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-blue font-black text-xl shadow-inner">
                 {student.fullName.charAt(0)}
               </div>
               <div>
                 <h3 className="font-bold text-lg text-slate-800 leading-tight">{student.fullName}</h3>
                 <p className="text-sm text-slate-500 font-medium mt-0.5">{student.schoolClass}</p>
               </div>
            </div>
            
            <div className="space-y-3 mb-6">
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Turno</span>
                  <span className="font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg">{student.shift}</span>
               </div>
               <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-medium">Status</span>
                  {student.medical.hasRestriction ? (
                     <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg flex items-center gap-1">
                        <AlertCircle size={12} /> Restrição
                     </span>
                  ) : (
                     <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">Regular</span>
                  )}
               </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onViewStudent(student)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-xl transition-colors">
                <Eye size={18} />
              </button>
              <button onClick={() => handleOpenModal(student)} className="p-2 text-slate-400 hover:text-brand-yellow hover:bg-yellow-50 rounded-xl transition-colors">
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDeleteStudent(student.id)} className="p-2 text-slate-400 hover:text-brand-red hover:bg-red-50 rounded-xl transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Moderno */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-50 p-6 flex justify-between items-center z-10">
              <div>
                 <h3 className="text-xl font-black text-slate-800">
                   {editingStudent ? 'Editar Perfil' : 'Novo Aluno'}
                 </h3>
                 <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Preencha os dados abaixo</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8">
              {/* Tabs Minimal */}
              <div className="flex p-1 bg-slate-50 rounded-2xl mb-8">
                {['general', 'health', 'school'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCurrentTab(tab as any)}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                      currentTab === tab 
                      ? 'bg-white text-brand-blue shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab === 'general' ? 'Geral' : tab === 'health' ? 'Saúde' : 'Escola'}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                {currentTab === 'general' && (
                  <div className="space-y-6 animate-fade-in">
                    <InputWithIcon 
                      label="Nome da Criança"
                      icon={User}
                      placeholder="Nome completo"
                      required
                      value={formData.fullName}
                      onChange={(e: any) => setFormData({...formData, fullName: e.target.value})}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputWithIcon 
                        label="Data de Nascimento"
                        icon={Calendar}
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e: any) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                      
                      <div className="w-full">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Sexo</label>
                        <div className="relative">
                          <select 
                            className="block w-full pl-4 pr-10 py-3.5 bg-slate-50 border-transparent rounded-2xl text-slate-800 font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 appearance-none"
                            value={formData.gender} 
                            onChange={e => setFormData({...formData, gender: e.target.value as 'M'|'F'})}
                          >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                             <ChevronRight size={16} className="rotate-90" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <InputWithIcon 
                        label="Peso (kg)"
                        icon={Weight}
                        type="number"
                        placeholder="0.0"
                        value={formData.weightKg}
                        onChange={(e: any) => setFormData({...formData, weightKg: Number(e.target.value)})}
                      />
                      <InputWithIcon 
                        label="Altura (cm)"
                        icon={Ruler}
                        type="number"
                        placeholder="0"
                        value={formData.heightCm}
                        onChange={(e: any) => setFormData({...formData, heightCm: Number(e.target.value)})}
                      />
                    </div>

                    <div className="pt-6">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                         Responsável
                      </h4>
                      <div className="space-y-4">
                        <InputWithIcon 
                          label="Nome"
                          icon={User}
                          required
                          placeholder="Pai, mãe ou responsável"
                          value={formData.guardianName}
                          onChange={(e: any) => setFormData({...formData, guardianName: e.target.value})}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputWithIcon 
                            label="Telefone"
                            icon={Phone}
                            required
                            placeholder="(00) 00000-0000"
                            value={formData.contactPhone}
                            onChange={(e: any) => setFormData({...formData, contactPhone: e.target.value})}
                          />
                          <InputWithIcon 
                            label="Email"
                            icon={Mail}
                            type="email"
                            placeholder="exemplo@email.com"
                            value={formData.contactEmail}
                            onChange={(e: any) => setFormData({...formData, contactEmail: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'health' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-red-50 p-6 rounded-3xl">
                      <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2">
                        <AlertCircle size={20}/> Restrições Alimentares
                      </h4>
                      <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          placeholder="Adicionar alergia..." 
                          className="flex-1 p-3.5 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-200 placeholder-red-300 text-red-900"
                          value={newAllergyName}
                          onChange={(e) => setNewAllergyName(e.target.value)}
                        />
                        <select 
                          className="p-3.5 bg-white border-none rounded-2xl text-sm outline-none focus:ring-2 focus:ring-red-200 text-red-900 font-bold"
                          value={newAllergySeverity}
                          onChange={(e) => setNewAllergySeverity(e.target.value as AllergySeverity)}
                        >
                          <option value={AllergySeverity.MILD}>Leve</option>
                          <option value={AllergySeverity.MODERATE}>Moderada</option>
                          <option value={AllergySeverity.SEVERE}>Grave</option>
                        </select>
                        <button type="button" onClick={addAllergy} className="bg-red-500 text-white w-12 rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-200">
                          <Plus size={20} />
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.medical?.allergies.map((allergy, idx) => (
                          <span key={idx} className="bg-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 text-red-700">
                             {allergy.name} <span className="opacity-50">•</span> {allergy.severity}
                             <button type="button" onClick={() => {
                               const newAllergies = formData.medical!.allergies.filter((_, i) => i !== idx);
                               setFormData(prev => ({...prev, medical: {...prev.medical!, allergies: newAllergies, hasRestriction: newAllergies.length > 0}}));
                             }} className="hover:bg-red-50 rounded-full p-1 transition-colors">
                                <X size={12} />
                             </button>
                          </span>
                        ))}
                        {formData.medical?.allergies.length === 0 && <span className="text-sm text-red-400 font-medium opacity-60">Nenhuma restrição registrada.</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Observações Gerais</label>
                      <textarea className="w-full p-4 bg-slate-50 border-transparent rounded-2xl outline-none h-32 resize-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm font-medium text-slate-700" 
                        placeholder="Detalhes médicos ou nutricionais..."
                        value={formData.medical?.medicalNotes}
                        onChange={(e) => setFormData({
                          ...formData, 
                          medical: {...formData.medical!, medicalNotes: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                )}

                {currentTab === 'school' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Turma</label>
                      <div className="relative">
                         <select className="w-full p-3.5 pl-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 appearance-none font-medium text-slate-800"
                            value={formData.schoolClass} onChange={e => setFormData({...formData, schoolClass: e.target.value})}>
                            <option value="Berçário 1">Berçário 1</option>
                            <option value="Berçário 2">Berçário 2</option>
                            <option value="Maternal 1">Maternal 1</option>
                            <option value="Maternal 2">Maternal 2</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <ChevronRight size={16} className="rotate-90" />
                         </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2 ml-1">Turno</label>
                      <div className="relative">
                        <select className="w-full p-3.5 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 appearance-none font-medium text-slate-800"
                           value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})}>
                          <option value="Matutino">Matutino</option>
                          <option value="Vespertino">Vespertino</option>
                          <option value="Integral">Integral</option>
                        </select>
                         <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <ChevronRight size={16} className="rotate-90" />
                         </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                       <InputWithIcon 
                          label="Professor(a)"
                          icon={User}
                          placeholder="Nome do professor responsável"
                          value={formData.teacherName}
                          onChange={(e: any) => setFormData({...formData, teacherName: e.target.value})}
                       />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-8 py-3 rounded-2xl bg-brand-green hover:bg-green-600 text-white font-bold shadow-lg shadow-green-200 flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
                  <Save size={18} />
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

export default StudentsPage;