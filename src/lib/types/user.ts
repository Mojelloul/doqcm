import { Document } from './document';
import { Question } from './qcm';

// Types de base pour les utilisateurs
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
}

// Données utilisateur étendues avec relations
export interface UserData {
  user: User;
  documents: Document[];
  sharedDocuments: Document[];
  qcmQuestions: Question[];
  scores: UserScore[];
}

// Données pour créer un utilisateur
export interface CreateUserData {
  email: string;
}

// Données pour mettre à jour un utilisateur
export interface UpdateUserData {
  email?: string;
}

// Score utilisateur pour un document
export interface UserScore {
  id: string;
  user_id: string;
  document_id: string;
  score: number;
  created_at: string;
}

// Statistiques utilisateur
export interface UserStats {
  totalDocuments: number;
  totalSharedDocuments: number;
  totalQCMsTaken: number;
  averageScore: number;
  bestScore: number;
  documentsCreated: number;
}

// Session utilisateur
export interface UserSession {
  user: User;
  isAuthenticated: boolean;
  lastLogin?: string;
}

// Préférences utilisateur
export interface UserPreferences {
  notifications: boolean;
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'fr' | 'en';
}

// Type pour la validation d'email
export type EmailValidation = {
  isValid: boolean;
  message?: string;
};

// Type pour l'authentification
export interface AuthData {
  user: User | null;
  session: any | null;
  loading: boolean;
}

// Type pour les erreurs utilisateur
export interface UserError {
  code: string;
  message: string;
  field?: string;
} 