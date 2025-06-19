# Architecture des Services

Cette architecture suit le principe de **séparation des responsabilités** et utilise le pattern **Service Layer** pour organiser la logique métier de l'application.

## 🏗️ **Structure des Services**

### **Services Principaux**

#### 1. **UserService** (`userService.ts`)
- **Responsabilité** : Gestion des utilisateurs
- **Fonctionnalités** :
  - Authentification et gestion des sessions
  - CRUD des utilisateurs
  - Vérification d'existence des utilisateurs
  - Gestion des données utilisateur

#### 2. **DocumentService** (`documentService.ts`)
- **Responsabilité** : Gestion des documents
- **Fonctionnalités** :
  - CRUD des documents
  - Partage de documents
  - Récupération des documents partagés
  - Gestion des scores utilisateur

#### 3. **QCMService** (`qcmService.ts`)
- **Responsabilité** : Gestion des QCM
- **Fonctionnalités** :
  - Création et gestion des questions
  - Gestion des choix de réponses
  - Calcul des scores
  - Assignation des questions aux utilisateurs

#### 4. **AIService** (`aiService.ts`)
- **Responsabilité** : Intégration avec l'IA (Gemini)
- **Fonctionnalités** :
  - Génération de QCM à partir de texte
  - Analyse de sentiment
  - Extraction de mots-clés
  - Validation de qualité de texte
  - Génération de résumés

#### 5. **ConfigService** (`configService.ts`)
- **Responsabilité** : Gestion de la configuration
- **Fonctionnalités** :
  - Configuration Gemini
  - Configuration Supabase
  - Paramètres de l'application
  - Validation des variables d'environnement

#### 6. **UtilityService** (`utilityService.ts`)
- **Responsabilité** : Fonctions utilitaires communes
- **Fonctionnalités** :
  - Formatage de dates
  - Validation d'emails
  - Manipulation de texte
  - Génération d'IDs
  - Messages d'erreur

#### 7. **ErrorHandler** (`errorHandler.ts`) 🆕
- **Responsabilité** : Gestion centralisée des erreurs
- **Fonctionnalités** :
  - Capture et transformation des erreurs
  - Notifications d'erreurs
  - Gestion des erreurs par contexte
  - Logging centralisé

#### 8. **CacheService** (`cacheService.ts`) 🆕
- **Responsabilité** : Mise en cache des données
- **Fonctionnalités** :
  - Cache en mémoire avec TTL
  - Nettoyage automatique
  - Invalidation par pattern
  - Optimisation des performances

#### 9. **NotificationService** (`notificationService.ts`) 🆕
- **Responsabilité** : Gestion des notifications utilisateur
- **Fonctionnalités** :
  - Notifications toast
  - Types de notifications (success, error, warning, info)
  - Auto-suppression
  - Notifications spécifiques à l'app

## 🔧 **Intégration**

### **Hook useServices**
```typescript
import { useServices } from '@/lib/hooks/useServices';

function MyComponent() {
  const { 
    userService, 
    documentService, 
    qcmService, 
    aiService, 
    configService, 
    utilityService,
    errorHandler,
    cacheService,
    notificationService
  } = useServices();
  
  // Utilisation des services...
}
```

### **Fichiers Existants Intégrés**
- ✅ `src/lib/gemini/client.ts` - Client Gemini intégré dans AIService
- ✅ `src/lib/prompts/promptTemplate.ts` - Templates utilisés dans AIService
- ✅ `src/lib/supabase.ts` - Configuration Supabase utilisée par tous les services
- ✅ `src/lib/context/SupabaseProvider.tsx` - Provider pour l'injection de dépendances

## 📋 **Avantages de cette Architecture**

### **1. Séparation des Responsabilités**
- Chaque service a une responsabilité claire et unique
- Facilite la maintenance et les tests

### **2. Réutilisabilité**
- Les services peuvent être utilisés dans différents composants
- Logique métier centralisée

