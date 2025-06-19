import { defaultConfig, type GeminiConfig } from "@/lib/gemini/config";

export interface AppConfig {
  gemini: GeminiConfig;
  supabase: {
    url: string;
    anonKey: string;
  };
  app: {
    name: string;
    version: string;
    maxQuestionsPerQCM: number;
    maxEmailsPerDocument: number;
    maxTextLength: number;
    maxSummaryLength: number;
  };
}

export class ConfigService {
  private static instance: ConfigService;
  private config: AppConfig;

  private constructor() {
    this.config = {
      gemini: defaultConfig,
      supabase: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
      },
      app: {
        name: "DOQCM",
        version: "1.0.0",
        maxQuestionsPerQCM: 10,
        maxEmailsPerDocument: 3,
        maxTextLength: 3000,
        maxSummaryLength: 250,
      },
    };
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Récupère la configuration complète
   */
  getConfig(): AppConfig {
    return this.config;
  }

  /**
   * Récupère la configuration Gemini
   */
  getGeminiConfig(): GeminiConfig {
    return this.config.gemini;
  }

  /**
   * Récupère la configuration Supabase
   */
  getSupabaseConfig() {
    return this.config.supabase;
  }

  /**
   * Récupère la configuration de l'application
   */
  getAppConfig() {
    return this.config.app;
  }

  /**
   * Met à jour la configuration Gemini
   */
  updateGeminiConfig(newConfig: Partial<GeminiConfig>): void {
    this.config.gemini = { ...this.config.gemini, ...newConfig };
  }

  /**
   * Met à jour la configuration de l'application
   */
  updateAppConfig(newConfig: Partial<AppConfig['app']>): void {
    this.config.app = { ...this.config.app, ...newConfig };
  }

  /**
   * Valide la configuration
   */
  validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.config.supabase.url) {
      errors.push("URL Supabase manquante");
    }

    if (!this.config.supabase.anonKey) {
      errors.push("Clé anonyme Supabase manquante");
    }

    if (!this.config.gemini.apiKey) {
      errors.push("Clé API Gemini manquante");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Récupère les variables d'environnement nécessaires
   */
  getRequiredEnvVars(): string[] {
    return [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_GEMINI_API_KEY",
    ];
  }

  /**
   * Vérifie si toutes les variables d'environnement sont définies
   */
  checkEnvVars(): { allDefined: boolean; missing: string[] } {
    const required = this.getRequiredEnvVars();
    const missing = required.filter(varName => !process.env[varName]);

    return {
      allDefined: missing.length === 0,
      missing,
    };
  }
} 