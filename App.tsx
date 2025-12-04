import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, Student, MealLog, AllergySeverity } from './types';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/Students';
import StudentProfile from './pages/StudentProfile';
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
  addStudent: (s: Student) => void;
  updateStudent: (s: Student) => void;
  deleteStudent: (id: string) => void;
  addLog: (l: MealLog) => void;
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
    <div className="min-h-screen bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-brand-yellow rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg border-4 border-white">
          <Palette className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-brand-red mb-2">Pintando 7</h1>
        <p className="text-slate-500 mb-8">Gestão Escolar & Nutricional</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-bold text-slate-700 ml-1 mb-1">
              {isRegistering ? 'Email' : 'Email ou Usuário'}
            </label>
            <input 
              type="text" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
              placeholder={isRegistering ? "seu@email.com" : "admin ou seu@email.com"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 ml-1 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all"
              placeholder="Digite sua senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-xl flex items-center gap-2">
              <Lock size={16} className="shrink-0" /> 
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-green hover:bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all transform hover:-translate-y-1 mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
        
        <p className="mt-8 text-xs text-slate-400">© 2024 Escola Berçário Pintando 7</p>
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
             // updateDoc(doc(db, 'users', firebaseUser.uid), { fcmToken: token });
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
          // Auto dismiss after 5 seconds
          setTimeout(() => setNotificationMsg(null), 5000);
        }
      });
      return () => unsubscribe(); // This might not return an unsubscribe function in all versions, check SDK
    }
  }, []);

  // Initialize Firestore Listeners
  useEffect(() => {
    if (!user) {
      setStudents([]);
      setLogs([]);
      return;
    }

    // Students Listener with SAFETY CHECK (Sanitization)
    const qStudents = query(collection(db, "students"), orderBy("fullName"));
    const unsubStudents = onSnapshot(qStudents, (snapshot) => {
      const studentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        // Defensive coding: Ensure all fields exist to prevent white-screen crashes
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
      const logsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          ...data 
        } as MealLog;
      });
      setLogs(logsData);
    });

    return () => {
      unsubStudents();
      unsubLogs();
    };
  }, [user]);

  const login = async (u: string, p: string) => {
    setAuthError('');
    
    // Legacy/Backdoor Admin Support
    if (u === 'admin' && p === '7777777') {
      const adminUser: User = { id: 'local-admin', name: 'Administrador (Local)', role: UserRole.ADMIN, username: 'admin' };
      localStorage.setItem('local_user', JSON.stringify(adminUser));
      setUser(adminUser);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, u, p);
      localStorage.removeItem('local_user'); // Clear local if firebase login successful
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setAuthError('Email ou senha incorretos.');
      } else if (err.code === 'auth/invalid-email') {
        setAuthError('Email inválido.');
      } else {
        setAuthError('Erro ao fazer login. Tente novamente.');
      }
    }
  };

  const register = async (u: string, p: string) => {
    setAuthError('');
    try {
      await createUserWithEmailAndPassword(auth, u, p);
      localStorage.removeItem('local_user');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setAuthError('Este email já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setAuthError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setAuthError('Erro ao criar conta.');
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('local_user');
    setUser(null);
    setActivePage('dashboard');
  };

  // Firestore Data Actions
  const addStudent = async (s: Student) => {
    try {
      // Remove ID before sending to firestore (it generates one) or use custom ID
      const { id, ...data } = s; 
      await addDoc(collection(db, "students"), data);
    } catch (e) {
      console.error("Error adding student: ", e);
      alert("Erro ao salvar aluno no banco de dados.");
    }
  };

  const updateStudent = async (s: Student) => {
    try {
      const { id, ...data } = s;
      const studentRef = doc(db, "students", id);
      await updateDoc(studentRef, data as any);
    } catch (e) {
      console.error("Error updating student: ", e);
    }
  };

  const deleteStudent = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este aluno?')) {
      try {
        await deleteDoc(doc(db, "students", id));
      } catch (e) {
        console.error("Error deleting student: ", e);
      }
    }
  };

  const addLog = async (l: MealLog) => {
    try {
      const { id, ...data } = l;
      await addDoc(collection(db, "logs"), data);
    } catch (e) {
      console.error("Error adding log: ", e);
    }
  };

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSelectedStudent(null);
  };

  const handleViewStudent = (s: Student) => {
    setSelectedStudent(s);
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
      <DataContext.Provider value={{ students, logs, addStudent, updateStudent, deleteStudent, addLog }}>
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
                  onViewStudent={handleViewStudent}
                />
              )}
              {activePage === 'nutrition' && (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                   <div className="bg-brand-yellow/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-yellow">
                      <Palette size={40} />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800">Painel Nutricional Geral</h2>
                   <p className="text-slate-500 max-w-md mx-auto mt-2">
                     Use a aba "Alunos" e selecione um perfil individual para registrar refeições e gerar relatórios de IA.
                   </p>
                   <button 
                     onClick={() => handleNavigate('students')}
                     className="mt-6 text-brand-blue font-bold hover:underline"
                   >
                     Ir para Alunos
                   </button>
                </div>
              )}
            </>
          )}

        </Layout>
      </DataContext.Provider>
    </AuthContext.Provider>
  );
}