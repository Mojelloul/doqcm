import { User } from './user';
import { Question } from './qcm';

// Types de base pour les documents
export interface Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  owner_id: string;
  created_at: string;
  updated_at?: string;
  shared_count?: number;
  question_count?: number;
  average_score?: number;
}

// Données pour créer un document
export interface CreateDocumentData {
  title: string;
  content: string;
  summary: string;
  owner_id: string;
}

// Données pour mettre à jour un document
export interface UpdateDocumentData {
  title?: string;
  content?: string;
  summary?: string;
}

// Document avec relations complètes
export interface DocumentWithRelations extends Document {
  owner: User;
  questions: Question[];
  shared_users: User[];
  scores: DocumentScore[];
}

// Document avec partages
export interface DocumentWithShares extends Document {
  employees_documents: Array<{
    document_id: string;
    user_id: string;
    user: User;
  }>;
}

// Score pour un document
export interface DocumentScore {
  id: string;
  document_id: string;
  user_id: string;
  score: number;
  created_at: string;
  user: User;
}

// Statistiques de document
export interface DocumentStats {
  totalQuestions: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  completionRate: number;
  sharedCount: number;
}

// Partage de document
export interface DocumentShare {
  id: string;
  document_id: string;
  user_id: string;
  created_at: string;
  user: User;
}

// Type pour la recherche de documents
export interface DocumentSearchParams {
  query?: string;
  owner_id?: string;
  shared_with?: string;
  created_after?: string;
  created_before?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'title' | 'average_score';
  sort_order?: 'asc' | 'desc';
}

// Type pour les filtres de documents
export interface DocumentFilters {
  isOwner: boolean;
  isShared: boolean;
  hasQuestions: boolean;
  hasScores: boolean;
}

// Type pour la validation de document
export interface DocumentValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Type pour l'export de document
export interface DocumentExport {
  format: 'pdf' | 'json' | 'csv';
  includeQuestions: boolean;
  includeScores: boolean;
  includeMetadata: boolean;
}

// Type pour les métadonnées de document
export interface DocumentMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number; // en minutes
  complexity: 'simple' | 'medium' | 'complex';
  language: string;
  keywords: string[];
}

// Types manquants ajoutés
export interface DocumentFilter {
  title?: string;
  dateFrom?: string;
  dateTo?: string;
  hasQCM?: boolean;
}

export interface DocumentSort {
  field: string;
  ascending: boolean;
}

export interface DocumentPermission {
  read: boolean;
  write: boolean;
}

export interface DocumentAccess {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export interface DocumentTemplate {
  title: string;
  content: string;
  summary: string;
}

export interface DocumentActivity {
  type: string;
  user_id: string;
  timestamp: string;
  details: string;
}

export interface DocumentSearchResult {
  document: Document;
  relevance: number;
  matchedFields: string[];
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: number;
  content: string;
  changes: string;
  created_at: string;
  created_by: string;
}

export interface DocumentCollaboration {
  document_id: string;
  collaborators: User[];
  permissions: Record<string, DocumentPermission>;
  lastActivity: string;
}

export interface DocumentImport {
  content: string;
  format: 'json' | 'txt' | 'pdf';
  metadata?: Record<string, any>;
} 