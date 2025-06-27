"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";

export default function DebugUserAnswers() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { supabase } = useSupabaseContext();

  const checkTableExists = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Vérification de l\'existence de la table user_answers...');
      
      const { data, error } = await supabase
        .from('user_answers')
        .select('count')
        .limit(1);

      console.log('📊 Résultat de la vérification:', { data, error });
      
      if (error) {
        console.error('❌ Erreur lors de la vérification:', error);
        setResults({ error: error.message, code: error.code });
      } else {
        console.log('✅ Table user_answers existe et est accessible');
        setResults({ success: true, message: 'Table accessible' });
      }
    } catch (error) {
      console.error('💥 Erreur générale:', error);
      setResults({ error: 'Erreur générale', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const insertTestData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Insertion de données de test...');
      
      // Récupérer un utilisateur existant
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (usersError || !users || users.length === 0) {
        console.error('❌ Aucun utilisateur trouvé:', usersError);
        setResults({ error: 'Aucun utilisateur trouvé' });
        return;
      }

      // Récupérer un document existant
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('id')
        .limit(1);

      if (docsError || !documents || documents.length === 0) {
        console.error('❌ Aucun document trouvé:', docsError);
        setResults({ error: 'Aucun document trouvé' });
        return;
      }

      // Récupérer une question existante
      const { data: questions, error: questionsError } = await supabase
        .from('qcm_questions')
        .select('id')
        .limit(1);

      if (questionsError || !questions || questions.length === 0) {
        console.error('❌ Aucune question trouvée:', questionsError);
        setResults({ error: 'Aucune question trouvée' });
        return;
      }

      // Récupérer un choix existant
      const { data: choices, error: choicesError } = await supabase
        .from('qcm_choices')
        .select('id')
        .limit(1);

      if (choicesError || !choices || choices.length === 0) {
        console.error('❌ Aucun choix trouvé:', choicesError);
        setResults({ error: 'Aucun choix trouvé' });
        return;
      }

      const testData = {
        user_id: users[0].id,
        document_id: documents[0].id,
        question_id: questions[0].id,
        choice_id: choices[0].id,
        is_correct: true,
        time_spent: 30
      };

      console.log('📝 Données de test:', testData);

      const { data, error } = await supabase
        .from('user_answers')
        .insert([testData])
        .select();

      console.log('📊 Résultat de l\'insertion:', { data, error });

      if (error) {
        console.error('❌ Erreur lors de l\'insertion:', error);
        setResults({ error: error.message, code: error.code, details: error });
      } else {
        console.log('✅ Données de test insérées avec succès');
        setResults({ success: true, data, message: 'Données insérées' });
      }
    } catch (error) {
      console.error('💥 Erreur générale:', error);
      setResults({ error: 'Erreur générale', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  const checkData = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Vérification des données existantes...');
      
      const { data, error } = await supabase
        .from('user_answers')
        .select(`
          id,
          user_id,
          document_id,
          question_id,
          choice_id,
          is_correct,
          answered_at,
          time_spent
        `)
        .limit(10);

      console.log('📊 Données existantes:', { data, error });

      if (error) {
        console.error('❌ Erreur lors de la vérification des données:', error);
        setResults({ error: error.message, code: error.code });
      } else {
        console.log('✅ Données récupérées:', data?.length || 0, 'enregistrements');
        setResults({ success: true, data, count: data?.length || 0 });
      }
    } catch (error) {
      console.error('💥 Erreur générale:', error);
      setResults({ error: 'Erreur générale', details: error });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Débogage - Table user_answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkTableExists} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Vérification...' : 'Vérifier la table'}
          </Button>
          
          <Button 
            onClick={insertTestData} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Insertion...' : 'Insérer données test'}
          </Button>
          
          <Button 
            onClick={checkData} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? 'Vérification...' : 'Vérifier données'}
          </Button>
        </div>

        {results && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold mb-2">Résultats :</h4>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>💡 Ce composant permet de :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Vérifier si la table user_answers existe</li>
            <li>Insérer des données de test</li>
            <li>Vérifier les données existantes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 