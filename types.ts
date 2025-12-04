
export enum UserRole {
  ADMIN = 'ADMIN',
  NUTRITIONIST = 'NUTRITIONIST'
}

export enum AllergySeverity {
  MILD = 'Leve',
  MODERATE = 'Moderada',
  SEVERE = 'Grave'
}

export enum MealType {
  BREAKFAST = 'Café da Manhã',
  LUNCH = 'Almoço',
  SNACK = 'Lanche',
  DINNER = 'Jantar'
}

export interface Allergy {
  id: string;
  name: string;
  severity: AllergySeverity;
  notes?: string;
}

export interface MedicalRecord {
  hasRestriction: boolean;
  allergies: Allergy[];
  intolerances: string[];
  medicalNotes: string;
  bloodType?: string;
}

export interface Student {
  id: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  heightCm: number;
  weightKg: number;
  guardianName: string;
  contactPhone: string;
  contactEmail: string;
  schoolClass: string; // e.g., "Berçário 1"
  shift: 'Matutino' | 'Vespertino' | 'Integral';
  teacherName: string;
  medical: MedicalRecord;
  avatarUrl?: string;
  generalNotes?: string;
}

export interface MealLog {
  id: string;
  studentId: string;
  date: string;
  mealType: MealType;
  consumptionPercentage: number; // 0-100
  mood: 'Happy' | 'Neutral' | 'Fussy' | 'Refused';
  notes: string;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface AIAnalysisResult {
  summary: string;
  recommendations: string[];
  riskAssessment: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string; // ISO String for Date and Time
  type: 'Consultation' | 'Meeting' | 'Review';
  notes?: string;
}

export interface WeeklyGoal {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export type PaymentMethod = 'Pix' | 'Dinheiro' | 'Cartão Crédito' | 'Cartão Débito' | 'Boleto' | 'Transferência';

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Material Escolar',
  'Salários',
  'Manutenção',
  'Contas (Água/Luz/Net)',
  'Marketing',
  'Impostos',
  'Outros'
] as const;

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  paymentMethod: PaymentMethod;
  supplier: string;
  notes?: string;
  createdAt: string;
}