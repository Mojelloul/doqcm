"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useServices } from "@/lib/hooks/useServices";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, HelpCircle, Home } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Document } from "@/lib/types/document";
import { Question, Choice, QCMScore } from "@/lib/types/qcm";

export default function DocumentQCMPage() {
  const [document, setDocument] = useState<Document | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionChoices, setQuestionChoices] = useState<Record<string, Choice[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<QCMScore>({ correct: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { documentService, qcmService, userService } = useServices();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;
  const [currentPage, setCurrentPage] = useState(0);
  const [charLimit, setCharLimit] = useState(1767);

  useEffect(() => {
    function updateCharLimit() {
      if (typeof window !== 'undefined') {
        setCharLimit(window.innerWidth < 640 ? 730 : 1767);
      }
    }
    updateCharLimit();
    window.addEventListener('resize', updateCharLimit);
    return () => window.removeEventListener('resize', updateCharLimit);
  }, []);

  function splitTextByCharLimit(text: string, limit: number): string[] {
    const words = text.split(/(\s+)/); // conserve les espaces
    const pages: string[] = [];
    let current = '';
    for (let i = 0; i < words.length; i++) {
      if ((current + words[i]).length > limit) {
        if (current.trim().length > 0) pages.push(current.trim());
        current = words[i];
      } else {
        current += words[i];
      }
    }
    if (current.trim().length > 0) pages.push(current.trim());
    return pages;
  }

  const contentPages = document?.content ? splitTextByCharLimit(document.content, charLimit) : [];
  const totalPages = contentPages.length;
  const handlePrevPage = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(totalPages - 1, p + 1));

  useEffect(() => {
    async function fetchDocumentAndQuestions() {
      try {
        setError(null);
        const currentUser = await userService.getCurrentUser();
        
        if (!currentUser) {
          router.push('/login');
          return;
        }

        // Vérifier si l'utilisateur a déjà un score pour ce document
        try {
          const userScore = await documentService.getUserScoreForDocument(documentId, currentUser.id);
          
          if (userScore !== null) {
            console.log("Score existant trouvé:", userScore);
            setExistingScore(userScore);
            setScore({
              correct: 0, // Ces valeurs seront mises à jour plus tard
              total: 0,
              percentage: userScore
            });
            setShowResults(true);
          }
        } catch (scoreError) {
          console.warn('Erreur lors de la récupération du score:', scoreError);
          // On continue même si on ne peut pas récupérer le score
        }

        // Récupérer les détails du document
        const documentData = await documentService.getDocumentById(documentId);

        if (!documentData) {
          setError("Document non trouvé");
          return;
        }

        // Récupérer les questions QCM associées au document
        try {
          const questionsData = await qcmService.getQuestionsForUser(documentId, currentUser.id);

          console.log("Questions récupérées:", questionsData);
          
          if (questionsData && questionsData.length > 0) {
            // Récupérer les choix pour chaque question
            const questionIds = questionsData.map(q => q.id);
            const choicesByQuestion = await qcmService.getChoicesForQuestions(questionIds);
            
            console.log("Choix récupérés:", choicesByQuestion);
            setQuestionChoices(choicesByQuestion);
            
            // Si l'utilisateur a déjà un score, mettre à jour le total
            if (existingScore !== null) {
              setScore(prev => ({
                ...prev,
                total: questionsData.length
              }));
            }
          }

          setQuestions(questionsData || []);
        } catch (questionsError) {
          console.error('Erreur lors de la récupération des questions:', questionsError);
          setError("Erreur lors de la récupération des questions QCM");
          return;
        }

        setDocument(documentData);
      } catch (error: any) {
        console.error('Error fetching document and questions:', error);
        setError(error.message || "Une erreur est survenue lors du chargement du document");
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocumentAndQuestions();
  }, [documentService, qcmService, userService, router, documentId, existingScore]);

  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = async () => {
    // Vérifier si toutes les questions ont une réponse
    if (!qcmService.validateAnswers(questions, selectedAnswers)) {
      const answeredQuestions = Object.keys(selectedAnswers).length;
      alert(`Veuillez répondre à toutes les questions. (${answeredQuestions}/${questions.length})`);
      return;
    }

    try {
      const currentUser = await userService.getCurrentUser();
      
      if (!currentUser) {
        throw new Error("Vous devez être connecté pour soumettre vos réponses");
      }

      // Calculer le score
      const calculatedScore = qcmService.calculateScore(questions, questionChoices, selectedAnswers);
      
      // Enregistrer le score
      await documentService.saveUserScore(documentId, currentUser.id, calculatedScore.percentage);
      
      // Sauvegarder les réponses détaillées
      const userAnswers = questions.map(question => {
        const selectedChoiceId = selectedAnswers[question.id];
        
        return {
          questionId: question.id,
          choiceId: selectedChoiceId
        };
      });

      // Insérer les réponses détaillées dans user_answers
      try {
        await qcmService.saveUserAnswers(currentUser.id, documentId, userAnswers);
        console.log('Réponses détaillées sauvegardées avec succès');
      } catch (answersError) {
        console.error('Erreur lors de la sauvegarde des réponses détaillées:', answersError);
        // On continue même si ça échoue, le score est déjà sauvegardé
      }
      
      // Mettre à jour l'état local
      setScore(calculatedScore);
      setShowResults(true);
      setExistingScore(calculatedScore.percentage);
      
      // Afficher un message de succès
      alert(`Votre score a été enregistré : ${calculatedScore.correct}/${calculatedScore.total} (${calculatedScore.percentage.toFixed(2)}%)`);
      
    } catch (error: any) {
      console.error("Erreur lors de la soumission des réponses:", error);
      alert(error.message || "Une erreur est survenue lors de la soumission des réponses");
    }
  };

  const getChoiceClassName = (questionId: string, choiceId: string) => {
    const isSelected = selectedAnswers[questionId] === choiceId;
    if (!showResults) {
      return `flex items-center gap-3 p-4 border rounded-lg transition-colors cursor-pointer ${
        isSelected ? 'bg-blue-50 border-blue-300 shadow-sm dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      }`;
    }
    const choice = questionChoices[questionId]?.find(c => c.id === choiceId);
    const isCorrect = choice?.is_correct;
    if (isSelected && isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-500 shadow-sm dark:bg-green-900/50';
    } else if (isSelected && !isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-lg bg-red-50 border-red-500 shadow-sm dark:bg-red-900/50';
    } else if (!isSelected && isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-lg bg-green-50 border-green-500 opacity-70 dark:bg-green-900/50';
    } else {
      return 'flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Test QCM du Document</h1>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Répondez aux questions pour tester votre compréhension du document
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Chargement du test QCM...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-red-400 mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Erreur</p>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{error}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/documents')}
                  className="py-3 text-base"
                >
                  Retour aux documents
                </Button>
                <Button
                  onClick={() => window.location.reload()}
                  className="py-3 text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !document ? (
          <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Document non trouvé</p>
              <Button
                onClick={() => router.push('/documents')}
                className="mt-4 py-3 text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Retour aux documents
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="mb-8 rounded-2xl shadow-lg border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6">
                <CardTitle className="text-xl sm:text-2xl text-blue-700 dark:text-blue-400">{document.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  Créé le {format(new Date(document.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {document.summary && (
                  <div className="mb-6 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">Points importants</h3>
                    <p className="text-gray-700 dark:text-gray-200 italic">{document.summary}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Contenu du document</h3>
                  <div className="flex justify-center">
                    <div className="transition-all duration-300 ease-in-out w-full max-w-2xl bg-gray-50 dark:bg-gray-900 p-6 rounded-lg text-lg leading-relaxed shadow-md reader-mode min-h-[250px] flex flex-col justify-center items-center">
                      <div className="w-full">
                        {contentPages[currentPage]?.split('\n').map((paragraph, idx) => (
                          paragraph.trim() ? (
                            <p key={idx} className="mb-4 text-gray-700 dark:text-gray-200 leading-relaxed w-full">
                              {paragraph}
                            </p>
                          ) : null
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center mt-4 gap-4">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 0}
                      className={`rounded-full p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow transition hover:bg-blue-100 dark:hover:bg-blue-800 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Page précédente"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400 select-none">
                      Page {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages - 1}
                      className={`rounded-full p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 shadow transition hover:bg-blue-100 dark:hover:bg-blue-800 ${currentPage === totalPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label="Page suivante"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="border-t border-gray-200 dark:border-gray-700 my-8 pt-8">
              <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-blue-700 dark:text-blue-400">Questions du QCM</h2>

              {questions.length === 0 ? (
                <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <HelpCircle className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucune question trouvée</p>
                    <p className="text-gray-600 dark:text-gray-300 text-center">
                      Ce document n'a pas encore de questions QCM associées
                    </p>
                  </CardContent>
                </Card>
              ) : existingScore !== null || showResults ? (
                <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Vous avez déjà complété ce QCM</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Votre score: {score.percentage.toFixed(2)}%
                      </p>
                      <div className="w-full max-w-md mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-6 mb-6">
                        <div 
                          className={`h-6 rounded-full transition-all duration-500 ${
                            score.percentage >= 80 ? 'bg-green-500' : 
                            score.percentage >= 50 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`} 
                          style={{ width: `${score.percentage}%` }}
                        ></div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="py-3 text-base"
                        onClick={() => router.push('/dashboard')}
                      >
                        Retour à l'accueil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <Card key={question.id} className="rounded-2xl border border-gray-200 bg-white/90 dark:bg-gray-900/90 dark:border-gray-700 overflow-hidden">
                      <CardHeader className="p-6 pb-4">
                        <CardTitle className="text-lg sm:text-xl text-blue-700 dark:text-blue-400">Question {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 pt-2">
                        <p className="font-medium mb-6 text-gray-800 dark:text-gray-100">{question.question}</p>
                        <div className="space-y-3">
                          {questionChoices[question.id] && questionChoices[question.id].map((choice, choiceIndex) => (
                            <div 
                              key={choice.id} 
                              className={getChoiceClassName(question.id, choice.id)}
                              onClick={() => handleAnswerSelect(question.id, choice.id)}
                            >
                              <input 
                                type="radio" 
                                name={`question-${question.id}`} 
                                id={`choice-${choice.id}`} 
                                className="h-5 w-5 text-blue-600"
                                checked={selectedAnswers[question.id] === choice.id}
                                onChange={() => {}}
                              />
                              <label 
                                htmlFor={`choice-${choice.id}`} 
                                className="flex-grow cursor-pointer"
                              >
                                <span className="block font-medium text-gray-800 dark:text-gray-100">
                                  <span className="inline-block w-6 text-center mr-3 text-gray-500 dark:text-gray-400">{choiceIndex + 1}.</span>
                                  {choice.choice}
                                </span>
                              </label>
                            </div>
                          ))}
                          
                          {(!questionChoices[question.id] || questionChoices[question.id].length === 0) && (
                            <p className="text-gray-500 dark:text-gray-400 italic">Aucun choix disponible pour cette question</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <div className="flex justify-end mt-8">
                    <Button 
                      onClick={handleSubmit} 
                      className="py-3 px-8 text-base font-medium bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Soumettre les réponses
                    </Button>
                  </div>
                </div>
              )}

              {showResults && existingScore === null && (
                <Card className="mt-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900/90">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                    <CardTitle className="text-xl text-blue-700 dark:text-blue-400">Résultats du QCM</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-medium text-gray-800 dark:text-gray-100">Score:</span>
                        <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{score.correct}/{score.total} ({score.percentage.toFixed(2)}%)</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
                        <div 
                          className={`h-6 rounded-full transition-all duration-500 ${
                            score.percentage >= 80 ? 'bg-green-500' : 
                            score.percentage >= 50 ? 'bg-yellow-500' : 
                            'bg-red-500'
                          }`} 
                          style={{ width: `${score.percentage}%` }}
                        ></div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {score.percentage >= 80 
                            ? "Excellent travail ! Vous avez une très bonne compréhension du sujet." 
                            : score.percentage >= 50 
                            ? "Bon travail ! Vous avez une compréhension correcte du sujet, mais il y a encore place à l'amélioration." 
                            : "Vous pourriez bénéficier d'une révision supplémentaire du sujet."}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Votre score a été enregistré et est visible par le créateur du document.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-gray-200 dark:border-gray-700">
                    <Button 
                      variant="outline" 
                      className="w-full py-3 text-base"
                      onClick={() => router.push('/dashboard')}
                    >
                      Retour à l'accueil
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 