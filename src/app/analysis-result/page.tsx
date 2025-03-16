"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalysisResultPage() {
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt");
  const result = searchParams.get("result");

  return (
    <div className="container mx-auto py-8 space-y-6">
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