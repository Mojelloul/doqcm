import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Document, 
  CreateDocumentData, 
  UpdateDocumentData,
  DocumentFilter,
  DocumentSort,
  DocumentSearchResult
} from '../types/document';

export class DocumentRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Récupère tous les documents d'un utilisateur
   */
  async getUserDocuments(userId: string, filter?: DocumentFilter, sort?: DocumentSort): Promise<Document[]> {
    let query = this.supabase
      .from('documents')
      .select('*, employees_documents(document_id)')
      .eq('owner_id', userId);

    // Appliquer les filtres
    if (filter) {
      if (filter.title) {
        query = query.ilike('title', `%${filter.title}%`);
      }
      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom);
      }
      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo);
      }
    }

    // Appliquer le tri
    if (sort) {
      query = query.order(sort.field, { ascending: sort.ascending });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      throw error;
    }
    
    return data || [];
  }

  /**
   * Récupère un document par son ID
   */
  async getDocumentById(documentId: string): Promise<Document | null> {
    if (!documentId || typeof documentId !== 'string') {
      throw new Error('ID de document invalide');
    }

    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Document non trouvé
      }
      throw error;
    }

    return data;
  }

  /**
   * Crée un nouveau document
   */
  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    const { data: document, error } = await this.supabase
      .from("documents")
      .insert([documentData])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création du document:', error);
      throw error;
    }

    if (!document) {
      throw new Error("Erreur lors de la création du document");
    }

    return document;
  }

  /**
   * Met à jour un document
   */
  async updateDocument(documentId: string, updateData: UpdateDocumentData, ownerId: string): Promise<Document> {
    const { data: document, error } = await this.supabase
      .from("documents")
      .update(updateData)
      .eq("id", documentId)
      .eq("owner_id", ownerId)
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la mise à jour du document:', error);
      throw error;
    }

    if (!document) {
      throw new Error("Document non trouvé ou vous n'avez pas les permissions");
    }

    return document;
  }

  /**
   * Supprime un document
   */
  async deleteDocument(documentId: string, ownerId: string): Promise<void> {
    const { error } = await this.supabase
      .from("documents")
      .delete()
      .eq("id", documentId)
      .eq("owner_id", ownerId);

    if (error) {
      console.error('Erreur lors de la suppression du document:', error);
      throw error;
    }
  }

  /**
   * Recherche des documents
   */
  async searchDocuments(query: string, userId: string): Promise<DocumentSearchResult[]> {
    const { data: documents, error } = await this.supabase
      .from('documents')
      .select('*')
      .or(`owner_id.eq.${userId},employees_documents.employee_id.eq.${userId}`)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la recherche de documents:', error);
      throw error;
    }

    return documents?.map(doc => ({
      document: doc,
      relevance: 1.0,
      matchedFields: ['title', 'content']
    })) || [];
  }

  /**
   * Vérifie si un document existe
   */
  async documentExists(documentId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('id')
      .eq('id', documentId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  }

  /**
   * Récupère le propriétaire d'un document
   */
  async getDocumentOwner(documentId: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data?.owner_id || null;
  }
} 