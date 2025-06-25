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
      return `flex items-center gap-3 p-4 border rounded-md transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-300 shadow-sm dark:bg-blue-900' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`;
    }
    const choice = questionChoices[questionId]?.find(c => c.id === choiceId);
    const isCorrect = choice?.is_correct;
    if (isSelected && isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-md bg-green-50 border-green-500 shadow-sm dark:bg-green-900';
    } else if (isSelected && !isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-md bg-red-50 border-red-500 shadow-sm dark:bg-red-900';
    } else if (!isSelected && isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-md bg-green-50 border-green-500 opacity-70 dark:bg-green-900';
    } else {
      return 'flex items-center gap-3 p-4 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-6 py-6 max-w-2xl lg:max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg sm:text-2xl font-bold">Test QCM du Document</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Chargement du test QCM...</div>
      ) : error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-red-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">Erreur</p>
            <p className="text-sm text-gray-600 mb-4 text-center">{error}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/documents')}
                className="w-full sm:w-auto py-2 text-base"
              >
                Retour aux documents
              </Button>
              <Button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto py-2 text-base"
              >
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : !document ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">Document non trouvé</p>
            <Button
              onClick={() => router.push('/documents')}
              className="mt-4 w-full sm:w-auto py-2 text-base"
            >
              Retour aux documents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-8 shadow-md rounded-xl border border-gray-200 bg-white/90 dark:bg-gray-900 dark:border-gray-700">
            <CardHeader className="border-b bg-gray-50 rounded-t-xl p-4 pb-2 dark:bg-gray-900">
              <CardTitle className="text-base sm:text-xl text-blue-800 dark:text-blue-200">{document.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                Créé le {format(new Date(document.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-4 dark:bg-gray-900">
              {document.summary && (
                <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100 dark:bg-blue-950 dark:border-blue-900">
                  <h3 className="text-sm sm:text-md font-semibold text-blue-800 dark:text-blue-200 mb-2">Points importants</h3>
                  <p className="text-gray-700 italic text-sm sm:text-base dark:text-gray-200">{document.summary}</p>
                </div>
              )}
              <div className="mt-4">
                <h3 className="text-sm sm:text-md font-semibold text-gray-800 dark:text-gray-100 mb-2">Contenu du document</h3>
                <div className="prose max-w-none dark:text-gray-200">
                  {document.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed text-sm sm:text-base dark:text-gray-200">
                        {paragraph}
                      </p>
                    ) : null
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border-t border-gray-200 my-8 pt-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-blue-800">Questions du QCM</h2>

            {questions.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900">Aucune question trouvée</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Ce document n'a pas encore de questions QCM associées
                  </p>
                </CardContent>
              </Card>
            ) : existingScore !== null || showResults ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-4">Vous avez déjà complété ce QCM</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Votre score: {score.percentage.toFixed(2)}%
                    </p>
                    <div className="w-full max-w-xs sm:max-w-md mx-auto bg-gray-200 rounded-full h-5 mb-6">
                      <div 
                        className={`h-5 rounded-full ${
                          score.percentage >= 80 ? 'bg-green-500' : 
                          score.percentage >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${score.percentage}%` }}
                      ></div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mx-auto w-full sm:w-auto py-2 text-base"
                      onClick={() => router.push('/dashboard')}
                    >
                      Retour à l'accueil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id} className="rounded-xl border border-gray-200 bg-white/90 dark:bg-gray-900 dark:border-gray-700">
                    <CardHeader className="p-4 pb-2 dark:bg-gray-900">
                      <CardTitle className="text-base sm:text-lg dark:text-blue-200">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 dark:bg-gray-900">
                      <p className="font-medium mb-4 text-sm sm:text-base dark:text-gray-100">{question.question}</p>
                      <div className="space-y-2">
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
                              <span className="block text-sm sm:text-base font-medium text-gray-800 dark:text-gray-100">
                                <span className="inline-block w-6 text-center mr-2 text-gray-500 dark:text-gray-400">{choiceIndex + 1}.</span>
                                {choice.choice}
                              </span>
                            </label>
                          </div>
                        ))}
                        
                        {(!questionChoices[question.id] || questionChoices[question.id].length === 0) && (
                          <p className="text-sm text-gray-500 italic">Aucun choix disponible pour cette question</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="flex justify-end mt-6 gap-4">
                  <Button onClick={handleSubmit} className="w-full sm:w-auto py-2 text-base">
                    Soumettre les réponses
                  </Button>
                </div>
              </div>
            )}

            {showResults && existingScore === null && (
              <Card className="mt-6 dark:bg-gray-900 dark:border-gray-700">
                <CardHeader className="dark:bg-gray-900">
                  <CardTitle className="dark:text-blue-200">Résultats du QCM</CardTitle>
                </CardHeader>
                <CardContent className="dark:bg-gray-900">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium dark:text-gray-100">Score:</span>
                      <span className="text-lg font-bold dark:text-gray-100">{score.correct}/{score.total} ({score.percentage.toFixed(2)}%)</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-5">
                      <div 
                        className={`h-5 rounded-full ${
                          score.percentage >= 80 ? 'bg-green-500' : 
                          score.percentage >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${score.percentage}%` }}
                      ></div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">
                        {score.percentage >= 80 
                          ? "Excellent travail ! Vous avez une très bonne compréhension du sujet." 
                          : score.percentage >= 50 
                          ? "Bon travail ! Vous avez une compréhension correcte du sujet, mais il y a encore place à l'amélioration." 
                          : "Vous pourriez bénéficier d'une révision supplémentaire du sujet."}
                      </p>
                      <p className="text-sm text-gray-600">
                        Votre score a été enregistré et est visible par le créateur du document.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full py-2 text-base"
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
  );
} 