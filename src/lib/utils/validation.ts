/**
 * Utilitaires de validation pour l'application
 */

// Validation d'email
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  return {
    isValid,
    message: isValid ? undefined : 'Adresse email invalide'
  };
}

// Validation de mot de passe
export function validatePassword(password: string): { isValid: boolean; message?: string; strength: 'weak' | 'medium' | 'strong' } {
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Le mot de passe doit contenir au moins 6 caractères',
      strength: 'weak'
    };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar ? 'strong' :
                   (hasUpperCase && hasLowerCase && hasNumbers) || (hasUpperCase && hasLowerCase && hasSpecialChar) ? 'medium' : 'weak';

  return {
    isValid: password.length >= 6,
    message: password.length >= 6 ? undefined : 'Le mot de passe doit contenir au moins 6 caractères',
    strength
  };
}

// Validation de texte
export function validateText(text: string, minLength: number = 1, maxLength?: number): { isValid: boolean; message?: string } {
  if (text.length < minLength) {
    return {
      isValid: false,
      message: `Le texte doit contenir au moins ${minLength} caractère${minLength > 1 ? 's' : ''}`
    };
  }

  if (maxLength && text.length > maxLength) {
    return {
      isValid: false,
      message: `Le texte ne doit pas dépasser ${maxLength} caractères`
    };
  }

  return { isValid: true };
}

// Validation de titre
export function validateTitle(title: string, maxLength: number = 100): { isValid: boolean; message?: string } {
  if (!title.trim()) {
    return {
      isValid: false,
      message: 'Le titre est requis'
    };
  }

  if (title.length > maxLength) {
    return {
      isValid: false,
      message: `Le titre ne doit pas dépasser ${maxLength} caractères`
    };
  }

  return { isValid: true };
}

// Validation de nom
export function validateName(name: string, minLength: number = 2, maxLength: number = 50): { isValid: boolean; message?: string } {
  if (name.length < minLength) {
    return {
      isValid: false,
      message: `Le nom doit contenir au moins ${minLength} caractères`
    };
  }

  if (name.length > maxLength) {
    return {
      isValid: false,
      message: `Le nom ne doit pas dépasser ${maxLength} caractères`
    };
  }

  // Vérifier que le nom ne contient que des lettres, espaces et tirets
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!nameRegex.test(name)) {
    return {
      isValid: false,
      message: 'Le nom ne doit contenir que des lettres, espaces et tirets'
    };
  }

  return { isValid: true };
}

// Validation d'URL
export function validateUrl(url: string): { isValid: boolean; message?: string } {
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      message: 'URL invalide'
    };
  }
}

// Validation de numéro de téléphone
export function validatePhoneNumber(phone: string): { isValid: boolean; message?: string } {
  // Format français : +33 1 23 45 67 89 ou 01 23 45 67 89
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  const isValid = phoneRegex.test(phone.replace(/\s/g, ''));
  
  return {
    isValid,
    message: isValid ? undefined : 'Numéro de téléphone invalide'
  };
}

// Validation de date
export function validateDate(date: string): { isValid: boolean; message?: string } {
  const dateObj = new Date(date);
  const isValid = !isNaN(dateObj.getTime());
  
  return {
    isValid,
    message: isValid ? undefined : 'Date invalide'
  };
}

// Validation de score (0-100)
export function validateScore(score: number): { isValid: boolean; message?: string } {
  if (score < 0 || score > 100) {
    return {
      isValid: false,
      message: 'Le score doit être compris entre 0 et 100'
    };
  }

  return { isValid: true };
}

// Validation de liste d'emails
export function validateEmailList(emails: string[], maxEmails: number = 10): { isValid: boolean; message?: string; invalidEmails: string[] } {
  if (emails.length === 0) {
    return {
      isValid: false,
      message: 'Au moins un email est requis',
      invalidEmails: []
    };
  }

  if (emails.length > maxEmails) {
    return {
      isValid: false,
      message: `Maximum ${maxEmails} emails autorisés`,
      invalidEmails: []
    };
  }

  const invalidEmails: string[] = [];
  
  emails.forEach(email => {
    if (!validateEmail(email).isValid) {
      invalidEmails.push(email);
    }
  });

  return {
    isValid: invalidEmails.length === 0,
    message: invalidEmails.length > 0 ? `Emails invalides : ${invalidEmails.join(', ')}` : undefined,
    invalidEmails
  };
}

// Validation de contenu de document
export function validateDocumentContent(content: string, minLength: number = 100, maxLength: number = 10000): { isValid: boolean; message?: string } {
  if (content.length < minLength) {
    return {
      isValid: false,
      message: `Le contenu doit contenir au moins ${minLength} caractères`
    };
  }

  if (content.length > maxLength) {
    return {
      isValid: false,
      message: `Le contenu ne doit pas dépasser ${maxLength} caractères`
    };
  }

  return { isValid: true };
}

// Validation de résumé
export function validateSummary(summary: string, maxLength: number = 250): { isValid: boolean; message?: string } {
  if (summary.length > maxLength) {
    return {
      isValid: false,
      message: `Le résumé ne doit pas dépasser ${maxLength} caractères`
    };
  }

  return { isValid: true };
}

// Validation d'ID UUID
export function validateUUID(uuid: string): { isValid: boolean; message?: string } {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValid = uuidRegex.test(uuid);
  
  return {
    isValid,
    message: isValid ? undefined : 'Format UUID invalide'
  };
}

// Validation de format de fichier
export function validateFileType(fileName: string, allowedTypes: string[]): { isValid: boolean; message?: string } {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension || !allowedTypes.includes(extension)) {
    return {
      isValid: false,
      message: `Type de fichier non autorisé. Types acceptés : ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}

// Validation de taille de fichier
export function validateFileSize(fileSize: number, maxSizeMB: number): { isValid: boolean; message?: string } {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (fileSize > maxSizeBytes) {
    return {
      isValid: false,
      message: `La taille du fichier ne doit pas dépasser ${maxSizeMB} MB`
    };
  }

  return { isValid: true };
}

// Validation de complexité de mot de passe
export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  message?: string;
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    special: boolean;
  };
} {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  const isValid = Object.values(requirements).every(req => req);
  
  let message: string | undefined;
  if (!isValid) {
    const missing = [];
    if (!requirements.length) missing.push('au moins 8 caractères');
    if (!requirements.uppercase) missing.push('une majuscule');
    if (!requirements.lowercase) missing.push('une minuscule');
    if (!requirements.numbers) missing.push('un chiffre');
    if (!requirements.special) missing.push('un caractère spécial');
    
    message = `Le mot de passe doit contenir ${missing.join(', ')}`;
  }

  return {
    isValid,
    message,
    requirements
  };
} 