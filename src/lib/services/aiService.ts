import { GeminiClient } from "@/lib/gemini/client";
import { qcmPromptTemplate, type QCMResponse } from "@/lib/prompts/promptTemplate";
import { Document } from '../types/document';
import { Question, Choice } from '../types/qcm';

// Types locaux pour les services IA
interface AITextAnalysis {
  sentiment: AISentimentAnalysis;
  keywords: AIKeywordExtraction;
  validation: AITextValidation;
  summary: AISummaryGeneration;
  analysisDate: string;
  textLength: number;
}

interface AISentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  emotions: string[];
  intensity: 'low' | 'medium' | 'high';
}

interface AIKeywordExtraction {
  keywords: string[];
  categories: string[];
  importance: Record<string, number>;
  textLength: number;
  extractionDate: string;
}

interface AITextValidation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  score: number;
  readability: 'easy' | 'medium' | 'hard';
  grammarErrors: number;
  spellingErrors: number;
}

interface AITextGeneration {
  text: string;
  prompt: string;
  generatedAt: string;
  tokens: number;
  model: string;
}

interface AISummaryGeneration {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  style: 'concise' | 'detailed' | 'bullet';
}

interface AITranslation {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translationDate: string;
  confidence: number;
}

interface AIContentOptimization {
  originalText: string;
  optimizedText: string;
  originalLength: number;
  optimizedLength: number;
  improvement: number;
  style: 'professional' | 'casual' | 'academic';
  optimizationDate: string;
}

interface AITextClassification {
  text: string;
  category: string;
  confidence: number;
  subcategories: string[];
  classificationDate: string;
}

interface AILanguageDetection {
  text: string;
  detectedLanguage: string;
  confidence: number;
  alternatives: Array<{ language: string; confidence: number }>;
  detectionDate: string;
}

interface AIErrorHandling {
  error: string;
  code: string;
  timestamp: string;
  retryable: boolean;
  suggestions: string[];
}

interface AIPromptTemplate {
  name: string;
  template: string;
  variables: string[];
  description: string;
}

interface AIGenerationConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface AIAnalysisResult {
  success: boolean;
  data: any;
  error?: string;
  processingTime: number;
}

interface AIContentSuggestion {
  id: string;
  title: string;
  description: string;
  relevance: number;
  contentType: 'article' | 'summary' | 'questions' | 'keywords';
  topic: string;
  generatedDate: string;
}

export interface QCMGenerationResult {
  qcm: Array<{
    question: string;
    choices: { A: string; B: string; C: string };
    correct_answer: "A" | "B" | "C";
    justification: string;
  }>;
}

export class AIService {
  private geminiClient: GeminiClient;
  private defaultConfig: AIGenerationConfig;

  constructor() {
    this.geminiClient = new GeminiClient();
    this.defaultConfig = {
      maxTokens: 1000,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0
    };
  }

  /**
   * Génère un QCM à partir d'un texte en utilisant l'IA
   */
  async generateQCMFromText(
    text: string, 
    title: string, 
    summary: string, 
    numberOfQuestions: number = 5,
    config?: Partial<AIGenerationConfig>
  ): Promise<QCMGenerationResult> {
    try {
      const generationConfig = { ...this.defaultConfig, ...config };
      
      // Utiliser le template de prompt existant
      const prompt = qcmPromptTemplate(text, title, summary, numberOfQuestions);
      
      console.log("Generating QCM with prompt length:", prompt.length);
      
      // Générer le QCM avec Gemini
      const result = await this.geminiClient.generateJSON<QCMResponse>(prompt);
      
      // Valider le résultat
      if (!result || !result.qcm || !Array.isArray(result.qcm) || result.qcm.length === 0) {
        throw new Error("Invalid QCM response format from AI");
      }
      
      console.log("QCM generated successfully with", result.qcm.length, "questions");
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la génération du QCM:", error);
      
      // Fournir des messages d'erreur plus spécifiques
      if (error instanceof Error) {
        if (error.message.includes("JSON")) {
          throw new Error("Erreur de format JSON dans la réponse de l'IA. Veuillez réessayer.");
        } else if (error.message.includes("No JSON found")) {
          throw new Error("L'IA n'a pas retourné un format JSON valide. Veuillez réessayer.");
        } else if (error.message.includes("Invalid QCM response")) {
          throw new Error("Format de réponse QCM invalide. Veuillez réessayer.");
        }
      }
      
      throw this.handleAIError(error, "Impossible de générer le QCM. Veuillez réessayer.");
    }
  }

