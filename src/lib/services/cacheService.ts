/**
 * Service de cache pour optimiser les performances
 */

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
}

export interface CacheConfig {
  defaultTTL: number; // 5 minutes par défaut
  maxSize: number; // Nombre maximum d'éléments en cache
  cleanupInterval: number; // Intervalle de nettoyage en millisecondes
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>> = new Map();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  private constructor(config?: Partial<CacheConfig>) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      cleanupInterval: 60 * 1000, // 1 minute
      ...config
    };

    this.startCleanup();
  }

  static getInstance(config?: Partial<CacheConfig>): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService(config);
    }
    return CacheService.instance;
  }

  /**
   * Met en cache une valeur
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL
    };

    // Si le cache est plein, supprimer l'élément le plus ancien
    if (this.cache.size >= this.config.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, item);
  }

  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    // Vérifier si l'élément a expiré
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Supprime une clé du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Vide tout le cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Récupère la taille du cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Récupère les clés du cache
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Met en cache avec une fonction de génération
   */
  async getOrSet<T>(
    key: string, 
    generator: () => Promise<T>, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = await generator();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Met en cache avec une fonction de génération synchrone
   */
  getOrSetSync<T>(
    key: string, 
    generator: () => T, 
    ttl?: number
  ): T {
    const cached = this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const data = generator();
    this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalide le cache pour un pattern de clés
   */
  invalidatePattern(pattern: RegExp): number {
    let deletedCount = 0;
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  /**
   * Invalide le cache pour un préfixe
   */
  invalidatePrefix(prefix: string): number {
    return this.invalidatePattern(new RegExp(`^${prefix}`));
  }

  /**
   * Démarre le nettoyage automatique
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Nettoie les éléments expirés
   */
  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      console.log(`Cache cleanup: removed ${deletedCount} expired items`);
    }
  }

  /**
   * Arrête le service de cache
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

// Export de l'instance singleton
export const cacheService = CacheService.getInstance(); 