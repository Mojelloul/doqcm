export interface Offer {
  id: string;
  name: string;
  daily_document_limit: number;
  max_characters: number;
  max_recipients: number;
  price?: number;
  description?: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  offer_id: string;
  status: 'active' | 'expired' | 'suspended';
  start_date: string;
  end_date?: string;
  trial_used: boolean;
  created_at: string;
  offer?: Offer; // Relation avec l'offre
}

export interface DailyUsageLog {
  id: string;
  user_id: string;
  date: string;
  documents_created: number;
  characters_used: number;
  recipients_added: number;
  created_at: string;
}

export interface SubscriptionLimits {
  dailyDocuments: number;
  maxCharacters: number;
  maxRecipients: number;
}

export interface UsageStats {
  documentsToday: number;
  charactersUsed: number;
  recipientsAdded: number;
}

export interface CanCreateDocumentResult {
  canCreate: boolean;
  reason?: string;
  limits: SubscriptionLimits;
  usage: UsageStats;
} 