  /**
   * Génère un QCM à partir d'un document
   */
  async generateQCMFromDocument(
    document: Document, 
    numberOfQuestions: number = 3,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ): Promise<QCMGenerationResult> {
    try {
      const prompt = this.createQCMDocumentPrompt(document, numberOfQuestions, difficulty);
      const result = await this.geminiClient.generateJSON<QCMResponse>(prompt);
      
      return result;
    } catch (error) {
      console.error("Erreur lors de la génération du QCM depuis le document:", error);
      throw this.handleAIError(error, "Impossible de générer le QCM depuis le document.");
    }
  }

  /**
   * Génère un résumé de texte
   */
  async generateTextSummary(
    text: string, 
    maxLength: number = 250,
    style: 'concise' | 'detailed' | 'bullet' = 'concise'
  ): Promise<AISummaryGeneration> {
    try {
      const prompt = this.createSummaryPrompt(text, maxLength, style);
      const summary = await this.geminiClient.generateText(prompt);
      
      return {
        summary: summary.trim(),
        originalLength: text.length,
        summaryLength: summary.length,
        compressionRatio: (summary.length / text.length) * 100,
        style
      };
    } catch (error) {
      console.error("Erreur lors de la génération du résumé:", error);
      throw this.handleAIError(error, "Impossible de générer le résumé. Veuillez réessayer.");
    }
  }

  /**
   * Analyse le sentiment d'un texte
   */
  async analyzeTextSentiment(text: string): Promise<AISentimentAnalysis> {
    try {
      const prompt = this.createSentimentAnalysisPrompt(text);
      const result = await this.geminiClient.generateJSON<AISentimentAnalysis>(prompt);

      return result;
    } catch (error) {
      console.error("Erreur lors de l'analyse de sentiment:", error);
      throw this.handleAIError(error, "Impossible d'analyser le sentiment du texte.");
    }
  }

