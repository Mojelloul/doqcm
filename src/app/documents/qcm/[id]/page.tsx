"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, HelpCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Document {
  id: string;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

interface Question {
  id: string;
  document_id: string;
  question: string;
}

interface Choice {
  id: string;
  question_id: string;
  choice: string;
  is_correct: boolean;
}

export default function DocumentQCMPage() {
  const [document, setDocument] = useState<Document | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionChoices, setQuestionChoices] = useState<Record<string, Choice[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingScore, setHasExistingScore] = useState(false);
  const { supabase } = useSupabaseContext();
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  useEffect(() => {
    async function fetchDocumentAndQuestions() {
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError || !userData.user) {
          router.push('/login');
          return;
        }

        // Vérifier si l'utilisateur a déjà un score pour ce document
        const { data: existingScore, error: scoreError } = await supabase
          .from('employees_documents')
          .select('score')
          .match({ 
            employee_id: userData.user.id,
            document_id: documentId
          })
          .single();
          
        if (scoreError && scoreError.code !== 'PGRST116') { // PGRST116 = Not found
          console.error("Erreur lors de la vérification du score existant:", scoreError);
        } else if (existingScore && existingScore.score !== null) {
          console.log("Score existant trouvé:", existingScore.score);
          setHasExistingScore(true);
          setScore({
            correct: 0, // Ces valeurs seront mises à jour plus tard
            total: 0,
            percentage: existingScore.score
          });
          setShowResults(true);
        }

        // Récupérer les détails du document
        const { data: documentData, error: documentError } = await supabase
          .from('documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (documentError) {
          console.error("Erreur lors de la récupération du document:", documentError);
          throw documentError;
        }

        if (!documentData) {
          console.error("Document non trouvé");
          router.push('/documents');
          return;
        }

        // Récupérer les questions QCM associées au document
        const { data: questionsData, error: questionsError } = await supabase
          .from('qcm_questions')
          .select('*')
          .eq('document_id', documentId);

        if (questionsError) {
          console.error("Erreur lors de la récupération des questions:", questionsError);
          throw questionsError;
        }

        console.log("Questions récupérées:", questionsData);
        
        if (questionsData && questionsData.length > 0) {
          // Récupérer les choix pour chaque question
          const questionIds = questionsData.map(q => q.id);
          
          const { data: choicesData, error: choicesError } = await supabase
            .from('qcm_choices')
            .select('*')
            .in('question_id', questionIds);
            
          if (choicesError) {
            console.error("Erreur lors de la récupération des choix:", choicesError);
            throw choicesError;
          }
          
          console.log("Choix récupérés:", choicesData);
          
          // Organiser les choix par question_id
          const choicesByQuestion: Record<string, Choice[]> = {};
          
          if (choicesData) {
            console.log("Exemple de choix:", choicesData[0]);
            choicesData.forEach((choice: Choice) => {
              console.log(`Choix ${choice.id}: ${choice.choice}`);
              if (!choicesByQuestion[choice.question_id]) {
                choicesByQuestion[choice.question_id] = [];
              }
              choicesByQuestion[choice.question_id].push(choice);
            });
          }
          
          setQuestionChoices(choicesByQuestion);
          
          // Si l'utilisateur a déjà un score, mettre à jour le total
          if (hasExistingScore) {
            setScore(prev => ({
              ...prev,
              total: questionsData.length
            }));
          }
        }

        setDocument(documentData);
        setQuestions(questionsData || []);
      } catch (error) {
        console.error('Error fetching document and questions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDocumentAndQuestions();
  }, [supabase, router, documentId, hasExistingScore]);

  const handleAnswerSelect = (questionId: string, choiceId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = async () => {
    // Vérifier si toutes les questions ont une réponse
    const answeredQuestions = Object.keys(selectedAnswers).length;
    if (answeredQuestions < questions.length) {
      alert(`Veuillez répondre à toutes les questions. (${answeredQuestions}/${questions.length})`);
      return;
    }

    try {
      // Calculer le score
      let correctAnswers = 0;
      questions.forEach(question => {
        const selectedChoiceId = selectedAnswers[question.id];
        if (selectedChoiceId) {
          const selectedChoice = questionChoices[question.id]?.find(c => c.id === selectedChoiceId);
          if (selectedChoice?.is_correct) {
            correctAnswers++;
          }
        }
      });

      const percentage = (correctAnswers / questions.length) * 100;
      
      // Récupérer l'utilisateur actuel
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !userData.user) {
        console.error("Erreur lors de la récupération de l'utilisateur:", userError);
        throw new Error("Vous devez être connecté pour soumettre vos réponses");
      }
      
      // Enregistrer le score dans la table employees_documents
      console.log("Tentative d'enregistrement du score:", {
        score: percentage,
        employee_id: userData.user.id,
        document_id: documentId
      });

      const { data: updateData, error: updateError } = await supabase
        .from('employees_documents')
        .update({ score: percentage })
        .match({ 
          employee_id: userData.user.id,
          document_id: documentId
        })
        .select();

      console.log("Résultat de la mise à jour:", { updateData, updateError });
      
      if (updateError) {
        console.error("Erreur lors de l'enregistrement du score:", updateError);
        throw new Error("Erreur lors de l'enregistrement du score");
      }

      // Vérifier si la mise à jour a affecté des lignes
      if (!updateData || updateData.length === 0) {
        console.warn("Aucune ligne mise à jour. Vérification de l'existence de l'enregistrement...");
        
        // Vérifier si l'enregistrement existe
        const { data: checkData, error: checkError } = await supabase
          .from('employees_documents')
          .select('*')
          .match({ 
            employee_id: userData.user.id,
            document_id: documentId
          });
          
        console.log("Vérification de l'enregistrement:", { checkData, checkError });
        
        if (checkError) {
          console.error("Erreur lors de la vérification de l'enregistrement:", checkError);
        } else if (!checkData || checkData.length === 0) {
          console.warn("L'enregistrement n'existe pas, tentative d'insertion...");
          
          // Si l'enregistrement n'existe pas, l'insérer
          const { data: insertData, error: insertError } = await supabase
            .from('employees_documents')
            .insert([{ 
              employee_id: userData.user.id,
              document_id: documentId,
              score: percentage
            }])
            .select();
            
            console.log("Résultat de l'insertion:", { insertData, insertError });
            
            if (insertError) {
              console.error("Erreur lors de l'insertion du score:", insertError);
              throw new Error("Erreur lors de l'insertion du score");
            }
        }
      }
      
      // Mettre à jour l'état local
      setScore({
        correct: correctAnswers,
        total: questions.length,
        percentage
      });
      setShowResults(true);
      
      // Afficher un message de succès
      alert(`Votre score a été enregistré : ${correctAnswers}/${questions.length} (${percentage.toFixed(2)}%)`);
      
    } catch (error: any) {
      console.error("Erreur lors de la soumission des réponses:", error);
      alert(error.message || "Une erreur est survenue lors de la soumission des réponses");
    }
  };

  const getChoiceClassName = (questionId: string, choiceId: string) => {
    const isSelected = selectedAnswers[questionId] === choiceId;
    
    if (!showResults) {
      return `flex items-center gap-3 p-4 border rounded-md transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-300 shadow-sm' : 'hover:bg-gray-50'
      }`;
    }
    
    const choice = questionChoices[questionId]?.find(c => c.id === choiceId);
    const isCorrect = choice?.is_correct;
    
    if (isSelected && isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-md bg-green-50 border-green-500 shadow-sm';
    } else if (isSelected && !isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-md bg-red-50 border-red-500 shadow-sm';
    } else if (!isSelected && isCorrect) {
      return 'flex items-center gap-3 p-4 border rounded-md bg-green-50 border-green-500 opacity-70';
    } else {
      return 'flex items-center gap-3 p-4 border rounded-md';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Test QCM du Document</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <Button
            onClick={() => router.push('/documents')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Tous les documents
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center">Chargement du test QCM...</div>
      ) : !document ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900">Document non trouvé</p>
            <Button
              onClick={() => router.push('/documents')}
              className="mt-4"
            >
              Retour aux documents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-8 shadow-md">
            <CardHeader className="border-b bg-gray-50">
              <CardTitle className="text-xl text-blue-800">{document.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 text-gray-600">
                Créé le {format(new Date(document.created_at), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {document.summary && (
                <div className="mb-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="text-md font-semibold text-blue-800 mb-2">points importants</h3>
                  <p className="text-gray-700 italic">{document.summary}</p>
                </div>
              )}
              <div className="mt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Contenu du document</h3>
                <div className="prose max-w-none">
                  {document.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                        {paragraph}
                      </p>
                    ) : null
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="border-t border-gray-200 my-8 pt-8">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Questions du QCM</h2>

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
            ) : hasExistingScore ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <div className="text-center">
                    <p className="text-lg font-medium text-gray-900 mb-4">Vous avez déjà complété ce QCM</p>
                    <p className="text-sm text-gray-500 mb-6">
                      Votre score: {score.percentage.toFixed(2)}%
                    </p>
                    <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-4 mb-6">
                      <div 
                        className={`h-4 rounded-full ${
                          score.percentage >= 80 ? 'bg-green-500' : 
                          score.percentage >= 50 ? 'bg-yellow-500' : 
                          'bg-red-500'
                        }`} 
                        style={{ width: `${score.percentage}%` }}
                      ></div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="mx-auto"
                      onClick={() => router.push('/documents')}
                    >
                      Retour à mes documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium mb-4">{question.question}</p>
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
                              <span className="block text-base font-medium text-gray-800">
                                <span className="inline-block w-6 text-center mr-2 text-gray-500">{choiceIndex + 1}.</span>
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
                  {showResults && !hasExistingScore ? (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedAnswers({});
                        setShowResults(false);
                      }}
                    >
                      Réessayer
                    </Button>
                  ) : !hasExistingScore ? (
                    <Button onClick={handleSubmit}>
                      Soumettre les réponses
                    </Button>
                  ) : null}
                </div>
              </div>
            )}

            {showResults && !hasExistingScore && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Résultats du QCM</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Score:</span>
                      <span className="text-lg font-bold">{score.correct}/{score.total} ({score.percentage.toFixed(2)}%)</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${
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
                    className="w-full"
                    onClick={() => router.push('/documents')}
                  >
                    Retour à mes documents
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