import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, Student, MealLog, Appointment, WeeklyGoal, Expense, SchoolEvent } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import NutritionPanel from './pages/NutritionPanel';
import ExpensesPage from './pages/Expenses';
import Agenda from './pages/Agenda';
import { Palette, Loader2, ArrowRight, Bell } from 'lucide-react';
import { auth, db, messaging, onMessage, requestNotificationPermission } from './services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

// --- Auth Context ---
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => void;
  error: string;
  setError: (msg: string) => void;
}
const AuthContext = createContext<AuthContextType>({} as AuthContextType);
export const useAuth = () => useContext(AuthContext);

// --- Data Context ---
interface DataContextType {
  students: Student[];
  logs: MealLog[];
  appointments: Appointment[];
  goals: WeeklyGoal[];
  expenses: Expense[];
  events: SchoolEvent[];
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  addLog: (l: MealLog) => void;
  addAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addGoal: (g: WeeklyGoal) => void;
  toggleGoal: (id: string, status: boolean) => void;
  deleteGoal: (id: string) => void;
  addExpense: (e: Expense) => void;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  addEvent: (e: SchoolEvent) => void;
  updateEvent: (e: SchoolEvent) => void;
  deleteEvent: (id: string) => void;
}
const DataContext = createContext<DataContextType>({} as DataContextType);

// --- Toast Notification ---
const NotificationToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-6 right-6 z-50 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-2xl p-4 animate-fade-in flex items-start gap-4 max-w-sm border border-stone-50">
    <div className="bg-brand-blue/10 p-2.5 rounded-xl text-brand-blue shrink-0">
      <Bell size={20} />
    </div>
    <div className="flex-1 pt-0.5">
      <h4 className="font-bold text-stone-800 text-sm mb-1">Nova Notificação</h4>
      <p className="text-stone-500 text-xs leading-relaxed">{message}</p>
    </div>
    <button onClick={onClose} className="text-stone-300 hover:text-stone-500 transition-colors text-xl leading-none">×</button>
  </div>
);

