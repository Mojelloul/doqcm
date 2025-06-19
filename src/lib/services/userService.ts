import { SupabaseClient } from '@supabase/supabase-js';
import { 
  User, 
  UserData, 
  CreateUserData, 
  UpdateUserData, 
  UserScore, 
  UserStats, 
  UserSession, 
  UserPreferences, 
  EmailValidation, 
  AuthData, 
  UserError 
} from '../types/user';
import { Document, DocumentWithRelations } from '../types/document';
import { Question, QCMSession } from '../types/qcm';

export class UserService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    } catch (error) {
      console.error('Erreur dans getCurrentUser:', error);
      return null;
    }
  }

  /**
   * Vérifie si l'utilisateur est connecté
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Récupère les données d'authentification complètes
   */
  async getAuthData(): Promise<AuthData> {
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      throw new Error('Erreur lors de la récupération de la session');
    }

    const user = session?.user ? {
      id: session.user.id,
      email: session.user.email || '',
      created_at: session.user.created_at,
      updated_at: session.user.updated_at
    } : null;

    return {
      user,
      session,
      loading: false
    };
  }

  /**
   * Crée un nouvel utilisateur
   */
  async createUser(userData: CreateUserData): Promise<User> {
    const { data: user, error } = await this.supabase.auth.signUp({
      email: userData.email,
      password: 'temporary-password', // À remplacer par une vraie gestion de mot de passe
    });

    if (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }

    if (!user.user) {
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }

    return {
      id: user.user.id,
      email: user.user.email || '',
      created_at: user.user.created_at,
      updated_at: user.user.updated_at
    };
  }

  /**
   * Met à jour un utilisateur
   */
  async updateUser(userId: string, updateData: UpdateUserData): Promise<User> {
    const { data: user, error } = await this.supabase.auth.updateUser({
      email: updateData.email,
    });

    if (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }

    if (!user.user) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }

    return {
      id: user.user.id,
      email: user.user.email || '',
      created_at: user.user.created_at,
      updated_at: user.user.updated_at
    };
  }

  /**
   * Valide une adresse email
   */
  validateEmail(email: string): EmailValidation {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      isValid,
      message: isValid ? undefined : 'Adresse email invalide'
    };
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Récupérer les documents créés
      const { data: documents } = await this.supabase
        .from('documents')
        .select('id')
        .eq('owner_id', userId);

      // Récupérer les documents partagés
      const { data: sharedDocuments } = await this.supabase
        .from('employees_documents')
        .select('document_id')
        .eq('employee_id', userId);

      // Récupérer les scores
      const { data: scores } = await this.supabase
        .from('employees_documents')
        .select('score')
        .eq('employee_id', userId)
        .not('score', 'is', null);

      // Calculer les statistiques
      const totalDocuments = documents?.length || 0;
      const totalSharedDocuments = sharedDocuments?.length || 0;
      const totalQCMsTaken = scores?.length || 0;
      
      const averageScore = scores && scores.length > 0 
        ? scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length 
        : 0;
      
      const bestScore = scores && scores.length > 0 
        ? Math.max(...scores.map(s => s.score || 0))
        : 0;

      return {
        totalDocuments,
        totalSharedDocuments,
        totalQCMsTaken,
        averageScore,
        bestScore,
        documentsCreated: totalDocuments
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw new Error('Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * Récupère les scores d'un utilisateur
   */
  async getUserScores(userId: string): Promise<UserScore[]> {
    const { data: scores, error } = await this.supabase
      .from('employees_documents')
      .select(`
        id,
        employee_id,
        document_id,
        score,
        created_at,
        documents (
          title
        )
      `)
      .eq('employee_id', userId)
      .not('score', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des scores:', error);
      throw new Error('Erreur lors de la récupération des scores');
    }

    return scores?.map(score => ({
      id: score.id,
      user_id: score.employee_id,
      document_id: score.document_id,
      score: score.score,
      created_at: score.created_at
    })) || [];
  }

  /**
   * Récupère la session utilisateur
   */
  async getUserSession(): Promise<UserSession | null> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      return null;
    }

    const { data: { session } } = await this.supabase.auth.getSession();
    
    return {
      user,
      isAuthenticated: true,
      lastLogin: session?.access_token ? new Date().toISOString() : undefined
    };
  }

  /**
   * Déconnecte l'utilisateur
   */
  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    
    if (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw new Error('Erreur lors de la déconnexion');
    }
  }

  /**
   * Télécharge toutes les données de l'utilisateur
   */
  async downloadUserData(): Promise<UserData> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour télécharger vos données");
    }
    
    try {
      // Récupérer tous les documents de l'utilisateur
      const { data: documents } = await this.supabase
        .from("documents")
        .select("*")
        .eq("owner_id", user.id);
        
      // Récupérer les documents partagés avec l'utilisateur
      const { data: sharedDocuments } = await this.supabase
        .from("employees_documents")
        .select(`
          documents (
            id,
            title,
            content,
            summary,
            owner_id,
            created_at
          )
        `)
        .eq("employee_id", user.id);
        
      // Récupérer les QCM
      const { data: qcmQuestions } = await this.supabase
        .from("qcm_questions")
        .select(`
          id, 
          question, 
          document_id,
          created_at,
          qcm_choices (
            id,
            choice,
            is_correct
          )
        `)
        .in(
          "document_id", 
          documents ? documents.map(doc => doc.id) : []
        );

      // Récupérer les scores
      const scores = await this.getUserScores(user.id);
      
      // Extraire les documents partagés de la structure Supabase
      const sharedDocs: Document[] = [];
      if (sharedDocuments) {
        sharedDocuments.forEach(sd => {
          if (sd.documents && Array.isArray(sd.documents)) {
            sharedDocs.push(...sd.documents);
          } else if (sd.documents) {
            sharedDocs.push(sd.documents);
          }
        });
      }
      
      return {
        user,
        documents: documents || [],
        sharedDocuments: sharedDocs,
        qcmQuestions: qcmQuestions || [],
        scores
      };
    } catch (error) {
      console.error('Erreur lors du téléchargement des données:', error);
      throw new Error('Erreur lors du téléchargement des données');
    }
  }

  /**
   * Supprime le compte utilisateur et toutes ses données
   */
  async deleteAccount(): Promise<void> {
    const user = await this.getCurrentUser();
    
    if (!user) {
      throw new Error("Vous devez être connecté pour supprimer votre compte");
    }
    
    try {
      // Supprimer les documents et données associées (les triggers SQL s'occupent de supprimer les données liées)
      const { error: documentsError } = await this.supabase
        .from("documents")
        .delete()
        .eq("owner_id", user.id);
        
      if (documentsError) throw documentsError;
      
      // Supprimer les partages
      const { error: sharesError } = await this.supabase
        .from("employees_documents")
        .delete()
        .eq("employee_id", user.id);
        
      if (sharesError) throw sharesError;
      
      // Déconnecter l'utilisateur
      await this.signOut();
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw new Error('Erreur lors de la suppression du compte');
    }
  }

  /**
   * Vérifie si des utilisateurs existent par leurs emails
   */
  async checkUsersExist(emails: string[]): Promise<Array<{ id: string; email: string }>> {
    try {
      console.log("UserService.checkUsersExist - Emails à vérifier:", emails);
      
      if (emails.length === 0) {
        console.log("UserService.checkUsersExist - Liste d'emails vide");
        return [];
      }

      const { data: existingUsers, error } = await this.supabase
        .from('users')
        .select('id, email')
        .in('email', emails);

      console.log("UserService.checkUsersExist - Résultat de la requête:", { existingUsers, error });

      if (error) {
        console.error("Erreur lors de la vérification des utilisateurs:", error);
        throw new Error(`Erreur lors de la vérification des utilisateurs: ${error.message}`);
      }

      console.log("UserService.checkUsersExist - Utilisateurs trouvés:", existingUsers);
      return existingUsers || [];
    } catch (error) {
      console.error('Erreur dans checkUsersExist:', error);
      throw error;
    }
  }

  /**
   * Recherche des utilisateurs par email
   */
  async searchUsersByEmail(emailQuery: string, limit: number = 10): Promise<User[]> {
    const { data: users, error } = await this.supabase
      .from('auth.users')
      .select('id, email, created_at')
      .ilike('email', `%${emailQuery}%`)
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw new Error('Erreur lors de la recherche d\'utilisateurs');
    }

    return users?.map(user => ({
      id: user.id,
      email: user.email || '',
      created_at: user.created_at
    })) || [];
  }

  /**
   * Gère les erreurs utilisateur
   */
  handleUserError(error: any): UserError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'Une erreur inconnue s\'est produite',
      field: error.field
    };
  }
} 