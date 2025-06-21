import { createWorker, Worker } from 'tesseract.js';

// Configuration optimisée pour Tesseract.js
export const TESSERACT_CONFIG = {
  // Langues supportées
  languages: ['fra', 'eng','ara'],
  
  // Paramètres de reconnaissance
  logger: (m: any) => {
    // Log seulement les erreurs et les informations importantes
    if (m.status === 'error' || m.status === 'success') {
      console.log('Tesseract:', m);
    }
  },
  
  // Paramètres de performance
  workerOptions: {
    // Utiliser le modèle de données optimisé
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    // Paramètres de reconnaissance
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}"\'-_/\\@#$%&*+=<>|~`',
    // Améliorer la précision
    tessedit_pageseg_mode: '6', // Uniform block of text
    tessedit_ocr_engine_mode: '3', // Default, based on what is available
  }
};

// Cache pour les workers Tesseract
let workerCache: Worker | null = null;

/**
 * Obtient un worker Tesseract initialisé
 */
export async function getTesseractWorker(): Promise<Worker> {
  if (workerCache) {
    return workerCache;
  }

  const worker = await createWorker(TESSERACT_CONFIG.languages, 1, {
    logger: TESSERACT_CONFIG.logger,
    ...TESSERACT_CONFIG.workerOptions
  });

  workerCache = worker;
  return worker;
}

/**
 * Libère le worker Tesseract
 */
export async function releaseTesseractWorker(): Promise<void> {
  if (workerCache) {
    await workerCache.terminate();
    workerCache = null;
  }
}

/**
 * Reconnaît le texte dans une image
 */
export async function recognizeText(imageFile: File): Promise<string> {
  const worker = await getTesseractWorker();
  
  try {
    const { data: { text } } = await worker.recognize(imageFile);
    return text.trim();
  } catch (error) {
    console.error('Erreur lors de la reconnaissance de texte:', error);
    throw new Error('Erreur lors de la reconnaissance de texte dans l\'image');
  }
} 