  /**
   * Extrait les mots-clés d'un texte
   */
  async extractKeywords(
    text: string, 
    maxKeywords: number = 10,
    language: string = 'fr'
  ): Promise<AIKeywordExtraction> {
    try {
      const prompt = this.createKeywordExtractionPrompt(text, maxKeywords, language);
      const result = await this.geminiClient.generateJSON<{
        keywords: string[];
        categories: string[];
        importance: Record<string, number>;
      }>(prompt);

      return {
        keywords: result.keywords,
        categories: result.categories,
        importance: result.importance,
        textLength: text.length,
        extractionDate: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de l'extraction des mots-clés:", error);
      throw this.handleAIError(error, "Impossible d'extraire les mots-clés du texte.");
    }
  }

  /**
   * Vérifie la qualité et la cohérence d'un texte
   */
  async validateTextQuality(text: string): Promise<AITextValidation> {
    try {
      const prompt = this.createTextValidationPrompt(text);
      const result = await this.geminiClient.generateJSON<AITextValidation>(prompt);

      return result;
    } catch (error) {
      console.error("Erreur lors de la validation du texte:", error);
      throw this.handleAIError(error, "Impossible de valider la qualité du texte.");
    }
  }

  /**
   * Analyse complète d'un texte
   */
  async analyzeText(text: string): Promise<AITextAnalysis> {
    try {
      const [sentiment, keywords, validation, summary] = await Promise.all([
        this.analyzeTextSentiment(text),
        this.extractKeywords(text),
        this.validateTextQuality(text),
        this.generateTextSummary(text)
      ]);

      return {
        sentiment,
        keywords,
        validation,
        summary,
        analysisDate: new Date().toISOString(),
        textLength: text.length
      };
    } catch (error) {
      console.error("Erreur lors de l'analyse complète du texte:", error);
      throw this.handleAIError(error, "Impossible d'analyser le texte.");
    }
  }

  /**
   * Génère du contenu optimisé
   */
  async generateOptimizedContent(
    originalText: string,
    targetLength: number,
    style: 'professional' | 'casual' | 'academic' = 'professional'
  ): Promise<AIContentOptimization> {
    try {
      const prompt = this.createContentOptimizationPrompt(originalText, targetLength, style);
      const optimizedText = await this.geminiClient.generateText(prompt);

      return {
        originalText,
        optimizedText: optimizedText.trim(),
        originalLength: originalText.length,
        optimizedLength: optimizedText.length,
        improvement: this.calculateImprovement(originalText, optimizedText),
        style,
        optimizationDate: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de l'optimisation du contenu:", error);
      throw this.handleAIError(error, "Impossible d'optimiser le contenu.");
    }
  }

  /**
   * Traduit un texte
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<AITranslation> {
    try {
      const prompt = this.createTranslationPrompt(text, targetLanguage, sourceLanguage);
      const translatedText = await this.geminiClient.generateText(prompt);

      return {
        originalText: text,
        translatedText: translatedText.trim(),
        sourceLanguage: sourceLanguage || 'auto',
        targetLanguage,
        translationDate: new Date().toISOString(),
        confidence: 0.95 // À améliorer avec une vraie métrique
      };
    } catch (error) {
      console.error("Erreur lors de la traduction:", error);
      throw this.handleAIError(error, "Impossible de traduire le texte.");
    }
  }

  /**
   * Classifie un texte
   */
  async classifyText(
    text: string,
    categories: string[]
  ): Promise<AITextClassification> {
    try {
      const prompt = this.createTextClassificationPrompt(text, categories);
      const result = await this.geminiClient.generateJSON<{
        category: string;
        confidence: number;
        subcategories: string[];
      }>(prompt);

      return {
        text,
        category: result.category,
        confidence: result.confidence,
        subcategories: result.subcategories,
        classificationDate: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de la classification du texte:", error);
      throw this.handleAIError(error, "Impossible de classifier le texte.");
    }
  }

  /**
   * Détecte la langue d'un texte
   */
  async detectLanguage(text: string): Promise<AILanguageDetection> {
    try {
      const prompt = this.createLanguageDetectionPrompt(text);
      const result = await this.geminiClient.generateJSON<{
        language: string;
        confidence: number;
        alternatives: Array<{ language: string; confidence: number }>;
      }>(prompt);

      return {
        text,
        detectedLanguage: result.language,
        confidence: result.confidence,
        alternatives: result.alternatives,
        detectionDate: new Date().toISOString()
      };
    } catch (error) {
      console.error("Erreur lors de la détection de langue:", error);
      throw this.handleAIError(error, "Impossible de détecter la langue du texte.");
    }
  }

  /**
   * Génère des suggestions de contenu
   */
  async generateContentSuggestions(
    topic: string,
    contentType: 'article' | 'summary' | 'questions' | 'keywords',
    count: number = 5
  ): Promise<AIContentSuggestion[]> {
    try {
      const prompt = this.createContentSuggestionPrompt(topic, contentType, count);
      const result = await this.geminiClient.generateJSON<{
        suggestions: Array<{
          title: string;
          description: string;
          relevance: number;
        }>;
      }>(prompt);

      return result.suggestions.map((suggestion, index) => ({
        id: `suggestion_${index}`,
        title: suggestion.title,
        description: suggestion.description,
        relevance: suggestion.relevance,
        contentType,
        topic,
        generatedDate: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Erreur lors de la génération des suggestions:", error);
      throw this.handleAIError(error, "Impossible de générer des suggestions de contenu.");
    }
  }

  // Méthodes privées pour créer les prompts
  private createQCMDocumentPrompt(document: Document, numberOfQuestions: number, difficulty: string): string {
    return `Générez ${numberOfQuestions} questions QCM de difficulté ${difficulty} basées sur ce document :

Titre: ${document.title}
Résumé: ${document.summary}
Contenu: ${document.content}

Générez des questions variées qui testent la compréhension du contenu.`;
  }

  private createSummaryPrompt(text: string, maxLength: number, style: string): string {
    const styleInstructions = {
      concise: 'Résumez de manière concise',
      detailed: 'Résumez de manière détaillée',
      bullet: 'Résumez sous forme de points clés'
    };

    return `${styleInstructions[style as keyof typeof styleInstructions]} le texte suivant en maximum ${maxLength} caractères :

${text}

Résumé :`;
  }

  private createSentimentAnalysisPrompt(text: string): string {
    return `Analysez le sentiment du texte suivant et retournez le résultat en JSON :

${text}

Retournez uniquement un JSON avec cette structure :
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.85,
  "keywords": ["mot1", "mot2", "mot3"],
  "emotions": ["joie", "colère", "tristesse"],
  "intensity": "low|medium|high"
}`;
  }

  private createKeywordExtractionPrompt(text: string, maxKeywords: number, language: string): string {
    return `Extrayez les ${maxKeywords} mots-clés les plus importants du texte suivant en ${language} :

${text}

Retournez uniquement un JSON avec cette structure :
{
  "keywords": ["mot1", "mot2", "mot3"],
  "categories": ["catégorie1", "catégorie2"],
  "importance": {"mot1": 0.9, "mot2": 0.7}
}`;
  }

  private createTextValidationPrompt(text: string): string {
    return `Analysez la qualité et la cohérence du texte suivant :

${text}

Retournez uniquement un JSON avec cette structure :
{
  "isValid": true,
  "issues": ["problème1", "problème2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "score": 85,
  "readability": "easy|medium|hard",
  "grammarErrors": 0,
  "spellingErrors": 0
}`;
  }

  private createContentOptimizationPrompt(originalText: string, targetLength: number, style: string): string {
    return `Optimisez le texte suivant pour un style ${style} avec une longueur cible de ${targetLength} caractères :

${originalText}

Texte optimisé :`;
  }

  private createTranslationPrompt(text: string, targetLanguage: string, sourceLanguage?: string): string {
    const source = sourceLanguage ? `du ${sourceLanguage}` : '';
    return `Traduisez le texte suivant ${source} vers ${targetLanguage} :

${text}

Traduction :`;
  }

  private createTextClassificationPrompt(text: string, categories: string[]): string {
    return `Classifiez le texte suivant dans l'une de ces catégories : ${categories.join(', ')}

${text}

Retournez uniquement un JSON avec cette structure :
{
  "category": "catégorie_choisie",
  "confidence": 0.85,
  "subcategories": ["sous_cat1", "sous_cat2"]
}`;
  }

  private createLanguageDetectionPrompt(text: string): string {
    return `Détectez la langue du texte suivant :

${text}

Retournez uniquement un JSON avec cette structure :
{
  "language": "fr",
  "confidence": 0.95,
  "alternatives": [{"language": "en", "confidence": 0.05}]
}`;
  }

  private createContentSuggestionPrompt(topic: string, contentType: string, count: number): string {
    return `Générez ${count} suggestions de contenu de type "${contentType}" sur le sujet "${topic}".

Retournez uniquement un JSON avec cette structure :
{
  "suggestions": [
    {
      "title": "Titre de la suggestion",
      "description": "Description de la suggestion",
      "relevance": 0.9
    }
  ]
}`;
  }

  // Méthodes utilitaires
  private calculateImprovement(original: string, optimized: string): number {
    // Logique simple pour calculer l'amélioration
    const originalWords = original.split(' ').length;
    const optimizedWords = optimized.split(' ').length;
    return ((optimizedWords - originalWords) / originalWords) * 100;
  }

  private handleAIError(error: any, defaultMessage: string): AIErrorHandling {
    return {
      error: error instanceof Error ? error.message : defaultMessage,
      code: error.code || 'AI_GENERATION_ERROR',
      timestamp: new Date().toISOString(),
      retryable: this.isRetryableError(error),
      suggestions: this.getErrorSuggestions(error)
    };
  }

  private isRetryableError(error: any): boolean {
    // Logique pour déterminer si l'erreur est récupérable
    return error.code === 'RATE_LIMIT' || error.code === 'TIMEOUT';
  }

  private getErrorSuggestions(error: any): string[] {
    const suggestions: string[] = [];
    
    if (error.code === 'RATE_LIMIT') {
      suggestions.push('Attendez quelques minutes avant de réessayer');
      suggestions.push('Réduisez la taille du texte à analyser');
    } else if (error.code === 'TIMEOUT') {
      suggestions.push('Réduisez la complexité de la demande');
      suggestions.push('Vérifiez votre connexion internet');
    } else {
      suggestions.push('Vérifiez que le texte est valide');
      suggestions.push('Essayez avec un texte plus court');
    }
    
    return suggestions;
  }
} 