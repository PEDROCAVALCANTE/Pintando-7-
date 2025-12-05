import React, { useState } from 'react';
import { Student, AllergySeverity, Allergy } from '../types';
import { 
  Plus, Search, Filter, Edit2, Trash2, Eye, X, Save, AlertCircle, 
  User, Calendar, Weight, Ruler, Phone, Mail, ChevronRight
} from 'lucide-react';

interface StudentsPageProps {
  students: Student[];
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudent: (s: Student) => void;
}

// Minimalist Input Component
const InputWithIcon = ({ 
  label, icon: Icon, value, onChange, type = "text", required = false, placeholder = "", suffix = "" 
}: any) => (
  <div className="w-full">
    <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-stone-300 group-focus-within:text-brand-blue transition-colors duration-300" />
      </div>
      <input
        type={type}
        required={required}
        className="block w-full pl-11 pr-4 py-3 bg-stone-50 border-none rounded-xl text-stone-700 placeholder-stone-300 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all duration-300 font-semibold text-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
          <span className="text-stone-400 font-bold text-xs">{suffix}</span>
        </div>
      )}
    </div>
  </div>
);

const StudentsPage: React.FC<StudentsPageProps> = ({ students, onAddStudent, onUpdateStudent, onDeleteStudent, onViewStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

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
      setFormData(JSON.parse(JSON.stringify(student)));
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h2 className="text-3xl font-black text-stone-800 tracking-tight">Alunos</h2>
          <p className="text-stone-400 font-medium">Gestão de matrículas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all duration-300 shadow-md shadow-blue-100 text-sm hover:shadow-lg hover:scale-105 active:scale-95"
        >
          <Plus size={18} />
          <span>Novo Aluno</span>
        </button>
      </div>

      <div className="flex gap-4 items-center animate-fade-in" style={{ animationDelay: '100ms' }}>
        <div className="flex-1 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-4 h-4 group-focus-within:text-brand-blue transition-colors duration-300" />
          <input 
            type="text"
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-stone-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/10 text-stone-700 placeholder-stone-300 font-medium text-sm transition-all duration-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id} 
            className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm hover:shadow-lg hover:shadow-stone-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden opacity-0 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => onViewStudent(student)}
          >
            <div className="flex flex-col items-center text-center">
               <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center text-brand-blue font-black text-2xl mb-4 border-2 border-white shadow-sm group-hover:scale-110 transition-transform duration-500 ease-out">
                 {student.fullName.charAt(0)}
               </div>
               <h3 className="font-bold text-base text-stone-800 leading-tight mb-1">{student.fullName}</h3>
               <p className="text-xs text-stone-400 font-bold uppercase tracking-wide bg-stone-50 px-3 py-1 rounded-full">{student.schoolClass}</p>
            </div>
            
            <div className="mt-6 flex justify-between items-center border-t border-stone-50 pt-4">
               {student.medical.hasRestriction ? (
                  <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-bold uppercase bg-red-50 px-2 py-1 rounded-lg">
                    <AlertCircle size={12} />
                    <span>Restrição</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase bg-green-50 px-2 py-1 rounded-lg">
                    <span>Regular</span>
                  </div>
               )}
               
               <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button onClick={(e) => {e.stopPropagation(); handleOpenModal(student);}} className="p-1.5 text-stone-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={(e) => {e.stopPropagation(); onDeleteStudent(student.id);}} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-pop border border-stone-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-8 py-6 border-b border-stone-50 flex justify-between items-center">
              <div>
                 <h3 className="text-lg font-black text-stone-800">
                   {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
                 </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-stone-50 p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all hover:rotate-90">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8">
              <div className="flex p-1 bg-stone-50 rounded-xl mb-8 w-fit mx-auto">
                {['general', 'health', 'school'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCurrentTab(tab as any)}
                    className={`px-6 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                      currentTab === tab 
                      ? 'bg-white text-stone-800 shadow-sm scale-105' 
                      : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {tab === 'general' ? 'Geral' : tab === 'health' ? 'Saúde' : 'Escola'}
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                {currentTab === 'general' && (
                  <div className="space-y-5 animate-fade-in">
                    <InputWithIcon 
                      label="Nome Completo"
                      icon={User}
                      required
                      value={formData.fullName}
                      onChange={(e: any) => setFormData({...formData, fullName: e.target.value})}
                    />

                    <div className="grid grid-cols-2 gap-5">
                      <InputWithIcon 
                        label="Nascimento"
                        icon={Calendar}
                        type="date"
                        required
                        value={formData.dateOfBirth}
                        onChange={(e: any) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                      <div className="w-full">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Sexo</label>
                        <div className="relative">
                          <select 
                            className="block w-full pl-4 pr-8 py-3 bg-stone-50 border-none rounded-xl text-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/10 appearance-none text-sm transition-all"
                            value={formData.gender} 
                            onChange={e => setFormData({...formData, gender: e.target.value as 'M'|'F'})}
                          >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </select>
                          <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 rotate-90 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                      <InputWithIcon label="Peso (kg)" icon={Weight} type="number" value={formData.weightKg} onChange={(e: any) => setFormData({...formData, weightKg: Number(e.target.value)})} />
                      <InputWithIcon label="Altura (cm)" icon={Ruler} type="number" value={formData.heightCm} onChange={(e: any) => setFormData({...formData, heightCm: Number(e.target.value)})} />
                    </div>

                    <div className="border-t border-stone-50 pt-4">
                      <InputWithIcon label="Responsável" icon={User} required value={formData.guardianName} onChange={(e: any) => setFormData({...formData, guardianName: e.target.value})} />
                    </div>
                  </div>
                )}

                {currentTab === 'health' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="bg-red-50/50 p-6 rounded-2xl border border-red-50">
                      <h4 className="font-bold text-red-800 mb-4 flex items-center gap-2 text-sm">
                        <AlertCircle size={18}/> Restrições
                      </h4>
                      <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          placeholder="Nova alergia..." 
                          className="flex-1 px-4 py-2 bg-white border-none rounded-xl text-sm outline-none text-stone-700 placeholder-stone-300 focus:ring-2 focus:ring-red-100 transition-all"
                          value={newAllergyName}
                          onChange={(e) => setNewAllergyName(e.target.value)}
                        />
                         <select 
                          className="px-4 py-2 bg-white border-none rounded-xl text-xs outline-none font-bold text-stone-600 focus:ring-2 focus:ring-red-100 transition-all"
                          value={newAllergySeverity}
                          onChange={(e) => setNewAllergySeverity(e.target.value as AllergySeverity)}
                        >
                          <option value={AllergySeverity.MILD}>Leve</option>
                          <option value={AllergySeverity.MODERATE}>Moderada</option>
                          <option value={AllergySeverity.SEVERE}>Grave</option>
                        </select>
                        <button type="button" onClick={addAllergy} className="bg-red-500 text-white w-10 rounded-xl flex items-center justify-center hover:bg-red-600 shadow-sm hover:scale-105 active:scale-95 transition-all">
                          <Plus size={18} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.medical?.allergies.map((allergy, idx) => (
                          <span key={idx} className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 text-red-600 border border-red-100 animate-pop">
                             {allergy.name}
                             <button type="button" onClick={() => {
                               const newAllergies = formData.medical!.allergies.filter((_, i) => i !== idx);
                               setFormData(prev => ({...prev, medical: {...prev.medical!, allergies: newAllergies, hasRestriction: newAllergies.length > 0}}));
                             }} className="hover:bg-red-50 rounded-full p-0.5 transition-colors">
                                <X size={12} />
                             </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentTab === 'school' && (
                  <div className="space-y-5 animate-fade-in">
                     <div className="w-full">
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Turma</label>
                         <select className="block w-full px-4 py-3 bg-stone-50 border-none rounded-xl text-stone-700 font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/10 transition-all text-sm"
                            value={formData.schoolClass} onChange={e => setFormData({...formData, schoolClass: e.target.value})}>
                            <option value="Berçário 1">Berçário 1</option>
                            <option value="Berçário 2">Berçário 2</option>
                            <option value="Maternal 1">Maternal 1</option>
                            <option value="Maternal 2">Maternal 2</option>
                         </select>
                     </div>
                     <InputWithIcon label="Professor" icon={User} value={formData.teacherName} onChange={(e: any) => setFormData({...formData, teacherName: e.target.value})} />
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-stone-50">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-stone-400 font-bold hover:bg-stone-50 text-sm transition-colors">
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

export default StudentsPage;