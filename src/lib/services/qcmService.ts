import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Question, 
  Choice, 
  QCMResponse, 
  QCMScore, 
  UserAnswer, 
  CreateQuestionData, 
  CreateChoiceData,
  QCMSession,
  QCMStats,
  QCMValidation,
  QCMReport,
  QCMConfig,
  QCMGenerationParams,
  QCMPerformance,
  QuestionWithChoices
} from '../types/qcm';
import { AIService } from './aiService';
import { Document } from '../types/document';
import { User } from '../types/user';

// Types locaux pour les fonctionnalités étendues
interface QCMTemplate {
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  estimatedTime: number;
  questions: Array<{
    question: string;
    choices: Array<{
      choice: string;
      is_correct: boolean;
    }>;
  }>;
}

interface QCMExport {
  content: string;
  mimeType: string;
  filename: string;
  size: number;
}

interface QCMAnalytics {
  questionStats: Record<string, { correct: number; total: number; percentage: number }>;
  userStats: Record<string, { correct: number; total: number; percentage: number }>;
  totalAnswers: number;
  averageScore: number;
}

interface QCMFeedback {
  id: string;
  user_id: string;
  user_email: string;
  document_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export class QCMService {
  private aiService: AIService;

  constructor(
    private supabase: SupabaseClient,
    aiService?: AIService
  ) {
    this.aiService = aiService || new AIService();
  }

  /**
   * Récupère les questions QCM d'un document pour un utilisateur
   */
  async getQuestionsForUser(documentId: string, userId: string): Promise<Question[]> {
    const { data: questionsData, error } = await this.supabase
      .from('qcm_questions')
      .select(`
        *,
        users_questions!inner (
          user_id
        )
      `)
      .eq('document_id', documentId)
      .eq('users_questions.user_id', userId);

    if (error) {
      console.error('Erreur lors de la récupération des questions:', error);
      throw error;
    }

    return questionsData || [];
  }

  /**
   * Récupère toutes les questions d'un document
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
   * Récupère les choix pour des questions
   */
  async getChoicesForQuestions(questionIds: string[]): Promise<Record<string, Choice[]>> {
    if (questionIds.length === 0) {
      return {};
    }

    const { data: choicesData, error } = await this.supabase
      .from('qcm_choices')
      .select('*')
      .in('question_id', questionIds);
      
    if (error) {
      console.error('Erreur lors de la récupération des choix:', error);
      throw error;
    }
    
    // Organiser les choix par question_id
    const choicesByQuestion: Record<string, Choice[]> = {};
    
    if (choicesData) {
      choicesData.forEach((choice: Choice) => {
        if (!choicesByQuestion[choice.question_id]) {
          choicesByQuestion[choice.question_id] = [];
        }
        choicesByQuestion[choice.question_id].push(choice);
      });
    }
    
    return choicesByQuestion;
  }

  /**
   * Crée une question QCM
   */
  async createQuestion(questionData: CreateQuestionData): Promise<Question> {
    try {
      console.log("QCMService.createQuestion - Données reçues:", {
        document_id: questionData.document_id,
        questionLength: questionData.question.length,
        difficulty: questionData.difficulty,
        category: questionData.category
      });

      const { data: question, error } = await this.supabase
        .from("qcm_questions")
        .insert([questionData])
        .select()
        .single();

      console.log("QCMService.createQuestion - Résultat de la requête:", { question, error });

      if (error) {
        console.error('Erreur lors de la création de la question:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        });
        throw new Error(`Erreur lors de la création de la question: ${error.message || 'Erreur inconnue'}`);
      }

      if (!question) {
        throw new Error("Erreur lors de la création de la question: Aucune question retournée");
      }

      console.log("QCMService.createQuestion - Question créée avec succès:", question.id);
      return question;
    } catch (error) {
      console.error('Erreur générale dans createQuestion:', error);
      throw error;
    }
  }

  /**
   * Met à jour une question QCM
   */
  async updateQuestion(questionId: string, updateData: Partial<Question>): Promise<Question> {
    const { data: question, error } = await this.supabase
      .from("qcm_questions")
      .update(updateData)
      .eq("id", questionId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour de la question:', error);
      throw error;
    }

    if (!question) {
      throw new Error("Question non trouvée");
    }

    return question;
  }

  /**
   * Supprime une question QCM
   */
  async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("qcm_choices")
      .delete()
      .eq("question_id", questionId);

    if (error) {
      console.error('Erreur lors de la suppression des choix:', error);
      throw error;
    }

    const { error: questionError } = await this.supabase
      .from("qcm_questions")
      .delete()
      .eq("id", questionId);

    if (questionError) {
      console.error('Erreur lors de la suppression de la question:', questionError);
      throw questionError;
    }
  }

  /**
   * Crée des choix pour une question
   */
  async createChoices(choicesData: CreateChoiceData[]): Promise<void> {
    try {
      console.log("QCMService.createChoices - Données reçues:", {
        numberOfChoices: choicesData.length,
        choices: choicesData.map(c => ({
          question_id: c.question_id,
          choiceLength: c.choice.length,
          is_correct: c.is_correct
        }))
      });

      const { error } = await this.supabase
        .from("qcm_choices")
        .insert(choicesData);

      console.log("QCMService.createChoices - Résultat de la requête:", { error });

      if (error) {
        console.error('Erreur lors de la création des choix:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        });
        throw new Error(`Erreur lors de la création des choix: ${error.message || 'Erreur inconnue'}`);
      }

      console.log("QCMService.createChoices - Choix créés avec succès");
    } catch (error) {
      console.error('Erreur générale dans createChoices:', error);
      throw error;
    }
  }

  /**
   * Met à jour un choix
   */
  async updateChoice(choiceId: string, updateData: Partial<Choice>): Promise<Choice> {
    const { data: choice, error } = await this.supabase
      .from("qcm_choices")
      .update(updateData)
      .eq("id", choiceId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du choix:', error);
      throw error;
    }

    if (!choice) {
      throw new Error("Choix non trouvé");
    }

    return choice;
  }

  /**
   * Supprime un choix
   */
  async deleteChoice(choiceId: string): Promise<void> {
    const { error } = await this.supabase
      .from("qcm_choices")
      .delete()
      .eq("id", choiceId);

    if (error) {
      console.error('Erreur lors de la suppression du choix:', error);
      throw error;
    }
  }

  /**
   * Génère un QCM à partir d'un texte avec l'IA
   */
  async generateQCMFromText(text: string, title: string, summary: string): Promise<QCMResponse> {
    try {
      console.log("QCMService: Starting QCM generation for document:", title);
      const result = await this.aiService.generateQCMFromText(text, title, summary);
      console.log("QCMService: QCM generation completed successfully");
      return result;
    } catch (error) {
      console.error("Erreur lors de la génération du QCM:", error);
      
      // Préserver le message d'erreur original si disponible
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la génération du QCM: ${error.message}`);
      }
      
      throw new Error("Impossible de générer le QCM. Veuillez réessayer.");
    }
  }

  /**
   * Génère un QCM à partir d'un template
   */
  async generateQCMFromTemplate(template: QCMTemplate, document: Document): Promise<QCMResponse> {
    const questions: Question[] = [];
    const choices: CreateChoiceData[] = [];

    // Créer les questions selon le template
    for (let i = 0; i < template.questionCount; i++) {
      const questionData: CreateQuestionData = {
        question: template.questions[i]?.question || `Question ${i + 1}`,
        document_id: document.id,
        difficulty: template.difficulty || 'medium',
        category: template.category || 'general'
      };

      const question = await this.createQuestion(questionData);
      questions.push(question);

      // Créer les choix pour cette question
      const questionChoices = template.questions[i]?.choices || [];
      const choiceData: CreateChoiceData[] = questionChoices.map((choice: any) => ({
        question_id: question.id,
        choice: choice.choice,
        is_correct: choice.is_correct
      }));

      choices.push(...choiceData);
    }

    await this.createChoices(choices);

    return {
      qcm: questions.map(q => ({
        question: q.question,
        choices: { A: '', B: '', C: '' },
        correct_answer: 'A' as const,
        justification: ''
      }))
    };
  }

  /**
   * Calcule le score d'un QCM
   */
  calculateScore(
    questions: Question[], 
    choicesByQuestion: Record<string, Choice[]>, 
    selectedAnswers: Record<string, string>
  ): QCMScore {
    let correctAnswers = 0;
    
    questions.forEach(question => {
      const selectedChoiceId = selectedAnswers[question.id];
      const isCorrect = selectedChoiceId ? 
        choicesByQuestion[question.id]?.find(c => c.id === selectedChoiceId)?.is_correct || false : 
        false;
      
      if (isCorrect) {
        correctAnswers++;
      }
    });

    const percentage = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;
    
    return {
      correct: correctAnswers,
      total: questions.length,
      percentage
    };
  }

  /**
   * Valide les réponses d'un QCM
   */
  validateQCMAnswers(questions: Question[], selectedAnswers: Record<string, string>): QCMValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    // Vérifier que toutes les questions ont une réponse
    const answeredQuestions = Object.keys(selectedAnswers).length;
    if (answeredQuestions < questions.length) {
      errors.push(`Vous devez répondre à toutes les questions (${answeredQuestions}/${questions.length})`);
      isValid = false;
    }

    // Vérifier que les réponses sont valides
    questions.forEach(question => {
      const answer = selectedAnswers[question.id];
      if (answer && answer.trim() === '') {
        warnings.push(`Question "${question.question.substring(0, 50)}..." : réponse vide`);
      }
    });

    return {
      isValid,
      errors,
      warnings,
      suggestions: []
    };
  }

  /**
   * Vérifie si toutes les questions ont une réponse
   */
  validateAnswers(questions: Question[], selectedAnswers: Record<string, string>): boolean {
    const answeredQuestions = Object.keys(selectedAnswers).length;
    return answeredQuestions >= questions.length;
  }

  /**
   * Crée des questions pour des utilisateurs (sélection aléatoire)
   */
  async assignQuestionsToUsers(
    questions: Array<{ id: string }>, 
    users: Array<{ id: string; email: string }>,
    questionsPerUser: number = 3
  ): Promise<void> {
    const questionsForUsers = users.map((user) => {
      // Mélanger les questions et prendre les premières
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5).slice(0, questionsPerUser);
      
      // Créer les entrées pour users_questions
      return shuffledQuestions.map(question => ({
        user_id: user.id,
        question_id: question.id
      }));
    }).flat(); // Aplatir le tableau pour avoir toutes les entrées

    // Insérer les questions pour chaque utilisateur
    const { error } = await this.supabase
      .from("users_questions")
      .insert(questionsForUsers);

    if (error) {
      console.error('Erreur lors de l\'assignation des questions:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde les réponses d'un utilisateur
   */
  async saveUserAnswers(userId: string, documentId: string, answers: UserAnswer[]): Promise<void> {
    const { error } = await this.supabase
      .from("user_answers")
      .insert(answers.map(answer => ({
        user_id: userId,
        document_id: documentId,
        question_id: answer.questionId,
        choice_id: answer.choiceId,
        answered_at: new Date().toISOString()
      })));

    if (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques d'un QCM
   */
  async getQCMStats(documentId: string): Promise<QCMStats> {
    const { data: questions } = await this.supabase
      .from('qcm_questions')
      .select('id')
      .eq('document_id', documentId);

    const { data: answers } = await this.supabase
      .from('user_answers')
      .select('is_correct')
      .eq('document_id', documentId);

    const totalQuestions = questions?.length || 0;
    const totalAnswers = answers?.length || 0;
    const correctAnswers = answers?.filter(a => a.is_correct).length || 0;
    const averageScore = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

    return {
      totalQuestions,
      totalAttempts: totalAnswers,
      averageScore,
      bestScore: averageScore, // À améliorer avec une vraie logique
      completionRate: totalQuestions > 0 ? (totalAnswers / totalQuestions) * 100 : 0,
      averageTime: 0, // À implémenter
      difficultyDistribution: {
        easy: 0,
        medium: 0,
        hard: 0
      }
    };
  }

  /**
   * Exporte un QCM
   */
  async exportQCM(documentId: string, format: 'json' | 'csv' = 'json'): Promise<QCMExport> {
    const questions = await this.getQuestionsByDocument(documentId);
    const choicesByQuestion = await this.getChoicesForQuestions(questions.map(q => q.id));

    let content: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify({
        questions: questions.map(q => ({
          ...q,
          choices: choicesByQuestion[q.id] || []
        }))
      }, null, 2);
      mimeType = 'application/json';
    } else {
      // Format CSV
      const csvRows = ['Question,Choix,Correct'];
      questions.forEach(q => {
        const questionChoices = choicesByQuestion[q.id] || [];
        questionChoices.forEach(choice => {
          csvRows.push(`"${q.question}","${choice.choice}",${choice.is_correct ? 'Oui' : 'Non'}`);
        });
      });
      content = csvRows.join('\n');
      mimeType = 'text/csv';
    }

    return {
      content,
      mimeType,
      filename: `qcm_${documentId}.${format}`,
      size: content.length
    };
  }

  /**
   * Récupère les rapports d'analyse d'un QCM
   */
  async getQCMAnalytics(documentId: string): Promise<QCMAnalytics> {
    const { data: answers } = await this.supabase
      .from('user_answers')
      .select(`
        question_id,
        is_correct,
        users (
          email
        )
      `)
      .eq('document_id', documentId);

    const questionStats: Record<string, { correct: number; total: number; percentage: number }> = {};
    const userStats: Record<string, { correct: number; total: number; percentage: number }> = {};

    answers?.forEach(answer => {
      // Statistiques par question
      if (!questionStats[answer.question_id]) {
        questionStats[answer.question_id] = { correct: 0, total: 0, percentage: 0 };
      }
      questionStats[answer.question_id].total++;
      if (answer.is_correct) {
        questionStats[answer.question_id].correct++;
      }

      // Statistiques par utilisateur
      const userEmail = (answer.users as any)?.email || 'unknown';
      if (!userStats[userEmail]) {
        userStats[userEmail] = { correct: 0, total: 0, percentage: 0 };
      }
      userStats[userEmail].total++;
      if (answer.is_correct) {
        userStats[userEmail].correct++;
      }
    });

    // Calculer les pourcentages
    Object.values(questionStats).forEach(stat => {
      stat.percentage = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
    });

    Object.values(userStats).forEach(stat => {
      stat.percentage = stat.total > 0 ? (stat.correct / stat.total) * 100 : 0;
    });

    return {
      questionStats,
      userStats,
      totalAnswers: answers?.length || 0,
      averageScore: answers && answers.length > 0 ? 
        (answers.filter(a => a.is_correct).length / answers.length) * 100 : 0
    };
  }

  /**
   * Récupère les feedbacks d'un QCM
   */
  async getQCMFeedback(documentId: string): Promise<QCMFeedback[]> {
    const { data: feedbacks, error } = await this.supabase
      .from('qcm_feedback')
      .select(`
        id,
        user_id,
        document_id,
        rating,
        comment,
        created_at,
        users (
          email
        )
      `)
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des feedbacks:', error);
      throw error;
    }

    return feedbacks?.map(feedback => ({
      id: feedback.id,
      user_id: feedback.user_id,
      user_email: (feedback.users as any)?.email || '',
      document_id: feedback.document_id,
      rating: feedback.rating,
      comment: feedback.comment,
      created_at: feedback.created_at
    })) || [];
  }

  /**
   * Sauvegarde un feedback QCM
   */
  async saveQCMFeedback(feedback: Omit<QCMFeedback, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('qcm_feedback')
      .insert([{
        user_id: feedback.user_id,
        document_id: feedback.document_id,
        rating: feedback.rating,
        comment: feedback.comment
      }]);

    if (error) {
      console.error('Erreur lors de la sauvegarde du feedback:', error);
      throw error;
    }
  }
} 