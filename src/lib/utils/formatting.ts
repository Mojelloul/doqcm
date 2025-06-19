/**
 * Utilitaires de formatage pour l'application
 */

// Formatage de date
export function formatDate(date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Date invalide';
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    
    case 'long':
      return dateObj.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    
    case 'relative':
      return formatRelativeDate(dateObj);
    
    default:
      return dateObj.toLocaleDateString('fr-FR');
  }
}

// Formatage de date relative
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'À l\'instant';
  } else if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  } else {
    return formatDate(date, 'short');
  }
}

// Formatage de nombre
export function formatNumber(num: number, decimals: number = 0): string {
  return num.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Formatage de pourcentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Formatage de score
export function formatScore(score: number, total: number = 100): string {
  const percentage = (score / total) * 100;
  return `${score}/${total} (${formatPercentage(percentage)})`;
}

// Formatage de taille de fichier
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Formatage de durée
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h${remainingMinutes}min`;
}

// Formatage de texte (troncature)
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

// Formatage de texte (capitalisation)
export function capitalizeText(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Formatage de texte (titre)
export function formatTitle(text: string): string {
  return text
    .split(' ')
    .map(word => capitalizeText(word))
    .join(' ');
}

// Formatage d'email (masquage partiel)
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@');
  
  if (localPart.length <= 2) {
    return email;
  }
  
  const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
  return `${maskedLocal}@${domain}`;
}

// Formatage de nom (initiales)
export function formatInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('');
}

// Formatage de numéro de téléphone
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('33')) {
    // Format français international
    return `+${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  } else if (cleaned.startsWith('0')) {
    // Format français national
    return `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
  }
  
  return phone;
}

// Formatage de prix
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Formatage de liste
export function formatList(items: string[], conjunction: 'et' | 'ou' = 'et'): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;
  
  const lastItem = items.pop();
  return `${items.join(', ')} ${conjunction} ${lastItem}`;
}

// Formatage de temps écoulé
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  
  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (years > 0) {
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  } else if (months > 0) {
    return `Il y a ${months} mois`;
  } else if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'À l\'instant';
  }
}

// Formatage de slug
export function formatSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer les espaces par des tirets
    .replace(/-+/g, '-') // Supprimer les tirets multiples
    .trim();
}

// Formatage de nom de fichier
export function formatFileName(fileName: string, maxLength: number = 50): string {
  const name = fileName.split('.')[0];
  const extension = fileName.split('.').pop();
  
  if (name.length <= maxLength) {
    return fileName;
  }
  
  const truncatedName = truncateText(name, maxLength - extension!.length - 1);
  return `${truncatedName}.${extension}`;
}

// Formatage de code couleur
export function formatHexColor(color: string): string {
  if (color.startsWith('#')) {
    return color.toUpperCase();
  }
  
  // Convertir RGB en HEX si nécessaire
  const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  }
  
  return color;
}

// Formatage de texte en markdown simple
export function formatMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/`(.*?)`/g, '<code>$1</code>') // Code
    .replace(/\n/g, '<br>'); // Line breaks
}

// Formatage de texte en HTML sécurisé
export function formatHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Formatage de texte pour l'affichage
export function formatDisplayText(text: string, maxLength?: number): string {
  let formatted = text.trim();
  
  if (maxLength && formatted.length > maxLength) {
    formatted = truncateText(formatted, maxLength);
  }
  
  return formatted;
}

// Formatage de statistiques
export function formatStats(value: number, total: number, format: 'percentage' | 'fraction' | 'both' = 'both'): string {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  
  switch (format) {
    case 'percentage':
      return formatPercentage(percentage);
    case 'fraction':
      return `${value}/${total}`;
    case 'both':
      return `${value}/${total} (${formatPercentage(percentage)})`;
    default:
      return `${value}/${total}`;
  }
} 