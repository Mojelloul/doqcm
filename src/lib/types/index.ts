// ============================================================================
// TYPES UTILISATEUR
// ============================================================================

// Ré-export des types utilisateur
export * from './user';

// ============================================================================
// TYPES DOCUMENT
// ============================================================================

// Ré-export des types document
export * from './document';

// ============================================================================
// TYPES QCM
// ============================================================================

// Ré-export des types QCM
export * from './qcm';

// ============================================================================
// TYPES COMMUNS
// ============================================================================

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
}

// Types pour les requêtes paginées
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Types pour les filtres génériques
export interface BaseFilters {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Types pour les erreurs
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  path?: string;
}

// Types pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Types pour les événements
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}

// Types pour les logs
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: any;
  userId?: string;
}

// ============================================================================
// TYPES UTILITAIRES
// ============================================================================

// Types pour les formulaires
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    custom?: (value: any) => boolean;
  };
  options?: Array<{ value: string; label: string }>;
}

export interface FormData {
  [key: string]: any;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Types pour les modales
export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showClose?: boolean;
}

// Types pour les tableaux
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  sortable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  searchable?: boolean;
  loading?: boolean;
}

// Types pour les graphiques
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: ChartData;
  options?: any;
}

// ============================================================================
// TYPES D'ENVIRONNEMENT
// ============================================================================

// Configuration de l'environnement
export interface EnvironmentConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_GEMINI_API_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
}

// Types pour les variables d'environnement
export interface EnvVars {
  [key: string]: string | undefined;
}

// ============================================================================
// TYPES DE VALIDATION
// ============================================================================

// Schéma de validation Zod
export interface ValidationSchema {
  [key: string]: any;
}

// Résultat de validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

// ============================================================================
// TYPES D'EXPORT
// ============================================================================

// Configuration d'export
export interface ExportConfig {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
  timezone?: string;
}

// Données d'export
export interface ExportData {
  headers: string[];
  rows: any[][];
  metadata?: Record<string, any>;
} 