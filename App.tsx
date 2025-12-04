
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, Student, MealLog, AllergySeverity, Appointment, WeeklyGoal } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/Students';
import StudentProfile from './pages/StudentProfile';
import NutritionPanel from './pages/NutritionPanel';
import { Palette, Lock, Loader2, UserPlus, LogIn, Bell } from 'lucide-react';
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

// --- Toast Notification Component ---
const NotificationToast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-4 right-4 z-50 bg-white border-l-4 border-brand-blue shadow-xl rounded-lg p-4 animate-fade-in flex items-start gap-3 max-w-sm">
    <div className="bg-blue-100 p-2 rounded-full text-brand-blue">
      <Bell size={20} />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-slate-800 text-sm">Nova Notificação</h4>
      <p className="text-slate-600 text-sm mt-1">{message}</p>
    </div>
    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
  </div>
);

// --- Login Page Component ---
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
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-4 overflow-hidden relative">
       {/* Background Animation Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-10 left-10 w-32 h-32 bg-brand-yellow/20 rounded-full blur-2xl animate-float"></div>
         <div className="absolute bottom-20 right-20 w-48 h-48 bg-brand-red/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
         <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-green/10 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-md text-center border border-white/50 relative z-10 animate-fade-in-up">
        {/* Animated Logo Area */}
        <div className="mb-6 relative group cursor-default">
           <div className="w-24 h-24 bg-gradient-to-tr from-brand-yellow to-yellow-300 rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-white transition-transform group-hover:scale-110 duration-300">
             <Palette className="w-12 h-12 text-white drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
           </div>
           <div className="absolute -bottom-2 right-[35%] bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm animate-bounce">
              v1.0
           </div>
        </div>

        {/* Tipografia "Pintando 7" colorida */}
        <h1 className="font-display text-4xl md:text-5xl font-black mb-2 drop-shadow-sm" style={{ textShadow: '2px 2px 0px #fff' }}>
           <span className="text-brand-red inline-block hover:-translate-y-1 transition-transform">P</span>
           <span className="text-brand-green inline-block hover:-translate-y-1 transition-transform delay-75">int</span>
           <span className="text-brand-blue inline-block hover:-translate-y-1 transition-transform delay-100">and</span>
           <span className="text-brand-pink inline-block hover:-translate-y-1 transition-transform delay-150">o</span>
           <span className="text-brand-red ml-2 inline-block rotate-12 hover:rotate-0 transition-transform delay-200">7</span>
        </h1>
        <p className="text-slate-600 font-medium mb-8">Gestão Escolar & Nutricional</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="group">
            <label className="block text-sm font-bold text-slate-700 ml-1 mb-1 transition-colors group-focus-within:text-brand-blue">
              {isRegistering ? 'Email' : 'Email ou Usuário'}
            </label>
            <div className="relative">
               <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-blue transition-colors" />
               <input 
                 type="text" 
                 className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                 placeholder={isRegistering ? "seu@email.com" : "admin ou seu@email.com"}
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 required
               />
            </div>
          </div>
          <div className="group">
            <label className="block text-sm font-bold text-slate-700 ml-1 mb-1 transition-colors group-focus-within:text-brand-blue">Senha</label>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-blue transition-colors" />
               <input 
                 type="password" 
                 className="w-full pl-10 pr-4 py-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-brand-blue/10 focus:border-brand-blue transition-all"
                 placeholder="Digite sua senha"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 required
               />
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-shake">
              <Lock size={16} className="shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-green hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 active:scale-95 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
          >
            {loading ? <Loader2 className="animate-spin" /> : isRegistering ? <><UserPlus size={20}/> Criar Conta</> : <><LogIn size={20}/> Entrar</>}
          </button>
        </form>

        <button 
          onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
          className="mt-6 text-sm text-brand-blue font-bold hover:underline"
        >
          {isRegistering ? 'Já tenho conta? Fazer Login' : 'Não tem conta? Criar conta'}
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
          role: UserRole.ADMIN, // Defaulting to Admin for simplicity
          username: firebaseUser.email || ''
        });
        
        // Request Notification Permission on Login
        requestNotificationPermission().then(token => {
           if (token) {
             // TODO: In a real app, save this token to the user's profile in Firestore
           }
        });

      } else {
        // Check for local legacy login
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

  // Initialize Cloud Messaging Listener (Foreground)
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        if (payload.notification) {
          setNotificationMsg(`${payload.notification.title}: ${payload.notification.body}`);
          setTimeout(() => setNotificationMsg(null), 5000);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  // Initialize Firestore Listeners
  useEffect(() => {
    if (!user) {
      setStudents([]);
      setLogs([]);
      setAppointments([]);
      setGoals([]);
      return;
    }

    // Students Listener
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

    // Logs Listener
    const qLogs = query(collection(db, "logs"), orderBy("date", "desc"));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MealLog));
      setLogs(logsData);
    });

    // Appointments Listener
    const qApts = query(collection(db, "appointments"), orderBy("date"));
    const unsubApts = onSnapshot(qApts, (snapshot) => {
      const aptData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(aptData);
    });

    // Goals Listener
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
      const adminUser: User = { id: 'local-admin', name: 'Administrador (Local)', role: UserRole.ADMIN, username: 'admin' };
      localStorage.setItem('local_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, u, p);
      localStorage.removeItem('local_user');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') setAuthError('Email ou senha incorretos.');
      else if (err.code === 'auth/invalid-email') setAuthError('Email inválido.');
      else setAuthError('Erro ao fazer login. Tente novamente.');
    }
  };

  const register = async (u: string, p: string) => {
    setAuthError('');
    try {
      await createUserWithEmailAndPassword(auth, u, p);
      localStorage.removeItem('local_user');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setAuthError('Este email já está em uso.');
      else if (err.code === 'auth/weak-password') setAuthError('A senha deve ter pelo menos 6 caracteres.');
      else setAuthError('Erro ao criar conta.');
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
    if (confirm('Tem certeza que deseja remover este aluno?')) {
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
        <div className="min-h-screen bg-brand-blue flex flex-col items-center justify-center text-white">
           <Loader2 size={48} className="animate-spin mb-4" />
           <p className="font-bold text-lg">Carregando Pintando 7...</p>
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
