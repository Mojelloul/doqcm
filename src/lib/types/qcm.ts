import { User } from './user';
import { Document } from './document';

// Types de base pour les questions QCM
export interface Question {
  id: string;
  document_id: string;
  question: string;
  created_at: string;
  updated_at?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

// Types pour les choix de réponses
export interface Choice {
  id: string;
  question_id: string;
  choice: string;
  is_correct: boolean;
  created_at: string;
  order?: number;
  explanation?: string;
}

// Question QCM avec ses choix
export interface QuestionWithChoices extends Question {
  choices: Choice[];
}

// Question QCM générée par l'IA
export interface QCMQuestion {
  question: string;
  choices: {
    A: string;
    B: string;
    C: string;
  };
  correct_answer: "A" | "B" | "C";
  justification: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
}

// Réponse QCM de l'IA
export interface QCMResponse {
  qcm: QCMQuestion[];
}

// Score QCM
export interface QCMScore {
  correct: number;
  total: number;
  percentage: number;
  time_taken?: number; // en secondes
  completed_at?: string;
}

// Réponse utilisateur
export interface UserAnswer {
  questionId: string;
  choiceId: string;
  answered_at?: string;
  time_spent?: number; // en secondes
}

// Session QCM complète
export interface QCMSession {
  id: string;
  user_id: string;
  document_id: string;
  started_at: string;
  completed_at?: string;
  score?: QCMScore;
  answers: UserAnswer[];
  status: 'in_progress' | 'completed' | 'abandoned';
}

// Données pour créer une question
export interface CreateQuestionData {
  document_id: string;
  question: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  tags?: string[];
}

// Données pour créer un choix
export interface CreateChoiceData {
  question_id: string;
  choice: string;
  is_correct: boolean;
  order?: number;
  explanation?: string;
}

// Données pour créer une session QCM
export interface CreateQCMSessionData {
  user_id: string;
  document_id: string;
  questions: string[]; // IDs des questions assignées
}

// Statistiques QCM
export interface QCMStats {
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  completionRate: number;
  averageTime: number;
  difficultyDistribution: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// Configuration QCM
export interface QCMConfig {
  questionsPerSession: number;
  timeLimit?: number; // en minutes
  allowRetake: boolean;
  showResults: boolean;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
}

// Type pour la génération de QCM
export interface QCMGenerationParams {
  text: string;
  title: string;
  summary: string;
  numberOfQuestions: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  categories?: string[];
}

// Type pour la validation de QCM
export interface QCMValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// Type pour l'analyse de performance
export interface QCMPerformance {
  questionId: string;
  correctAnswers: number;
  totalAnswers: number;
  averageTime: number;
  difficulty: number; // 0-1
  discrimination: number; // capacité à discriminer les bons/mauvais élèves
}

// Type pour les rapports QCM
export interface QCMReport {
  documentId: string;
  documentTitle: string;
  totalSessions: number;
  averageScore: number;
  questionAnalysis: QCMPerformance[];
  userPerformance: {
    userId: string;
    userName: string;
    score: number;
    timeSpent: number;
    completedAt: string;
  }[];
} 