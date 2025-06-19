import { format } from "date-fns";
import { fr } from "date-fns/locale";

export class UtilityService {
  /**
   * Formate une date en français
   */
  formatDate(date: Date | string, formatString: string = "d MMMM yyyy 'à' HH:mm"): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatString, { locale: fr });
  }

  /**
   * Formate une date courte
   */
  formatShortDate(date: Date | string): string {
    return this.formatDate(date, "dd/MM/yyyy");
  }

  /**
   * Formate une date avec heure
   */
  formatDateTime(date: Date | string): string {
    return this.formatDate(date, "dd/MM/yyyy HH:mm");
  }

  /**
   * Calcule le temps écoulé depuis une date
   */
  getTimeAgo(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "À l'instant";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `Il y a ${months} mois`;
    }
  }

  /**
   * Valide une adresse email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Nettoie et valide un texte
   */
  sanitizeText(text: string, maxLength?: number): string {
    let cleaned = text.trim();
    
    if (maxLength && cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }
    
    return cleaned;
  }

  /**
   * Génère un ID unique
   */
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Formate un nombre avec des séparateurs de milliers
   */
  formatNumber(num: number): string {
    return num.toLocaleString('fr-FR');
  }

  /**
   * Formate un pourcentage
   */
  formatPercentage(value: number, decimals: number = 2): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Calcule la longueur d'un texte en caractères
   */
  getTextLength(text: string): number {
    return text.trim().length;
  }

  /**
   * Vérifie si un texte est vide ou ne contient que des espaces
   */
  isEmpty(text: string): boolean {
    return !text || text.trim().length === 0;
  }

  /**
   * Tronque un texte à une longueur donnée
   */
  truncateText(text: string, maxLength: number, suffix: string = "..."): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Capitalise la première lettre d'une chaîne
   */
  capitalize(text: string): string {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Convertit un texte en slug (URL-friendly)
   */
  toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Vérifie si une chaîne contient des caractères spéciaux
   */
  hasSpecialCharacters(text: string): boolean {
    const specialCharsRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
    return specialCharsRegex.test(text);
  }

  /**
   * Compte les mots dans un texte
   */
  countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).length;
  }

  /**
   * Vérifie si un texte respecte une longueur minimale
   */
  meetsMinimumLength(text: string, minLength: number): boolean {
    return this.getTextLength(text) >= minLength;
  }

  /**
   * Vérifie si un texte respecte une longueur maximale
   */
  meetsMaximumLength(text: string, maxLength: number): boolean {
    return this.getTextLength(text) <= maxLength;
  }

  /**
   * Génère un message d'erreur personnalisé pour la validation
   */
  getValidationMessage(fieldName: string, errorType: string, value?: any): string {
    const messages: Record<string, Record<string, string>> = {
      email: {
        invalid: "Veuillez entrer une adresse email valide",
        required: "L'adresse email est requise",
        exists: "Cette adresse email existe déjà"
      },
      password: {
        tooShort: "Le mot de passe doit contenir au moins 6 caractères",
        required: "Le mot de passe est requis",
        mismatch: "Les mots de passe ne correspondent pas"
      },
      text: {
        tooShort: `Le texte doit contenir au moins ${value} caractères`,
        tooLong: `Le texte ne doit pas dépasser ${value} caractères`,
        required: "Le texte est requis"
      },
      title: {
        required: "Le titre est requis",
        tooLong: `Le titre ne doit pas dépasser ${value} caractères`
      }
    };

    return messages[fieldName]?.[errorType] || `Erreur de validation pour ${fieldName}`;
  }
} 