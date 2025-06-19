# Types TypeScript - Documentation

Cette documentation décrit l'organisation et l'utilisation des types TypeScript dans l'application DOQCM.

## 📁 **Structure des Types**

```
src/lib/types/
├── user.ts          # Types liés aux utilisateurs
├── document.ts      # Types liés aux documents
├── qcm.ts          # Types liés aux QCM
├── index.ts        # Types communs et utilitaires
└── README.md       # Cette documentation
```

## 🏗️ **Organisation des Types**

### **1. Types Utilisateur (`user.ts`)**

#### **Types de Base**
- `User` - Utilisateur de base
- `CreateUserData` - Données pour créer un utilisateur
- `UpdateUserData` - Données pour mettre à jour un utilisateur

#### **Types Étendus**
- `UserData` - Données utilisateur avec relations
- `UserScore` - Score utilisateur pour un document
- `UserStats` - Statistiques utilisateur
- `UserSession` - Session utilisateur
- `UserPreferences` - Préférences utilisateur

#### **Types Utilitaires**
- `EmailValidation` - Validation d'email
- `AuthData` - Données d'authentification
- `UserError` - Erreurs utilisateur

### **2. Types Document (`document.ts`)**

#### **Types de Base**
- `Document` - Document de base
- `CreateDocumentData` - Données pour créer un document
- `UpdateDocumentData` - Données pour mettre à jour un document

#### **Types Étendus**
- `DocumentWithRelations` - Document avec relations complètes
- `DocumentWithShares` - Document avec partages
- `DocumentScore` - Score pour un document
- `DocumentStats` - Statistiques de document
- `DocumentShare` - Partage de document

#### **Types Utilitaires**
- `DocumentSearchParams` - Paramètres de recherche
- `DocumentFilters` - Filtres de documents
- `DocumentValidation` - Validation de document
- `DocumentExport` - Configuration d'export
- `DocumentMetadata` - Métadonnées de document

### **3. Types QCM (`qcm.ts`)**

#### **Types de Base**
- `Question` - Question QCM
- `Choice` - Choix de réponse
- `QCMQuestion` - Question générée par l'IA
- `QCMResponse` - Réponse QCM de l'IA
- `QCMScore` - Score QCM

#### **Types Étendus**
- `QuestionWithChoices` - Question avec ses choix
- `UserAnswer` - Réponse utilisateur
- `QCMSession` - Session QCM complète
- `QCMStats` - Statistiques QCM
- `QCMConfig` - Configuration QCM

#### **Types Utilitaires**
- `CreateQuestionData` - Données pour créer une question
- `CreateChoiceData` - Données pour créer un choix
- `CreateQCMSessionData` - Données pour créer une session
- `QCMGenerationParams` - Paramètres de génération
- `QCMValidation` - Validation de QCM
- `QCMPerformance` - Analyse de performance
- `QCMReport` - Rapports QCM

### **4. Types Communs (`index.ts`)**

#### **Types API**
- `ApiResponse<T>` - Réponse API générique
- `PaginatedResponse<T>` - Réponse paginée
- `BaseFilters` - Filtres génériques

#### **Types Utilitaires**
- `AppError` - Erreurs d'application
- `Notification` - Notifications
- `AppEvent` - Événements
- `LogEntry` - Entrées de log

#### **Types UI**
- `FormField` - Champ de formulaire
- `FormData` - Données de formulaire
- `FormValidation` - Validation de formulaire
- `ModalConfig` - Configuration de modale
- `TableColumn<T>` - Colonne de tableau
- `TableConfig<T>` - Configuration de tableau
- `ChartData` - Données de graphique
- `ChartConfig` - Configuration de graphique

#### **Types Environnement**
- `EnvironmentConfig` - Configuration d'environnement
- `EnvVars` - Variables d'environnement
- `ValidationSchema` - Schéma de validation
- `ValidationResult` - Résultat de validation
- `ExportConfig` - Configuration d'export
- `ExportData` - Données d'export

## 🚀 **Utilisation**

### **Import des Types**

```typescript
// Import de types spécifiques
import { User, Document, Question } from '@/lib/types';

// Import de types communs
import { ApiResponse, FormData, Notification } from '@/lib/types';

// Import de tous les types d'un module
import * as UserTypes from '@/lib/types/user';
import * as DocumentTypes from '@/lib/types/document';
import * as QCMTypes from '@/lib/types/qcm';
```

### **Exemples d'Utilisation**

#### **1. Type Utilisateur**
```typescript
import { User, CreateUserData } from '@/lib/types/user';

const newUser: CreateUserData = {
  email: 'user@example.com'
};

const user: User = {
  id: '123',
  email: 'user@example.com',
  created_at: '2024-01-01T00:00:00Z'
};
```

#### **2. Type Document**
```typescript
import { Document, CreateDocumentData } from '@/lib/types/document';

const newDocument: CreateDocumentData = {
  title: 'Mon Document',
  content: 'Contenu du document...',
  summary: 'Résumé du document',
  owner_id: 'user123'
};
```

#### **3. Type QCM**
```typescript
import { Question, Choice, QCMScore } from '@/lib/types/qcm';

const question: Question = {
  id: 'q1',
  document_id: 'doc123',
  question: 'Quelle est la capitale de la France ?',
  created_at: '2024-01-01T00:00:00Z'
};

const score: QCMScore = {
  correct: 8,
  total: 10,
  percentage: 80
};
```

#### **4. Type API**
```typescript
import { ApiResponse, PaginatedResponse } from '@/lib/types';

const apiResponse: ApiResponse<User> = {
  success: true,
  data: user,
  message: 'Utilisateur récupéré avec succès'
};

const paginatedResponse: PaginatedResponse<Document> = {
  data: documents,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrev: false
  }
};
```

## 📋 **Conventions**

### **1. Nommage**
- **Interfaces** : PascalCase (ex: `UserData`)
- **Types** : PascalCase (ex: `EmailValidation`)
- **Enums** : PascalCase (ex: `UserRole`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)

### **2. Organisation**
- **Types de base** en premier
- **Types étendus** ensuite
- **Types utilitaires** à la fin
- **Commentaires** pour chaque section

### **3. Imports**
- **Imports relatifs** pour les types du même module
- **Imports absolus** pour les types d'autres modules
- **Éviter les imports circulaires**

### **4. Documentation**
- **JSDoc** pour les interfaces complexes
- **Commentaires** pour expliquer les types
- **Exemples** dans la documentation

## 🔧 **Maintenance**

### **Ajout de Nouveaux Types**
1. Identifier le module approprié
2. Ajouter le type avec documentation
3. Mettre à jour cette documentation
4. Tester l'utilisation

### **Modification de Types Existants**
1. Vérifier l'impact sur le code existant
2. Utiliser des types optionnels pour les nouvelles propriétés
3. Mettre à jour la documentation
4. Tester la compatibilité

### **Suppression de Types**
1. Vérifier qu'aucun code n'utilise le type
2. Supprimer le type
3. Mettre à jour la documentation
4. Nettoyer les imports inutilisés

## 🎯 **Avantages**

### **1. Type Safety**
- Détection d'erreurs à la compilation
- Autocomplétion dans l'IDE
- Refactoring sécurisé

### **2. Documentation**
- Types auto-documentés
- Interface claire entre modules
- Exemples d'utilisation

### **3. Maintenabilité**
- Code plus lisible
- Changements plus sûrs
- Tests plus faciles

### **4. Évolutivité**
- Ajout facile de nouvelles fonctionnalités
- Extension des types existants
- Compatibilité ascendante 