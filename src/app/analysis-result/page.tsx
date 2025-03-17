"use client";

import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Composant client qui utilise useSearchParams
function AnalysisResultContent() {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const result = searchParams.get("result");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prompt envoyé</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
            {prompt}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Résultat de l'analyse</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
            {result}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant principal avec Suspense
export default function AnalysisResultPage() {
  return (
    <div className="container mx-auto py-8">
      <Suspense fallback={<div>Chargement des résultats...</div>}>
        <AnalysisResultContent />
      </Suspense>
    </div>
  );
} 