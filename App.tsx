import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, Student, MealLog, Appointment, WeeklyGoal } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import NutritionPanel from './pages/NutritionPanel';
import { Palette, Lock, Loader2, UserPlus, LogIn, Bell, ArrowRight } from 'lucide-react';
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
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  addLog: (l: MealLog) => void;
  addAppointment: (a: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addGoal: (g: WeeklyGoal) => void;
  toggleGoal: (id: string, status: boolean) => void;
  deleteGoal: (id: string) => void;
}
const DataContext = createContext<DataContextType>({} as DataContextType);

// --- Toast Notification ---
const NotificationToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-6 right-6 z-50 bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] rounded-2xl p-4 animate-fade-in flex items-start gap-4 max-w-sm border border-slate-50">
    <div className="bg-brand-blue/10 p-2.5 rounded-xl text-brand-blue shrink-0">
      <Bell size={20} />
    </div>
    <div className="flex-1 pt-0.5">
      <h4 className="font-bold text-slate-800 text-sm mb-1">Nova Notificação</h4>
      <p className="text-slate-500 text-xs leading-relaxed">{message}</p>
    </div>
    <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-colors text-xl leading-none">×</button>
  </div>
);

// --- Login Page Minimalist ---
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Mesh Gradient (Sutil) */}
       <div className="absolute inset-0 z-0 bg-white">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 rounded-full blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-100/40 rounded-full blur-[80px]" />
       </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] p-8 w-full max-w-[360px] text-center border border-white relative z-10 animate-fade-in-up">
        
        {/* Logo Minimal */}
        <div className="mb-6">
           <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-yellow/10 mb-3 text-brand-brown">
             <Palette size={24} />
           </div>
           <h1 className="font-display text-2xl font-black mb-1 text-slate-800">
             <span className="text-brand-red">P</span>
             <span className="text-brand-green">int</span>
             <span className="text-brand-blue">and</span>
             <span className="text-brand-pink">o</span>
             <span className="text-brand-red ml-1">7</span>
           </h1>
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Bem-vindo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-left">
          <div>
            <input 
              type="text" 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-sm text-slate-800 placeholder-slate-400"
              placeholder={isRegistering ? "Seu melhor email" : "Email ou usuário"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-brand-blue/10 transition-all font-medium text-sm text-slate-800 placeholder-slate-400"
              placeholder="Sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl flex items-center justify-center gap-2 font-bold animate-shake">
               {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-200 transition-all transform hover:-translate-y-0.5 active:scale-95 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : isRegistering ? 'Criar Conta' : 'Entrar'} { !loading && <ArrowRight size={16} />}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="mt-6 text-[10px] text-slate-400 font-bold hover:text-slate-600 uppercase tracking-wider transition-colors"
        >
          {isRegistering ? 'Já possui conta? Fazer Login' : 'Não tem acesso? Cadastre-se'}
        </button>
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

    return () => {
      unsubStudents();
      unsubLogs();
      unsubApts();
      unsubGoals();
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

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSelectedStudent(null);
  };

  if (loading) {
     return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800">
           <Loader2 size={48} className="animate-spin mb-6 text-brand-blue" />
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
        students, logs, appointments, goals,
        addStudent, updateStudent, deleteStudent, addLog,
        addAppointment, deleteAppointment, addGoal, toggleGoal, deleteGoal
      }}>
        {notificationMsg && <NotificationToast message={notificationMsg} onClose={() => setNotificationMsg(null)} />}
        <Layout activePage={selectedStudent ? 'students' : activePage} onNavigate={handleNavigate}>
          
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
            </>
          )}

        </Layout>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}