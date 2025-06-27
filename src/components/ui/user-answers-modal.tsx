"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface UserAnswer {
  id: string;
  question_id?: string;
  choice_id?: string;
  is_correct: boolean;
  answered_at?: string;
  time_spent?: number;
  score?: number;
  created_at?: string;
  updated_at?: string;
  question: {
    question: string;
  };
  choice: {
    choice: string;
    is_correct: boolean;
  };
  all_choices?: Array<{
    id: string;
    choice: string;
    is_correct: boolean;
  }>;
}

interface UserAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userEmail: string;
  documentId: string;
  supabase: any;
}

export default function UserAnswersModal({
  isOpen,
  onClose,
  userId,
  userEmail,
  documentId,
  supabase
}: UserAnswersModalProps) {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    correctAnswers: 0,
    averageTime: 0,
    score: 0,
    strengths: [] as string[],
    weaknesses: [] as string[]
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId && documentId) {
      fetchUserAnswers();
    }
  }, [isOpen, userId, documentId]);

  const fetchUserAnswers = async () => {
    if (!userId || !documentId) {
      console.log('❌ IDs manquants:', { userId, documentId });
      return;
    }

    console.log('🔍 Début de fetchUserAnswers:', { userId, documentId });
    console.log('🔍 Types des IDs:', { 
      userIdType: typeof userId, 
      documentIdType: typeof documentId,
      userIdLength: userId?.length,
      documentIdLength: documentId?.length
    });

    setIsLoading(true);
    try {
      // Utiliser user_answers pour les réponses détaillées
      const { data: answersData, error } = await supabase
        .from('user_answers')
        .select(`
          id,
          question_id,
          choice_id,
          is_correct,
          answered_at,
          time_spent,
          question:qcm_questions(
            question
          ),
          choice:qcm_choices(
            choice,
            is_correct
          )
        `)
        .eq('user_id', userId)
        .eq('document_id', documentId)
        .order('answered_at', { ascending: true })
        .limit(50); // Limiter à 50 réponses maximum

      console.log('📊 Réponses récupérées:', { answersData, error });
      console.log('🔍 Requête exécutée avec:', { userId, documentId });

      if (error) {
        console.error('❌ Erreur lors de la récupération:', error);
        setError(error.message);
        return;
      }

      if (!answersData || answersData.length === 0) {
        console.log('ℹ️ Aucune réponse trouvée pour cet utilisateur');
        console.log('ℹ️ Vérifiez les IDs:', { userId, documentId });
        setAnswers([]);
        setError(null);
        calculateStats([]);
        return;
      }

      console.log('✅ Réponses trouvées:', answersData.length);
      
      // Dédupliquer les réponses (garder seulement la plus récente pour chaque question)
      const uniqueAnswers = answersData.reduce((acc: any[], answer: any) => {
        const existingIndex = acc.findIndex(a => a.question_id === answer.question_id);
        if (existingIndex === -1) {
          acc.push(answer);
        } else {
          // Garder la réponse la plus récente
          const existing = acc[existingIndex];
          if (new Date(answer.answered_at) > new Date(existing.answered_at)) {
            acc[existingIndex] = answer;
          }
        }
        return acc;
      }, []);
      
      console.log('✅ Réponses uniques après déduplication:', uniqueAnswers.length);
      
      setAnswers(uniqueAnswers);
      setError(null);
      calculateStats(uniqueAnswers);
    } catch (error) {
      console.error('💥 Erreur générale:', error);
      setError('Erreur lors de la récupération des données');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (userAnswers: UserAnswer[]) => {
    const total = userAnswers.length;
    const correct = userAnswers.filter(a => a.is_correct).length;
    const totalTime = userAnswers.reduce((sum, a) => sum + (a.time_spent || 0), 0);
    const averageTime = total > 0 ? Math.round(totalTime / total) : 0;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    // Pour l'instant, on ne fait pas d'analyse par catégorie
    // car la colonne category n'existe pas dans la table
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // Si le score est bon, on peut dire que c'est un point fort
    if (score >= 80) {
      strengths.push(`Score global (${score}%)`);
    } else if (score <= 50) {
      weaknesses.push(`Score global (${score}%)`);
    }

    setStats({
      totalQuestions: total,
      correctAnswers: correct,
      averageTime,
      score,
      strengths,
      weaknesses
    });
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Réponses détaillées
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {userEmail} - {answers.length} questions
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Chargement des réponses...</p>
              </div>
            </div>
          ) : answers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Target className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Aucune réponse trouvée
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Cet utilisateur n'a pas encore répondu aux questions de ce QCM.
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">Erreur: {error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* Statistiques générales */}
              <Card className="border-2 border-blue-100 dark:border-blue-900">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Vue d'ensemble
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.score}%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Score global</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.correctAnswers}/{stats.totalQuestions}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Réponses correctes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{formatTime(stats.averageTime)}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Temps moyen</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{stats.totalQuestions}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Questions totales</div>
                    </div>
                  </div>
                  
                  <Progress value={stats.score} className="h-3" />
                  
                  {/* Forces et faiblesses */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {stats.strengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Points forts
                        </h4>
                        <div className="space-y-1">
                          {stats.strengths.map((strength, index) => (
                            <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              {strength}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {stats.weaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          Points à améliorer
                        </h4>
                        <div className="space-y-1">
                          {stats.weaknesses.map((weakness, index) => (
                            <Badge key={index} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              {weakness}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Réponses détaillées */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Réponses détaillées
                </h3>
                
                {answers.map((answer, index) => (
                  <Card key={answer.id} className={`border-2 ${answer.is_correct ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${answer.is_correct ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                            {answer.is_correct ? (
                              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Question {index + 1}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="h-4 w-4" />
                          {answer.time_spent ? formatTime(answer.time_spent) : 'N/A'}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-gray-900 dark:text-gray-100 font-medium">
                          {answer.question.question}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        {answer.all_choices?.map((choice) => (
                          <div
                            key={choice.id}
                            className={`p-3 rounded-lg border-2 ${
                              choice.id === answer.choice_id
                                ? answer.is_correct
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : choice.is_correct
                                ? 'border-green-300 bg-green-50 dark:bg-green-900/10'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {choice.id === answer.choice_id && (
                                <div className={`w-2 h-2 rounded-full ${answer.is_correct ? 'bg-green-500' : 'bg-red-500'}`} />
                              )}
                              {choice.is_correct && choice.id !== answer.choice_id && (
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                              )}
                              <span className={`${
                                choice.id === answer.choice_id
                                  ? answer.is_correct
                                    ? 'text-green-700 dark:text-green-300 font-medium'
                                    : 'text-red-700 dark:text-red-300 font-medium'
                                  : choice.is_correct
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {choice.choice}
                              </span>
                              {choice.is_correct && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                        Répondu le {answer.answered_at ? format(new Date(answer.answered_at), "d MMMM yyyy 'à' HH:mm", { locale: fr }) : 'Date non disponible'}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 