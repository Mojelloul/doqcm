"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Loader2, 
  X,
  CheckCircle,
  AlertCircle 
} from "lucide-react";
import { recognizeText } from "@/lib/config/tesseract";

interface ImageUploadOCRProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

export function ImageUploadOCR({ onTextExtracted, disabled = false }: ImageUploadOCRProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      setError("Veuillez sélectionner un fichier image valide");
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB");
      return;
    }

    setError(null);
    setSuccess(false);
    setIsProcessing(true);
    setProgress("Initialisation de la reconnaissance de texte...");

    try {
      // Créer l'URL de prévisualisation
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      setProgress("Analyse de l'image...");
      
      // Utiliser notre fonction optimisée
      const extractedText = await recognizeText(file);

      // Nettoyer l'URL de prévisualisation
      URL.revokeObjectURL(url);

      if (extractedText) {
        onTextExtracted(extractedText);
        setSuccess(true);
        setPreviewUrl(null);
        setProgress("");
      } else {
        setError("Aucun texte n'a été détecté dans cette image");
        setPreviewUrl(null);
        setProgress("");
      }

    } catch (err) {
      console.error("Erreur lors du traitement OCR:", err);
      setError("Erreur lors du traitement de l'image. Veuillez réessayer.");
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setProgress("");
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        fileInputRef.current.files = files;
        await handleFileSelect({ target: { files } } as any);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const clearPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    setSuccess(false);
    setProgress("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-gray-300 hover:border-primary transition-colors">
        <CardContent className="p-6">
          <div
            className={`flex flex-col items-center justify-center space-y-4 ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">Traitement en cours...</p>
                  <p className="text-sm text-muted-foreground">
                    {progress}
                  </p>
                </div>
              </>
            ) : previewUrl ? (
              <div className="relative w-full">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearPreview();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                  <ImageIcon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-medium">Glissez-déposez une image ou cliquez pour sélectionner</p>
                  <p className="text-sm text-muted-foreground">
                    Formats supportés: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-2"
                  disabled={disabled}
                >
                  <Upload className="h-4 w-4" />
                  Sélectionner une image
                </Button>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isProcessing}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Texte extrait avec succès ! Il a été ajouté au contenu du document.
          </AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>💡 Conseil: Pour de meilleurs résultats, utilisez des images avec un texte clair et un bon contraste</p>
        <p>🔄 La première utilisation peut prendre quelques secondes pour télécharger les modèles de reconnaissance</p>
      </div>
    </div>
  );
} 