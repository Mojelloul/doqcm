import { SupabaseClient } from '@supabase/supabase-js';
import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserScore, 
  UserStats,
  EmailValidation
} from '../types/user';

export class UserRepository {
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
        score,
        created_at,
        document_id
      `)
      .eq('employee_id', userId)
      .not('score', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des scores:', error);
      throw error;
    }

    return scores?.map(score => ({
      id: score.id,
      user_id: userId,
      document_id: score.document_id,
      score: score.score || 0,
      created_at: score.created_at
    })) || [];
  }

  /**
   * Vérifie si des utilisateurs existent par leurs emails
   */
  async checkUsersExist(emails: string[]): Promise<Array<{ id: string; email: string }>> {
    if (emails.length === 0) {
      return [];
    }

    const { data: users, error } = await this.supabase
      .from('users')
      .select('id, email')
      .in('email', emails);

    if (error) {
      console.error('Erreur lors de la vérification des utilisateurs:', error);
      throw error;
    }

    return users || [];
  }

  /**
   * Recherche des utilisateurs par email
   */
  async searchUsersByEmail(emailQuery: string, limit: number = 10): Promise<User[]> {
    const { data: users, error } = await this.supabase
      .from('users')
      .select('*')
      .ilike('email', `%${emailQuery}%`)
      .limit(limit)
      .order('email', { ascending: true });

    if (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw error;
    }

    return users || [];
  }

  /**
   * Récupère un utilisateur par son ID
   */
  async getUserById(userId: string): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }

    return user;
  }

  /**
   * Récupère un utilisateur par son email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw error;
    }

    return user;
  }

  /**
   * Supprime un compte utilisateur
   */
  async deleteAccount(userId: string): Promise<void> {
    const { error } = await this.supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      throw new Error('Erreur lors de la suppression du compte');
    }
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
} 