### **3. Testabilité**
- Chaque service peut être testé indépendamment
- Mock facile des dépendances

### **4. Évolutivité**
- Ajout facile de nouveaux services
- Modification d'un service sans impacter les autres

### **5. Injection de Dépendances**
- Services injectés via le hook `useServices`
- Configuration centralisée

### **6. Gestion d'Erreurs Centralisée** 🆕
- Capture et traitement uniforme des erreurs
- Logging et monitoring centralisés

### **7. Performance Optimisée** 🆕
- Cache intelligent pour les données fréquentes
- Réduction des appels réseau

### **8. UX Améliorée** 🆕
- Notifications cohérentes et contextuelles
- Feedback utilisateur en temps réel

## 🚀 **Utilisation**

### **Exemple d'utilisation dans un composant**
```typescript
import { useServices } from '@/lib/hooks/useServices';

export function DocumentForm() {
  const { 
    documentService, 
    aiService, 
    utilityService,
    errorHandler,
    notificationService,
    cacheService
  } = useServices();
  
  const handleSubmit = async (data: FormData) => {
    try {
      // Validation avec UtilityService
      if (!utilityService.validateEmail(data.email)) {
        throw errorHandler.handleValidationError('email', 'Email invalide');
      }
      
      // Vérifier le cache
      const cachedDocument = cacheService.get(`document_${data.title}`);
      if (cachedDocument) {
        notificationService.info('Document trouvé en cache', 'Chargement rapide...');
        return cachedDocument;
      }
      
      // Génération de QCM avec AIService
      const qcm = await aiService.generateQCMFromText(data.text, data.title, data.summary);
      
      // Création du document avec DocumentService
      const document = await documentService.createDocument({
        title: data.title,
        content: data.text,
        summary: data.summary,
        owner_id: currentUser.id
      });
      
      // Mettre en cache
      cacheService.set(`document_${document.id}`, document, 300000); // 5 minutes
      
      // Notification de succès
      notificationService.documentCreated(data.title);
      
    } catch (error) {
      const appError = errorHandler.handleError(error, 'document_creation');
      notificationService.error('Erreur', appError.message);
    }
  };
}
```

## 🔄 **Flux de Données**

```
Composant → useServices → Services → Supabase/IA
    ↓           ↓           ↓           ↓
   UI        Injection   Logique    Données
    ↓           ↓           ↓           ↓
Notifications ← Cache ← ErrorHandler ← Logs
```

## 📝 **Conventions**

1. **Nommage** : Services suffixés par `Service`
2. **Méthodes** : Async pour les opérations de base de données
3. **Erreurs** : Gestion centralisée avec messages explicites
4. **Types** : TypeScript strict avec interfaces définies
5. **Documentation** : JSDoc pour toutes les méthodes publiques
6. **Cache** : Utilisation du CacheService pour les données fréquentes
7. **Notifications** : Utilisation du NotificationService pour le feedback

## 🔮 **Évolutions Futures**

- **Analytics Service** : Suivi des métriques utilisateur
- **Export Service** : Export de données en différents formats
- **Real-time Service** : Notifications en temps réel
- **Search Service** : Recherche avancée avec indexation
- **Audit Service** : Traçabilité des actions utilisateur

## 🎯 **Architecture Finale**

```
Services Layer
├── UserService (Gestion utilisateurs)
├── DocumentService (Gestion documents)
├── QCMService (Gestion QCM)
├── AIService (Intégration IA)
├── ConfigService (Configuration)
├── UtilityService (Utilitaires)
├── ErrorHandler (Gestion erreurs) 🆕
├── CacheService (Cache) 🆕
└── NotificationService (Notifications) 🆕

Repositories Layer
├── UserRepository
├── DocumentRepository
└── QCMRepository

Types Layer
├── user.ts
├── document.ts
├── qcm.ts
└── ai.ts

Utils Layer
├── validation.ts
└── formatting.ts
```

Votre application dispose maintenant d'une architecture **complète et professionnelle** ! 🚀 