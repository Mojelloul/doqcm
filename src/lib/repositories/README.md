# Repositories

Cette couche Repository gère l'accès aux données et sépare la logique métier de l'accès à la base de données.

## Architecture

```
src/lib/repositories/
├── documentRepository.ts  # Accès aux données des documents
├── qcmRepository.ts       # Accès aux données des QCM
├── userRepository.ts      # Accès aux données des utilisateurs
├── index.ts              # Exports des repositories
└── README.md             # Documentation
```

## Repositories disponibles

### DocumentRepository

Gère l'accès aux données de la table `documents`.

**Méthodes principales :**
- `getUserDocuments()` - Récupère les documents d'un utilisateur
- `getDocumentById()` - Récupère un document par son ID
- `createDocument()` - Crée un nouveau document
- `updateDocument()` - Met à jour un document
- `deleteDocument()` - Supprime un document
- `searchDocuments()` - Recherche des documents
- `documentExists()` - Vérifie si un document existe
- `getDocumentOwner()` - Récupère le propriétaire d'un document

### QCMRepository

Gère l'accès aux données des tables `qcm_questions`, `qcm_choices`, `qcm_assignments` et `employees_documents`.

**Méthodes principales :**
- `createQuestion()` - Crée une nouvelle question
- `createChoices()` - Crée des choix pour une question
- `getQuestionsByDocument()` - Récupère les questions d'un document
- `getQuestionsForUser()` - Récupère les questions assignées à un utilisateur
- `getChoicesForQuestions()` - Récupère les choix pour des questions
- `assignQuestionsToUsers()` - Assigne des questions à des utilisateurs
- `getUserScoreForDocument()` - Récupère le score d'un utilisateur
- `saveUserScore()` - Enregistre le score d'un utilisateur
- `shareDocument()` - Partage un document avec des utilisateurs
- `getDocumentStats()` - Récupère les statistiques d'un document
- `checkDocumentAccess()` - Vérifie les permissions d'accès

### UserRepository

Gère l'accès aux données des utilisateurs et l'authentification.

**Méthodes principales :**
- `getCurrentUser()` - Récupère l'utilisateur connecté
- `isAuthenticated()` - Vérifie si l'utilisateur est connecté
- `createUser()` - Crée un nouvel utilisateur
- `updateUser()` - Met à jour un utilisateur
- `validateEmail()` - Valide une adresse email
- `getUserStats()` - Récupère les statistiques d'un utilisateur
- `getUserScores()` - Récupère les scores d'un utilisateur
- `checkUsersExist()` - Vérifie si des utilisateurs existent
- `searchUsersByEmail()` - Recherche des utilisateurs par email
- `getUserById()` - Récupère un utilisateur par son ID
- `getUserByEmail()` - Récupère un utilisateur par son email
- `deleteAccount()` - Supprime un compte utilisateur
- `signOut()` - Déconnecte l'utilisateur

## Utilisation

### Hook useRepositories

```typescript
import { useRepositories } from '@/lib/hooks/useRepositories';

function MyComponent() {
  const { documentRepository, qcmRepository, userRepository } = useRepositories();

  // Utiliser les repositories
  const handleCreateDocument = async () => {
    const document = await documentRepository.createDocument({
      title: 'Mon document',
      content: 'Contenu...',
      summary: 'Résumé...',
      owner_id: 'user-id'
    });
  };

  return <div>...</div>;
}
```

### Utilisation directe

```typescript
import { DocumentRepository } from '@/lib/repositories';
import { supabase } from '@/lib/supabase';

const documentRepository = new DocumentRepository(supabase);
const documents = await documentRepository.getUserDocuments('user-id');
```

## Avantages

1. **Séparation des responsabilités** : L'accès aux données est séparé de la logique métier
2. **Testabilité** : Les repositories peuvent être facilement mockés pour les tests
3. **Maintenabilité** : Code plus organisé et facile à maintenir
4. **Réutilisabilité** : Les repositories peuvent être utilisés dans différents services
5. **Type safety** : TypeScript assure la cohérence des types

## Prochaines étapes

1. **Mise à jour des services** : Adapter les services pour utiliser les repositories
2. **Tests unitaires** : Créer des tests pour chaque repository
3. **Cache** : Implémenter un système de cache pour optimiser les performances
4. **Transactions** : Ajouter la gestion des transactions pour les opérations complexes 