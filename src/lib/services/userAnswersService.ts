import { SupabaseClient } from '@supabase/supabase-js';

export interface UserAnswer {
  id?: string;
  user_id: string;
  document_id: string;
  question_id: string;
  choice_id: string;
  is_correct: boolean;
  answered_at?: string;
  time_spent?: number;
}

export interface UserAnswerWithDetails extends UserAnswer {
  question: {
    question: string;
    difficulty?: string;
    category?: string;
  };
  choice: {
    choice: string;
    is_correct: boolean;
  };
  all_choices: Array<{
    id: string;
    choice: string;
    is_correct: boolean;
  }>;
}

export class UserAnswersService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sauvegarde les réponses d'un utilisateur
   */
  async saveUserAnswers(answers: UserAnswer[]): Promise<void> {
    const { error } = await this.supabase
      .from('user_answers')
      .insert(answers.map(answer => ({
        user_id: answer.user_id,
        document_id: answer.document_id,
        question_id: answer.question_id,
        choice_id: answer.choice_id,
        is_correct: answer.is_correct,
        time_spent: answer.time_spent,
        answered_at: answer.answered_at || new Date().toISOString()
      })));

    if (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
      throw error;
    }
  }

  /**
   * Récupère les réponses détaillées d'un utilisateur pour un document
   */
  async getUserAnswersWithDetails(userId: string, documentId: string): Promise<UserAnswerWithDetails[]> {
    // Récupérer les réponses de l'utilisateur avec les détails des questions et choix
    const { data: answersData, error } = await this.supabase
      .from('user_answers')
      .select(`
        id,
        question_id,
        choice_id,
        is_correct,
        answered_at,
        time_spent,
        question:qcm_questions(
          question,
          difficulty,
          category
        ),
        choice:qcm_choices(
          choice,
          is_correct
        )
      `)
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .order('answered_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des réponses:', error);
      throw error;
    }

    if (!answersData || answersData.length === 0) {
      return [];
    }

    // Récupérer tous les choix pour chaque question
    const questionIds = [...new Set(answersData.map((a: any) => a.question_id))];
    const { data: allChoicesData } = await this.supabase
      .from('qcm_choices')
      .select('*')
      .in('question_id', questionIds);

    // Organiser les choix par question
    const choicesByQuestion: Record<string, any[]> = {};
    allChoicesData?.forEach((choice: any) => {
      if (!choicesByQuestion[choice.question_id]) {
        choicesByQuestion[choice.question_id] = [];
      }
      choicesByQuestion[choice.question_id].push(choice);
    });

    // Enrichir les réponses avec tous les choix
    const enrichedAnswers = answersData.map((answer: any) => ({
      ...answer,
      all_choices: choicesByQuestion[answer.question_id] || []
    }));

    return enrichedAnswers;
  }

  /**
   * Récupère les statistiques des réponses d'un utilisateur
   */
  async getUserAnswerStats(userId: string, documentId: string) {
    const answers = await this.getUserAnswersWithDetails(userId, documentId);
    
    if (answers.length === 0) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        averageTime: 0,
        score: 0,
        strengths: [],
        weaknesses: []
      };
    }

    const total = answers.length;
    const correct = answers.filter(a => a.is_correct).length;
    const totalTime = answers.reduce((sum, a) => sum + (a.time_spent || 0), 0);
    const averageTime = total > 0 ? Math.round(totalTime / total) : 0;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Analyser les forces et faiblesses par catégorie
    const categoryStats: Record<string, { correct: number; total: number }> = {};
    answers.forEach(answer => {
      const category = answer.question.category || 'Général';
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0 };
      }
      categoryStats[category].total++;
      if (answer.is_correct) {
        categoryStats[category].correct++;
      }
    });

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    Object.entries(categoryStats).forEach(([category, stats]) => {
      const percentage = Math.round((stats.correct / stats.total) * 100);
      if (percentage >= 80) {
        strengths.push(`${category} (${percentage}%)`);
      } else if (percentage <= 50) {
        weaknesses.push(`${category} (${percentage}%)`);
      }
    });

    return {
      totalQuestions: total,
      correctAnswers: correct,
      averageTime,
      score,
      strengths,
      weaknesses
    };
  }

  /**
   * Vérifie si un utilisateur a déjà répondu à un document
   */
  async hasUserAnswered(userId: string, documentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_answers')
      .select('id')
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .limit(1);

    if (error) {
      console.error('Erreur lors de la vérification des réponses:', error);
      return false;
    }

    return data && data.length > 0;
  }

  /**
   * Supprime les réponses d'un utilisateur pour un document (pour permettre de recommencer)
   */
  async deleteUserAnswers(userId: string, documentId: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_answers')
      .delete()
      .eq('user_id', userId)
      .eq('document_id', documentId);

    if (error) {
      console.error('Erreur lors de la suppression des réponses:', error);
      throw error;
    }
  }
} 