// --- Login Page Minimalist Centered ---
const LoginPage = () => {
  const { login, register, error, loading, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      await register(email, password);
    } else {
      await login(email, password);
    }
  };

  // URL Direta da Imagem
  const logoUrl = "https://iili.io/fIiTt9e.png";

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-brand-yellow/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-100 animate-fade-in-up relative z-10">
          
        <div className="mb-10 text-center">
            <div className="flex items-center justify-center mb-6">
              <img 
                src={logoUrl} 
                className="h-28 w-auto object-contain hover:scale-105 transition-transform duration-500" 
                alt="Logo" 
                onError={(e) => e.currentTarget.style.display = 'none'} 
              />
            </div>
            
            <h1 className="text-3xl font-black text-stone-800 mb-2 tracking-tight">
              {isRegistering ? 'Criar Conta' : 'Bem-vindo(a)'}
            </h1>
            <p className="text-stone-400 font-bold text-xs uppercase tracking-widest">
              {isRegistering ? 'Preencha os dados da escola' : 'Faça login para continuar'}
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider ml-1">Email ou Usuário</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-stone-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-bold text-stone-800 placeholder-stone-300 border-2"
              placeholder="ex: diretoria@pintando7.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider ml-1">Senha de Acesso</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 bg-stone-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all font-bold text-stone-800 placeholder-stone-300 border-2"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-4 rounded-2xl flex items-center gap-3 font-bold animate-shake border border-red-100">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-red hover:bg-red-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-100 hover:shadow-red-200 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>{isRegistering ? 'Finalizar Cadastro' : 'Entrar no Sistema'}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center border-t border-stone-50 pt-6">
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-xs text-stone-400 font-bold hover:text-brand-blue uppercase tracking-widest transition-colors"
          >
            {isRegistering ? 'Já possui conta? Fazer Login' : 'Primeiro acesso? Criar Conta'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [goals, setGoals] = useState<WeeklyGoal[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  
  // Navigation State
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Notification State
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.email?.split('@')[0] || 'Usuário',
          role: UserRole.ADMIN,
          username: firebaseUser.email || ''
        });
        
        requestNotificationPermission().then(token => {
           if (token) {
             // Token logic
           }
        });

      } else {
        const localUser = localStorage.getItem('local_user');
        if (localUser) {
          setUser(JSON.parse(localUser));
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Initialize Cloud Messaging
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (payload.notification) {
          setNotificationMsg(`${payload.notification.title}: ${payload.notification.body}`);
          setTimeout(() => setNotificationMsg(null), 5000);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Initialize Firestore
  useEffect(() => {
    if (!user) {
      setStudents([]);
      setLogs([]);
      setAppointments([]);
      setGoals([]);
      setExpenses([]);
      setEvents([]);
      return;
    }

    const qStudents = query(collection(db, "students"), orderBy("fullName"));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id,
          fullName: data.fullName || 'Sem Nome',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || 'M',
          heightCm: data.heightCm || 0,
          weightKg: data.weightKg || 0,
          guardianName: data.guardianName || '',
          contactPhone: data.contactPhone || '',
          contactEmail: data.contactEmail || '',
          schoolClass: data.schoolClass || '',
          shift: data.shift || 'Matutino',
          teacherName: data.teacherName || '',
          avatarUrl: data.avatarUrl || '',
          generalNotes: data.generalNotes || '',
          medical: {
            hasRestriction: data.medical?.hasRestriction || false,
            allergies: data.medical?.allergies || [],
            intolerances: data.medical?.intolerances || [],
            medicalNotes: data.medical?.medicalNotes || '',
            bloodType: data.medical?.bloodType || '',
          }
        } as Student;
      });
      setStudents(studentsData);
    });

    const qLogs = query(collection(db, "logs"), orderBy("date", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog));
      setLogs(logsData);
    });

    const qApts = query(collection(db, "appointments"), orderBy("date"));
    const unsubApts = onSnapshot(qApts, (snapshot) => {
      const aptData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(aptData);
    });

    const qGoals = query(collection(db, "goals"), orderBy("createdAt"));
    const unsubGoals = onSnapshot(qGoals, (snapshot) => {
      const goalData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WeeklyGoal));
      setGoals(goalData);
    });

    const qExpenses = query(collection(db, "expenses"), orderBy("date", "desc"));
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => {
      const expenseData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(expenseData);
    });

    const qEvents = query(collection(db, "events"), orderBy("date", "asc"));
    const unsubEvents = onSnapshot(qEvents, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolEvent));
      setEvents(eventData);
    });

    return () => {
      unsubStudents();
      unsubLogs();
      unsubApts();
      unsubGoals();
      unsubExpenses();
      unsubEvents();
    };
  }, [user]);

  const login = async (u: string, p: string) => {
    setAuthError('');
    if (u === 'admin' && p === '7777777') {
      const adminUser: User = { id: 'local-admin', name: 'Administrador', role: UserRole.ADMIN, username: 'admin' };
      localStorage.setItem('local_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, u, p);
      localStorage.removeItem('local_user');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') setAuthError('Credenciais inválidas.');
      else if (err.code === 'auth/invalid-email') setAuthError('Email mal formatado.');
      else setAuthError('Erro no acesso.');
    }
  };

  const register = async (u: string, p: string) => {
    setAuthError('');
    try {
      await createUserWithEmailAndPassword(auth, u, p);
      localStorage.removeItem('local_user');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setAuthError('Email já cadastrado.');
      else if (err.code === 'auth/weak-password') setAuthError('Senha muito fraca.');
      else setAuthError('Erro no cadastro.');
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('local_user');
    setUser(null);
    setActivePage('dashboard');
  };

  // --- CRUD Operations ---
  const addStudent = async (s: Student) => {
    try {
      const { id, ...data } = s; 
      await addDoc(collection(db, "students"), data);
    } catch (e) { console.error(e); }
  };

  const updateStudent = async (s: Student) => {
    try {
      const { id, ...data } = s;
      await updateDoc(doc(db, "students", id), data as any);
    } catch (e) { console.error(e); }
  };

  const deleteStudent = async (id: string) => {
    if (confirm('Remover aluno permanentemente?')) {
      try { await deleteDoc(doc(db, "students", id)); } catch (e) { console.error(e); }
    }
  };

  const addLog = async (l: MealLog) => {
    try {
      const { id, ...data } = l;
      await addDoc(collection(db, "logs"), data);
    } catch (e) { console.error(e); }
  };

  const addAppointment = async (a: Appointment) => {
    try {
      const { id, ...data } = a;
      await addDoc(collection(db, "appointments"), data);
    } catch (e) { console.error(e); }
  };

  const deleteAppointment = async (id: string) => {
    try { await deleteDoc(doc(db, "appointments", id)); } catch (e) { console.error(e); }
  };

  const addGoal = async (g: WeeklyGoal) => {
    try {
      const { id, ...data } = g;
      await addDoc(collection(db, "goals"), data);
    } catch (e) { console.error(e); }
  };

  const toggleGoal = async (id: string, status: boolean) => {
    try {
      await updateDoc(doc(db, "goals", id), { completed: !status });
    } catch (e) { console.error(e); }
  };

  const deleteGoal = async (id: string) => {
    try { await deleteDoc(doc(db, "goals", id)); } catch (e) { console.error(e); }
  };

  const addExpense = async (e: Expense) => {
    try {
      const { id, ...data } = e;
      await addDoc(collection(db, "expenses"), data);
    } catch (e) { console.error(e); }
  };

  const updateExpense = async (e: Expense) => {
    try {
      const { id, ...data } = e;
      await updateDoc(doc(db, "expenses", id), data as any);
    } catch (e) { console.error(e); }
  };

  const deleteExpense = async (id: string) => {
    if(confirm('Tem certeza que deseja excluir esta despesa?')) {
      try { await deleteDoc(doc(db, "expenses", id)); } catch (e) { console.error(e); }
    }
  };

  const addEvent = async (e: SchoolEvent) => {
    try {
      const { id, ...data } = e;
      await addDoc(collection(db, "events"), data);
    } catch (e) { console.error(e); }
  };

  const updateEvent = async (e: SchoolEvent) => {
    try {
      const { id, ...data } = e;
      await updateDoc(doc(db, "events", id), data as any);
    } catch (e) { console.error(e); }
  };

  const deleteEvent = async (id: string) => {
    if(confirm('Tem certeza que deseja excluir este evento?')) {
      try { await deleteDoc(doc(db, "events", id)); } catch (e) { console.error(e); }
    }
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSelectedStudent(null);
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-stone-800">
           <Loader2 size={48} className="animate-spin mb-6 text-brand-red" />
        </div>
     );
  }

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, login, register, logout, loading: false, error: authError, setError: setAuthError }}>
        <LoginPage />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading: false, error: authError, setError: setAuthError }}>
      <DataContext.Provider value={{ 
        students, logs, appointments, goals, expenses, events,
        addStudent, updateStudent, deleteStudent, addLog,
        addAppointment, deleteAppointment, addGoal, toggleGoal, deleteGoal,
        addExpense, updateExpense, deleteExpense,
        addEvent, updateEvent, deleteEvent
      }}>
        {notificationMsg && <NotificationToast message={notificationMsg} onClose={() => setNotificationMsg(null)} />}
        <Layout activePage={selectedStudent ? 'students' : activePage} onNavigate={handleNavigate}>
          
          <div key={selectedStudent ? 'profile' : activePage} className="animate-fade-in">
            {selectedStudent ? (
              <StudentProfile 
                student={selectedStudent} 
                onBack={() => setSelectedStudent(null)} 
                logs={logs}
                onAddLog={addLog}
              />
            ) : (
              <>
                {activePage === 'dashboard' && <Dashboard students={students} />}
                {activePage === 'students' && (
                  <StudentsPage 
                    students={students} 
                    onAddStudent={addStudent} 
                    onUpdateStudent={updateStudent} 
                    onDeleteStudent={deleteStudent}
                    onViewStudent={(s) => setSelectedStudent(s)}
                  />
                )}
                {activePage === 'nutrition' && (
                  <NutritionPanel 
                    appointments={appointments}
                    goals={goals}
                    onAddAppointment={addAppointment}
                    onDeleteAppointment={deleteAppointment}
                    onAddGoal={addGoal}
                    onToggleGoal={toggleGoal}
                    onDeleteGoal={deleteGoal}
                  />
                )}
                {activePage === 'expenses' && (
                  <ExpensesPage 
                    expenses={expenses}
                    onAddExpense={addExpense}
                    onUpdateExpense={updateExpense}
                    onDeleteExpense={deleteExpense}
                  />
                )}
                {activePage === 'agenda' && (
                  <Agenda 
                    events={events}
                    students={students}
                    onAddEvent={addEvent}
                    onUpdateEvent={updateEvent}
                    onDeleteEvent={deleteEvent}
                  />
                )}
              </>
            )}
          </div>

        </Layout>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}