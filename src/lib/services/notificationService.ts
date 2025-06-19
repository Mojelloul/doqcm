/**
 * Service de notifications pour l'application
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Durée en millisecondes, undefined = permanent
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface NotificationConfig {
  defaultDuration: number; // 5 secondes par défaut
  maxNotifications: number; // Nombre maximum de notifications simultanées
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private config: NotificationConfig;

  private constructor(config?: Partial<NotificationConfig>) {
    this.config = {
      defaultDuration: 5000, // 5 secondes
      maxNotifications: 5,
      position: 'top-right',
      ...config
    };
  }

  static getInstance(config?: Partial<NotificationConfig>): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService(config);
    }
    return NotificationService.instance;
  }

  /**
   * Ajoute une notification
   */
  add(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      duration: notification.duration ?? this.config.defaultDuration
    };

    // Limiter le nombre de notifications
    if (this.notifications.length >= this.config.maxNotifications) {
      this.notifications.shift(); // Supprimer la plus ancienne
    }

    this.notifications.push(fullNotification);
    this.notifyListeners();

    // Auto-suppression si durée définie
    if (fullNotification.duration && fullNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, fullNotification.duration);
    }

    return id;
  }

  /**
   * Supprime une notification
   */
  remove(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  /**
   * Supprime toutes les notifications
   */
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Récupère toutes les notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Ajoute un listener pour les changements de notifications
   */
  addListener(listener: (notifications: Notification[]) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Supprime un listener
   */
  removeListener(listener: (notifications: Notification[]) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  /**
   * Méthodes utilitaires pour différents types de notifications
   */
  success(title: string, message: string, duration?: number): string {
    return this.add({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): string {
    return this.add({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): string {
    return this.add({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): string {
    return this.add({ type: 'info', title, message, duration });
  }

  /**
   * Notifications spécifiques à l'application
   */
  documentCreated(title: string): string {
    return this.success(
      'Document créé',
      `Le document "${title}" a été créé avec succès.`
    );
  }

  documentShared(title: string, recipients: number): string {
    return this.success(
      'Document partagé',
      `Le document "${title}" a été partagé avec ${recipients} personne(s).`
    );
  }

  qcmGenerated(questionCount: number): string {
    return this.success(
      'QCM généré',
      `${questionCount} question(s) ont été générées avec succès.`
    );
  }

  qcmSubmitted(score: number): string {
    return this.success(
      'QCM soumis',
      `Votre score : ${score.toFixed(1)}%`
    );
  }

  userNotFound(email: string): string {
    return this.error(
      'Utilisateur non trouvé',
      `L'utilisateur avec l'email "${email}" n'existe pas.`
    );
  }

  validationError(field: string, message: string): string {
    return this.error(
      'Erreur de validation',
      `${field}: ${message}`
    );
  }

  networkError(): string {
    return this.error(
      'Erreur réseau',
      'Impossible de se connecter au serveur. Vérifiez votre connexion.'
    );
  }

  /**
   * Génère un ID unique
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notifie tous les listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener([...this.notifications]);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
}

// Export de l'instance singleton
export const notificationService = NotificationService.getInstance(); 