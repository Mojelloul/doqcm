import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Offer, 
  UserSubscription, 
  DailyUsageLog, 
  CanCreateDocumentResult,
  SubscriptionLimits,
  UsageStats
} from '../types/subscription';

export class SubscriptionService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Vérifier si l'utilisateur peut créer un document
   */
  async canCreateDocument(userId: string): Promise<CanCreateDocumentResult> {
    try {
      // Obtenir l'abonnement actuel de l'utilisateur
      const subscription = await this.getUserSubscription(userId);
      
      if (!subscription || subscription.status !== 'active') {
        return {
          canCreate: false,
          reason: 'Aucun abonnement actif trouvé',
          limits: { dailyDocuments: 0, maxCharacters: 0, maxRecipients: 0 },
          usage: { documentsToday: 0, charactersUsed: 0, recipientsAdded: 0 }
        };
      }

      // Obtenir l'offre
      const offer = subscription.offer;
      if (!offer) {
        return {
          canCreate: false,
          reason: 'Offre non trouvée',
          limits: { dailyDocuments: 0, maxCharacters: 0, maxRecipients: 0 },
          usage: { documentsToday: 0, charactersUsed: 0, recipientsAdded: 0 }
        };
      }

      // Obtenir l'utilisation d'aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const usage = await this.getDailyUsage(userId, today);

      const limits: SubscriptionLimits = {
        dailyDocuments: offer.daily_document_limit,
        maxCharacters: offer.max_characters,
        maxRecipients: offer.max_recipients
      };

      const usageStats: UsageStats = {
        documentsToday: usage?.documents_created || 0,
        charactersUsed: 0, // On ne compte plus les caractères par jour
        recipientsAdded: 0  // On ne compte plus les destinataires par jour
      };

      // Vérifier seulement la limite de documents par jour
      if (usageStats.documentsToday >= limits.dailyDocuments) {
        return {
          canCreate: false,
          reason: `Limite quotidienne atteinte (${limits.dailyDocuments} documents/jour)`,
          limits,
          usage: usageStats
        };
      }

      return {
        canCreate: true,
        limits,
        usage: usageStats
      };

    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return {
        canCreate: false,
        reason: 'Erreur lors de la vérification des permissions',
        limits: { dailyDocuments: 0, maxCharacters: 0, maxRecipients: 0 },
        usage: { documentsToday: 0, charactersUsed: 0, recipientsAdded: 0 }
      };
    }
  }

  /**
   * Vérifier si le contenu et les destinataires respectent les limites
   */
  async validateDocumentCreation(
    userId: string, 
    contentLength: number, 
    recipientsCount: number
  ): Promise<{ isValid: boolean; reason?: string }> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription || !subscription.offer) {
      return { isValid: false, reason: 'Aucun abonnement actif' };
    }

    const offer = subscription.offer;

    if (contentLength > offer.max_characters) {
      return { 
        isValid: false, 
        reason: `Contenu trop long (${contentLength} caractères). Limite: ${offer.max_characters}` 
      };
    }

    if (recipientsCount > offer.max_recipients) {
      return { 
        isValid: false, 
        reason: `Trop de destinataires (${recipientsCount}). Limite: ${offer.max_recipients}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Incrémenter l'utilisation quotidienne (seulement les documents)
   */
  async incrementDailyUsage(userId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    
    // Vérifier si un log existe déjà pour aujourd'hui
    const { data: existingLog } = await this.supabase
      .from('daily_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingLog) {
      // Mettre à jour le log existant - seulement les documents
      const { error } = await this.supabase
        .from('daily_usage_logs')
        .update({
          documents_created: existingLog.documents_created + 1
        })
        .eq('id', existingLog.id);

      if (error) {
        console.error('Erreur lors de la mise à jour du log d\'utilisation:', error);
        throw error;
      }
    } else {
      // Créer un nouveau log - seulement les documents
      const { error } = await this.supabase
        .from('daily_usage_logs')
        .insert({
          user_id: userId,
          date: today,
          documents_created: 1,
          characters_used: 0,
          recipients_added: 0
        });

      if (error) {
        console.error('Erreur lors de la création du log d\'utilisation:', error);
        throw error;
      }
    }
  }

  /**
   * Obtenir l'abonnement actuel de l'utilisateur
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .select(`
        *,
        offer:offers(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération de l\'abonnement:', error);
      return null;
    }

    return data;
  }

  /**
   * Obtenir l'utilisation quotidienne
   */
  async getDailyUsage(userId: string, date: string): Promise<DailyUsageLog | null> {
    const { data, error } = await this.supabase
      .from('daily_usage_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erreur lors de la récupération de l\'utilisation:', error);
      return null;
    }

    return data;
  }

  /**
   * Créer un abonnement pour un utilisateur
   */
  async createSubscription(userId: string, offerId: string): Promise<void> {
    // Désactiver l'abonnement précédent s'il existe
    await this.supabase
      .from('user_subscriptions')
      .update({ status: 'expired' })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Créer le nouvel abonnement
    const { error } = await this.supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        offer_id: offerId,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: null // Pour l'instant, pas de date de fin
      });

    if (error) {
      console.error('Erreur lors de la création de l\'abonnement:', error);
      throw error;
    }
  }

  /**
   * Obtenir toutes les offres disponibles
   */
  async getOffers(): Promise<Offer[]> {
    const { data, error } = await this.supabase
      .from('offers')
      .select('*')
      .order('price', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des offres:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Initialiser les offres par défaut (gratuit et premium)
   */
  async initializeDefaultOffers(): Promise<void> {
    const { data: existingOffers } = await this.supabase
      .from('offers')
      .select('name');

    if (existingOffers && existingOffers.length > 0) {
      console.log('Les offres existent déjà');
      return;
    }

    const defaultOffers = [
      {
        name: 'free',
        daily_document_limit: 10,
        max_characters: 5000,
        max_recipients: 20,
        price: 0,
        description: 'Plan gratuit - 10 document par jour, 5000 caractères, 20 destinataires'
      },
      {
        name: 'premium',
        daily_document_limit: 100,
        max_characters: 10000,
        max_recipients: 50,
        price: 9.99,
        description: 'Plan premium - 100 documents par jour, 10000 caractères, 50 destinataires'
      }
    ];

    const { error } = await this.supabase
      .from('offers')
      .insert(defaultOffers);

    if (error) {
      console.error('Erreur lors de l\'initialisation des offres:', error);
      throw error;
    }

    console.log('Offres par défaut créées avec succès');
  }
} 