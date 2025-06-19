/**
 * Gestionnaire d'erreurs global pour l'application
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorListeners: Array<(error: AppError) => void> = [];

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Gère une erreur et la transforme en AppError
   */
  handleError(error: any, context?: string): AppError {
    const appError: AppError = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: error,
      timestamp: new Date(),
      context
    };

    console.error('Application Error:', appError);
    this.notifyListeners(appError);
    
    return appError;
  }

  /**
   * Ajoute un listener pour les erreurs
   */
  addErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Supprime un listener d'erreur
   */
  removeErrorListener(listener: (error: AppError) => void): void {
    this.errorListeners = this.errorListeners.filter(l => l !== listener);
  }

  /**
   * Notifie tous les listeners d'une erreur
   */
  private notifyListeners(error: AppError): void {
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Extrait le code d'erreur
   */
  private getErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.status) return `HTTP_${error.status}`;
    if (error?.name) return error.name;
    return 'UNKNOWN_ERROR';
  }

  /**
   * Extrait le message d'erreur
   */
  private getErrorMessage(error: any): string {
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    if (error?.error_description) return error.error_description;
    return 'Une erreur inattendue s\'est produite';
  }

  /**
   * Crée une erreur personnalisée
   */
  createError(code: string, message: string, details?: any, context?: string): AppError {
    return this.handleError({ code, message, details }, context);
  }

  /**
   * Gère les erreurs de validation
   */
  handleValidationError(field: string, message: string): AppError {
    return this.createError('VALIDATION_ERROR', message, { field }, 'validation');
  }

  /**
   * Gère les erreurs d'authentification
   */
  handleAuthError(message: string): AppError {
    return this.createError('AUTH_ERROR', message, {}, 'authentication');
  }

  /**
   * Gère les erreurs de base de données
   */
  handleDatabaseError(error: any): AppError {
    return this.createError('DATABASE_ERROR', 'Erreur de base de données', error, 'database');
  }

  /**
   * Gère les erreurs d'IA
   */
  handleAIError(error: any): AppError {
    return this.createError('AI_ERROR', 'Erreur lors de la génération IA', error, 'ai');
  }
}

// Export de l'instance singleton
export const errorHandler = ErrorHandler.getInstance(); 