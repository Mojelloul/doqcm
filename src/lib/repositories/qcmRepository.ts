import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Question, 
  Choice, 
  CreateQuestionData, 
  CreateChoiceData
} from '../types/qcm';

interface CreateAssignmentData {
  question_id: string;
  employee_id: string;
}

export class QCMRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Crée une nouvelle question
   */
  async createQuestion(questionData: CreateQuestionData): Promise<Question> {
    const { data: question, error } = await this.supabase
      .from('qcm_questions')
      .insert([questionData])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la question:', error);
      throw error;
    }

    if (!question) {
      throw new Error("Erreur lors de la création de la question");
    }

    return question;
  }

  /**
   * Crée des choix pour une question
   */
  async createChoices(choicesData: CreateChoiceData[]): Promise<Choice[]> {
    const { data: choices, error } = await this.supabase
      .from('qcm_choices')
      .insert(choicesData)
      .select();

    if (error) {
      console.error('Erreur lors de la création des choix:', error);
      throw error;
    }

    return choices || [];
  }

  /**
   * Récupère les questions d'un document
   */
  async getQuestionsByDocument(documentId: string): Promise<Question[]> {
    const { data: questions, error } = await this.supabase
      .from('qcm_questions')
      .select('*')
      .eq('document_id', documentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      throw error;
    }

    return questions || [];
  }

  /**
   * Récupère les questions assignées à un utilisateur
   */
  async getQuestionsForUser(documentId: string, userId: string): Promise<Question[]> {
    const { data: questions, error } = await this.supabase
      .from('qcm_questions')
      .select(`
        *,
        qcm_assignments!inner(employee_id)
      `)
      .eq('document_id', documentId)
      .eq('qcm_assignments.employee_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des questions utilisateur:', error);
      throw error;
    }

    return questions || [];
  }

  /**
   * Récupère les choix pour des questions
   */
  async getChoicesForQuestions(questionIds: string[]): Promise<Record<string, Choice[]>> {
    if (questionIds.length === 0) {
      return {};
    }

    const { data: choices, error } = await this.supabase
      .from('qcm_choices')
      .select('*')
      .in('question_id', questionIds)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des choix:', error);
      throw error;
    }

    // Grouper les choix par question_id
    const choicesByQuestion: Record<string, Choice[]> = {};
    choices?.forEach(choice => {
      if (!choicesByQuestion[choice.question_id]) {
        choicesByQuestion[choice.question_id] = [];
      }
      choicesByQuestion[choice.question_id].push(choice);
    });

    return choicesByQuestion;
  }

  /**
   * Assigne des questions à des utilisateurs
   */
  async assignQuestionsToUsers(questions: { id: string }[], users: { id: string }[]): Promise<void> {
    const assignments: CreateAssignmentData[] = [];

    // Créer toutes les combinaisons question-utilisateur
    for (const question of questions) {
      for (const user of users) {
        assignments.push({
          question_id: question.id,
          employee_id: user.id
        });
      }
    }

    if (assignments.length === 0) {
      return;
    }

    const { error } = await this.supabase
      .from('qcm_assignments')
      .insert(assignments);

    if (error) {
      console.error('Erreur lors de l\'assignation des questions:', error);
      throw error;
    }
  }

  /**
   * Récupère le score d'un utilisateur pour un document
   */
  async getUserScoreForDocument(documentId: string, userId: string): Promise<number | null> {
    const { data: score, error } = await this.supabase
      .from('employees_documents')
      .select('score')
      .match({ 
        employee_id: userId,
        document_id: documentId
      })
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error("Erreur lors de la récupération du score:", error);
      throw error;
    }

    return score?.score || null;
  }

  /**
   * Enregistre le score d'un utilisateur
   */
  async saveUserScore(documentId: string, userId: string, score: number): Promise<void> {
    // Essayer de mettre à jour d'abord
    const { data: updateData, error: updateError } = await this.supabase
      .from('employees_documents')
      .update({ score })
      .match({ 
        employee_id: userId,
        document_id: documentId
      })
      .select();

    if (updateError) {
      console.error("Erreur lors de l'enregistrement du score:", updateError);
      throw new Error("Erreur lors de l'enregistrement du score");
    }

    // Si aucune ligne n'a été mise à jour, insérer
    if (!updateData || updateData.length === 0) {
      const { error: insertError } = await this.supabase
        .from('employees_documents')
        .insert([{ 
          employee_id: userId,
          document_id: documentId,
          score
        }]);

      if (insertError) {
        console.error("Erreur lors de l'insertion du score:", insertError);
        throw new Error("Erreur lors de l'insertion du score");
      }
    }
  }

  /**
   * Partage un document avec des utilisateurs
   */
  async shareDocument(documentId: string, userIds: string[]): Promise<void> {
    if (!documentId || !userIds || userIds.length === 0) {
      throw new Error('Paramètres de partage invalides');
    }

    const sharingData = userIds.map(userId => ({
      employee_id: userId,
      document_id: documentId
    }));

    const { error } = await this.supabase
      .from("employees_documents")
      .insert(sharingData);

    if (error) {
      console.error('Erreur lors du partage du document:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un document
   */
  async getDocumentStats(documentId: string): Promise<{
    totalQuestions: number;
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    completionRate: number;
    sharedCount: number;
  }> {
    // Récupérer le nombre de questions
    const { data: questions } = await this.supabase
      .from('qcm_questions')
      .select('id')
      .eq('document_id', documentId);

    // Récupérer les scores
    const { data: scores, error } = await this.supabase
      .from('employees_documents')
      .select('score')
      .eq('document_id', documentId)
      .not('score', 'is', null);

    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }

    const totalQuestions = questions?.length || 0;
    const totalAttempts = scores?.length || 0;
    const averageScore = scores && scores.length > 0 
      ? scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length 
      : 0;
    const bestScore = scores && scores.length > 0 
      ? Math.max(...scores.map(s => s.score || 0))
      : 0;
    const completionRate = totalQuestions > 0 ? (totalAttempts / totalQuestions) * 100 : 0;

    return {
      totalQuestions,
      totalAttempts,
      averageScore,
      bestScore,
      completionRate,
      sharedCount: totalAttempts
    };
  }

  /**
   * Vérifie si un utilisateur a accès à un document
   */
  async checkDocumentAccess(documentId: string, userId: string): Promise<{
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canShare: boolean;
  }> {
    // Vérifier si l'utilisateur est propriétaire
    const { data: document } = await this.supabase
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (document?.owner_id === userId) {
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canShare: true
      };
    }

    // Vérifier si l'utilisateur a accès via le partage
    const { data: share } = await this.supabase
      .from('employees_documents')
      .select('employee_id')
      .match({ document_id: documentId, employee_id: userId })
      .single();

    if (share) {
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canShare: false
      };
    }

    return {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canShare: false
    };
  }
} 