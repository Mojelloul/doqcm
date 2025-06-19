// Types pour les services IA
export interface AITextAnalysis {
  sentiment: AISentimentAnalysis;
  keywords: AIKeywordExtraction;
  validation: AITextValidation;
  summary: AISummaryGeneration;
  analysisDate: string;
  textLength: number;
}

export interface AISentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  keywords: string[];
  emotions: string[];
  intensity: 'low' | 'medium' | 'high';
}

export interface AIKeywordExtraction {
  keywords: string[];
  categories: string[];
  importance: Record<string, number>;
  textLength: number;
  extractionDate: string;
}

export interface AITextValidation {
  isValid: boolean;
  issues: string[];
  suggestions: string[];
  score: number;
  readability: 'easy' | 'medium' | 'hard';
  grammarErrors: number;
  spellingErrors: number;
}

export interface AITextGeneration {
  text: string;
  prompt: string;
  generatedAt: string;
  tokens: number;
  model: string;
}

export interface AISummaryGeneration {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: number;
  style: 'concise' | 'detailed' | 'bullet';
}

export interface AITranslation {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  translationDate: string;
  confidence: number;
}

export interface AIContentOptimization {
  originalText: string;
  optimizedText: string;
  originalLength: number;
  optimizedLength: number;
  improvement: number;
  style: 'professional' | 'casual' | 'academic';
  optimizationDate: string;
}

export interface AITextClassification {
  text: string;
  category: string;
  confidence: number;
  subcategories: string[];
  classificationDate: string;
}

export interface AILanguageDetection {
  text: string;
  detectedLanguage: string;
  confidence: number;
  alternatives: Array<{ language: string; confidence: number }>;
  detectionDate: string;
}

export interface AIErrorHandling {
  error: string;
  code: string;
  timestamp: string;
  retryable: boolean;
  suggestions: string[];
}

export interface AIPromptTemplate {
  name: string;
  template: string;
  variables: string[];
  description: string;
}

export interface AIGenerationConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface AIAnalysisResult {
  success: boolean;
  data: any;
  error?: string;
  processingTime: number;
}

export interface AIContentSuggestion {
  id: string;
  title: string;
  description: string;
  relevance: number;
  contentType: 'article' | 'summary' | 'questions' | 'keywords';
  topic: string;
  generatedDate: string;
}

// Types pour les modèles IA
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  capabilities: string[];
  maxTokens: number;
  costPerToken: number;
}

export interface AIRequest {
  prompt: string;
  model: string;
  config?: Partial<AIGenerationConfig>;
  metadata?: Record<string, any>;
}

export interface AIResponse {
  text: string;
  model: string;
  tokens: number;
  processingTime: number;
  metadata?: Record<string, any>;
}

// Types pour la gestion des prompts
export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  description: string;
  defaultValue?: any;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Types pour les analyses avancées
export interface AITextComplexity {
  readabilityScore: number;
  gradeLevel: string;
  complexity: 'simple' | 'medium' | 'complex';
  metrics: {
    sentenceLength: number;
    wordLength: number;
    uniqueWords: number;
    totalWords: number;
  };
}

export interface AITopicExtraction {
  mainTopics: string[];
  subtopics: Record<string, string[]>;
  confidence: number;
  keywords: string[];
}

export interface AISentimentTrend {
  overallSentiment: 'positive' | 'negative' | 'neutral';
  sentimentChanges: Array<{
    position: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
  }>;
  averageSentiment: number;
}

// Types pour les configurations IA
export interface AIServiceConfig {
  defaultModel: string;
  fallbackModel: string;
  maxRetries: number;
  timeout: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  caching: {
    enabled: boolean;
    ttl: number;
  };
}

// Types pour les métriques et monitoring
export interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalTokens: number;
  cost: number;
  lastUpdated: string;
}

export interface AIUsage {
  userId: string;
  model: string;
  tokens: number;
  cost: number;
  timestamp: string;
  requestType: string;
} 