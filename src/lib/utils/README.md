# Utilitaires

Cette section contient les utilitaires de validation et de formatage utilisés dans l'application.

## Structure

```
src/lib/utils/
├── validation.ts    # Fonctions de validation
├── formatting.ts    # Fonctions de formatage
├── index.ts         # Exports des utilitaires
└── README.md        # Documentation
```

## Utilitaires de Validation (`validation.ts`)

### Validation d'Email
```typescript
import { validateEmail } from '@/lib/utils';

const result = validateEmail('user@example.com');
// { isValid: true }
```

### Validation de Mot de Passe
```typescript
import { validatePassword, validatePasswordComplexity } from '@/lib/utils';

const result = validatePassword('MyPassword123!');
// { isValid: true, strength: 'strong' }

const complexity = validatePasswordComplexity('password');
// { isValid: false, requirements: { length: true, uppercase: false, ... } }
```

### Validation de Texte
```typescript
import { validateText, validateTitle, validateDocumentContent } from '@/lib/utils';

const textResult = validateText('Hello world', 5, 100);
const titleResult = validateTitle('Mon titre');
const contentResult = validateDocumentContent('Contenu du document...', 100, 10000);
```

### Validation de Données Spécifiques
```typescript
import { validateScore, validateEmailList, validateUUID } from '@/lib/utils';

const scoreResult = validateScore(85); // 0-100
const emailListResult = validateEmailList(['user1@example.com', 'user2@example.com']);
const uuidResult = validateUUID('123e4567-e89b-12d3-a456-426614174000');
```

## Utilitaires de Formatage (`formatting.ts`)

### Formatage de Dates
```typescript
import { formatDate, formatTimeAgo } from '@/lib/utils';

const shortDate = formatDate(new Date(), 'short'); // "25/12/2023"
const longDate = formatDate(new Date(), 'long'); // "lundi 25 décembre 2023"
const relativeDate = formatDate(new Date(), 'relative'); // "Il y a 2 heures"
const timeAgo = formatTimeAgo('2023-12-25T10:00:00Z'); // "Il y a 3 jours"
```

### Formatage de Nombres et Scores
```typescript
import { formatNumber, formatPercentage, formatScore, formatStats } from '@/lib/utils';

const number = formatNumber(1234.56, 2); // "1 234,56"
const percentage = formatPercentage(85.5); // "85.5%"
const score = formatScore(17, 20); // "17/20 (85.0%)"
const stats = formatStats(15, 20, 'both'); // "15/20 (75.0%)"
```

### Formatage de Texte
```typescript
import { truncateText, capitalizeText, formatTitle, formatDisplayText } from '@/lib/utils';

const truncated = truncateText('Texte très long...', 20); // "Texte très long..."
const capitalized = capitalizeText('hello world'); // "Hello world"
const title = formatTitle('mon titre en majuscules'); // "Mon Titre En Majuscules"
const display = formatDisplayText('  texte avec espaces  ', 50); // "texte avec espaces"
```

### Formatage de Données Spécifiques
```typescript
import { formatFileSize, formatDuration, maskEmail, formatPhoneNumber } from '@/lib/utils';

const fileSize = formatFileSize(1024 * 1024); // "1 MB"
const duration = formatDuration(125); // "2h5min"
const maskedEmail = maskEmail('user@example.com'); // "u***r@example.com"
const phone = formatPhoneNumber('0123456789'); // "01 23 45 67 89"
```

## Utilisation dans les Composants

### Validation dans les Formulaires
```typescript
import { validateEmail, validateText } from '@/lib/utils';

function MyForm() {
  const handleSubmit = (data: FormData) => {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.message);
      return;
    }
    
    const textValidation = validateText(data.content, 100, 3000);
    if (!textValidation.isValid) {
      setError(textValidation.message);
      return;
    }
    
    // Soumettre le formulaire
  };
}
```

### Formatage dans l'Affichage
```typescript
import { formatDate, formatScore, truncateText } from '@/lib/utils';

function DocumentCard({ document }) {
  return (
    <div>
      <h3>{truncateText(document.title, 50)}</h3>
      <p>Créé le {formatDate(document.created_at, 'short')}</p>
      <p>Score: {formatScore(document.score, 100)}</p>
    </div>
  );
}
```

## Avantages

1. **Cohérence** : Validation et formatage uniformes dans toute l'application
2. **Réutilisabilité** : Fonctions utilisables dans tous les composants
3. **Maintenabilité** : Logique centralisée et facile à modifier
4. **Type Safety** : TypeScript assure la cohérence des types
5. **Performance** : Fonctions optimisées et légères

## Extensions Futures

- **Validation côté serveur** : Synchroniser avec les validations backend
- **Internationalisation** : Support multi-langues pour les messages
- **Validation en temps réel** : Validation asynchrone pour les emails existants
- **Formatage avancé** : Support de formats de date/heure personnalisés
- **Validation de fichiers** : Validation de types et tailles de fichiers uploadés 