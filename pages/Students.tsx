
import React, { useState } from 'react';
import { Student, AllergySeverity, Allergy } from '../types';
import { 
  Plus, Search, Filter, Edit2, Trash2, Eye, X, Save, AlertCircle, 
  User, Calendar, Weight, Ruler, Phone, Mail, Users, MapPin 
} from 'lucide-react';

interface StudentsPageProps {
  students: Student[];
  onAddStudent: (s: Student) => void;
  onUpdateStudent: (s: Student) => void;
  onDeleteStudent: (id: string) => void;
  onViewStudent: (s: Student) => void;
}

// --- Componente Auxiliar (Movido para fora para evitar re-renderização e perda de foco) ---
const InputWithIcon = ({ 
  label, icon: Icon, value, onChange, type = "text", required = false, placeholder = "", suffix = "" 
}: any) => (
  <div className="w-full">
    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
      </div>
      <input
        type={type}
        required={required}
        className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all sm:text-sm shadow-sm"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {suffix && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <span className="text-slate-400 font-medium text-xs">{suffix}</span>
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Alunos Cadastrados</h2>
          <p className="text-slate-500">Gerencie matrículas e perfis de saúde</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-brand-blue hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus size={20} />
          <span>Novo Aluno</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Buscar por nome ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
          />
        </div>
        <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Filter size={18} />
          <span className="hidden md:inline">Filtros</span>
        </button>
      </div>

      {/* Student List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map(student => (
          <div 
            key={student.id} 
            className="bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden group cursor-pointer"
            onClick={() => onViewStudent(student)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-12 h-12 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-lg">
                     {student.fullName.charAt(0)}
                   </div>
                   <div>
                     <h3 className="font-bold text-slate-800 group-hover:text-brand-blue transition-colors">{student.fullName}</h3>
                     <p className="text-xs text-slate-500">{student.schoolClass}</p>
                   </div>
                 </div>
                 {student.medical.hasRestriction && (
                   <span className="bg-red-50 text-red-600 px-2 py-1 rounded-md text-xs font-bold border border-red-100 flex items-center gap-1">
                     <AlertCircle size={12} />
                     Restrições
                   </span>
                 )}
              </div>
              
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <div className="flex justify-between">
                  <span>Responsável:</span>
                  <span className="font-medium text-slate-800">{student.guardianName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Turno:</span>
                  <span className="font-medium text-slate-800">{student.shift}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => onViewStudent(student)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors" title="Ver Perfil">
                  <Eye size={18} />
                </button>
                <button onClick={() => handleOpenModal(student)} className="p-2 text-slate-400 hover:text-brand-yellow hover:bg-yellow-50 rounded-lg transition-colors" title="Editar">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => onDeleteStudent(student.id)} className="p-2 text-slate-400 hover:text-brand-red hover:bg-red-50 rounded-lg transition-colors" title="Remover">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
              <h3 className="text-xl font-bold text-slate-800">
                {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
                {['general', 'health', 'school'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setCurrentTab(tab as any)}
                    className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${
                      currentTab === tab ? 'bg-white text-brand-blue shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab === 'general' ? 'Dados Gerais' : tab === 'health' ? 'Saúde & Nutrição' : 'Escola'}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                {currentTab === 'general' && (
                  <div className="space-y-6">
                    <InputWithIcon 
                      label="Nome Completo da Criança"
                      icon={User}
                      placeholder="Ex: João Silva"
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
                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Sexo</label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Users className="h-5 w-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
                          </div>
                          <select 
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all sm:text-sm shadow-sm appearance-none"
                            value={formData.gender} 
                            onChange={e => setFormData({...formData, gender: e.target.value as 'M'|'F'})}
                          >
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <InputWithIcon 
                        label="Peso"
                        icon={Weight}
                        type="number"
                        placeholder="0.0"
                        suffix="kg"
                        value={formData.weightKg}
                        onChange={(e: any) => setFormData({...formData, weightKg: Number(e.target.value)})}
                      />
                      <InputWithIcon 
                        label="Altura"
                        icon={Ruler}
                        type="number"
                        placeholder="0"
                        suffix="cm"
                        value={formData.heightCm}
                        onChange={(e: any) => setFormData({...formData, heightCm: Number(e.target.value)})}
                      />
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-2">
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                         <Users size={18} className="text-brand-yellow"/> Dados do Responsável
                      </h4>
                      <div className="space-y-4">
                        <InputWithIcon 
                          label="Nome do Responsável"
                          icon={User}
                          required
                          placeholder="Nome do pai, mãe ou responsável"
                          value={formData.guardianName}
                          onChange={(e: any) => setFormData({...formData, guardianName: e.target.value})}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <InputWithIcon 
                            label="Telefone / WhatsApp"
                            icon={Phone}
                            required
                            placeholder="(00) 00000-0000"
                            value={formData.contactPhone}
                            onChange={(e: any) => setFormData({...formData, contactPhone: e.target.value})}
                          />
                          <InputWithIcon 
                            label="Email de Contato"
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
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                      <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                        <AlertCircle size={18}/> Alergias & Restrições
                      </h4>
                      <div className="flex gap-2 mb-4">
                        <input 
                          type="text" 
                          placeholder="Nome da Alergia (ex: Amendoim)" 
                          className="flex-1 p-3 border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-200"
                          value={newAllergyName}
                          onChange={(e) => setNewAllergyName(e.target.value)}
                        />
                        <select 
                          className="p-3 border border-red-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-red-200"
                          value={newAllergySeverity}
                          onChange={(e) => setNewAllergySeverity(e.target.value as AllergySeverity)}
                        >
                          <option value={AllergySeverity.MILD}>Leve</option>
                          <option value={AllergySeverity.MODERATE}>Moderada</option>
                          <option value={AllergySeverity.SEVERE}>Grave</option>
                        </select>
                        <button type="button" onClick={addAllergy} className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-red-600 font-bold shadow-lg shadow-red-200 transition-all">
                          Adicionar
                        </button>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.medical?.allergies.map((allergy, idx) => (
                          <span key={idx} className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-2 ${
                            allergy.severity === AllergySeverity.SEVERE 
                              ? 'bg-red-100 text-red-700 border-red-200' 
                              : allergy.severity === AllergySeverity.MODERATE 
                                ? 'bg-orange-100 text-orange-700 border-orange-200' 
                                : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                             {allergy.name} ({allergy.severity})
                             <button type="button" onClick={() => {
                               const newAllergies = formData.medical!.allergies.filter((_, i) => i !== idx);
                               setFormData(prev => ({...prev, medical: {...prev.medical!, allergies: newAllergies, hasRestriction: newAllergies.length > 0}}));
                             }}>
                                <X size={14} />
                             </button>
                          </span>
                        ))}
                        {formData.medical?.allergies.length === 0 && <span className="text-sm text-slate-400 italic">Nenhuma alergia cadastrada.</span>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Observações Médicas / Nutricionais</label>
                      <textarea className="w-full p-4 border border-slate-200 rounded-xl outline-none h-32 resize-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all" 
                        placeholder="Descreva detalhes importantes sobre a saúde ou alimentação..."
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Turma</label>
                      <div className="relative">
                         <select className="w-full p-3 pl-4 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all appearance-none"
                            value={formData.schoolClass} onChange={e => setFormData({...formData, schoolClass: e.target.value})}>
                            <option value="Berçário 1">Berçário 1</option>
                            <option value="Berçário 2">Berçário 2</option>
                            <option value="Maternal 1">Maternal 1</option>
                            <option value="Maternal 2">Maternal 2</option>
                         </select>
                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <MapPin size={18} />
                         </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Turno</label>
                      <select className="w-full p-3 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-all"
                         value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value as any})}>
                        <option value="Matutino">Matutino</option>
                        <option value="Vespertino">Vespertino</option>
                        <option value="Integral">Integral</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                       <InputWithIcon 
                          label="Professor Responsável"
                          icon={User}
                          placeholder="Nome do professor(a)"
                          value={formData.teacherName}
                          onChange={(e: any) => setFormData({...formData, teacherName: e.target.value})}
                       />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Buttons */}
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" className="px-8 py-3 rounded-xl bg-brand-green hover:bg-green-600 text-white font-bold shadow-lg shadow-green-200 flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
                  <Save size={18} />
                  Salvar Dados
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
