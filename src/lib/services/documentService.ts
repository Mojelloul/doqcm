import { SupabaseClient } from '@supabase/supabase-js';
import { 
  Document, 
  CreateDocumentData, 
  DocumentWithShares, 
  DocumentStats, 
  DocumentShare, 
  DocumentSearchParams,
  DocumentFilters,
  DocumentExport,
  DocumentValidation,
  DocumentMetadata,
  DocumentScore,
  UpdateDocumentData,
  DocumentFilter,
  DocumentSort,
  DocumentPermission,
  DocumentAccess,
  DocumentSearchResult,
  DocumentTemplate,
  DocumentActivity
} from '../types/document';
import { User } from '../types/user';
import { Question } from '../types/qcm';

export class DocumentService {
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
      if (filter.hasQCM !== undefined) {
        // Logique pour filtrer par présence de QCM
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
    
    // Transformer les données pour correspondre à notre interface
    const formattedData = data ? data.map((item: DocumentWithShares) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      summary: item.summary,
      owner_id: item.owner_id,
      created_at: item.created_at,
      shared_count: item.employees_documents ? item.employees_documents.length : 0
    })) : [];
    
    return formattedData;
  }

  /**
   * Récupère un document par son ID avec toutes ses relations
   */
  async getDocumentById(documentId: string, includeRelations: boolean = true): Promise<Document | null> {
    if (!documentId || typeof documentId !== 'string') {
      throw new Error('ID de document invalide');
    }

    try {
      // D'abord, récupérer le document de base
      const { data: document, error: documentError } = await this.supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (documentError) {
        console.error('Erreur lors de la récupération du document:', {
          error: documentError,
          documentId,
          errorCode: documentError.code,
          errorMessage: documentError.message
        });
        
        if (documentError.code === 'PGRST116') {
          return null; // Document non trouvé
        } else {
          throw new Error(`Erreur lors de la récupération du document: ${documentError.message || 'Erreur inconnue'}`);
        }
      }

      if (!document) {
        return null;
      }

      // Si on ne veut pas les relations, retourner le document de base
      if (!includeRelations) {
        return document;
      }

      // Récupérer les relations séparément pour éviter les erreurs
      try {
        // Récupérer les partages
        const { data: shares } = await this.supabase
          .from('employees_documents')
          .select('employee_id, score, created_at')
          .eq('document_id', documentId);

        // Récupérer les questions QCM
        const { data: questions } = await this.supabase
          .from('qcm_questions')
          .select('id, question, created_at')
          .eq('document_id', documentId);

        // Récupérer les choix pour chaque question
        let choicesByQuestion: Record<string, any[]> = {};
        if (questions && questions.length > 0) {
          const questionIds = questions.map(q => q.id);
          const { data: choices } = await this.supabase
            .from('qcm_choices')
            .select('id, choice, is_correct, question_id')
            .in('question_id', questionIds);

          if (choices) {
            choicesByQuestion = choices.reduce((acc, choice) => {
              if (!acc[choice.question_id]) {
                acc[choice.question_id] = [];
              }
              acc[choice.question_id].push(choice);
              return acc;
            }, {} as Record<string, any[]>);
          }
        }

        // Retourner le document avec les relations
        return {
          ...document,
          employees_documents: shares || [],
          qcm_questions: questions?.map(q => ({
            ...q,
            qcm_choices: choicesByQuestion[q.id] || []
          })) || []
        };

      } catch (relationsError) {
        console.warn('Erreur lors de la récupération des relations:', relationsError);
        // Retourner le document de base même si les relations échouent
        return document;
      }

    } catch (error: any) {
      console.error('Erreur générale lors de la récupération du document:', error);
      throw new Error(`Erreur lors de la récupération du document: ${error.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Crée un nouveau document
   */
  async createDocument(documentData: CreateDocumentData): Promise<Document> {
    try {
      console.log("DocumentService.createDocument - Données reçues:", {
        title: documentData.title,
        contentLength: documentData.content.length,
        summaryLength: documentData.summary.length,
        owner_id: documentData.owner_id
      });

      const { data: document, error } = await this.supabase
        .from("documents")
        .insert([documentData])
        .select()
        .single();

      console.log("DocumentService.createDocument - Résultat de la requête:", { document, error });

      if (error) {
        console.error('Erreur lors de la création du document:', {
          error,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint
        });
        throw new Error(`Erreur lors de la création du document: ${error.message || 'Erreur inconnue'}`);
      }

      if (!document) {
        throw new Error("Erreur lors de la création du document: Aucun document retourné");
      }

      console.log("DocumentService.createDocument - Document créé avec succès:", document.id);
      return document;
    } catch (error) {
      console.error('Erreur générale dans createDocument:', error);
      throw error;
    }
  }

  /**
   * Met à jour un document
   */
  async updateDocument(documentId: string, updateData: Partial<Document>, ownerId: string): Promise<Document> {
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
   * Partage un document avec des utilisateurs
   */
  async shareDocument(documentId: string, userIds: string[], permissions?: DocumentPermission): Promise<void> {
    if (!documentId || !userIds || userIds.length === 0) {
      throw new Error('Paramètres de partage invalides');
    }

    try {
      // Vérifier que le document existe
      const { data: document, error: docError } = await this.supabase
        .from('documents')
        .select('id')
        .eq('id', documentId)
        .single();

      if (docError || !document) {
        throw new Error('Document non trouvé');
      }

      // Préparer les données de partage (sans le champ permissions)
      const sharingData = userIds.map(userId => ({
        employee_id: userId,
        document_id: documentId
      }));

      console.log('Tentative de partage avec les données:', sharingData);

      // Insérer les partages
      const { data, error } = await this.supabase
        .from("employees_documents")
        .insert(sharingData)
        .select();

      if (error) {
        console.error('Erreur lors du partage du document:', {
          error,
          documentId,
          userIds,
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details
        });

        // Gérer les cas d'erreur spécifiques
        if (error.code === '23505') {
          throw new Error('Le document est déjà partagé avec certains utilisateurs');
        } else if (error.code === '23503') {
          throw new Error('Un ou plusieurs utilisateurs n\'existent pas');
        } else {
          throw new Error(`Erreur lors du partage: ${error.message || 'Erreur inconnue'}`);
        }
      }

      console.log('Partage réussi:', data);

    } catch (error: any) {
      console.error('Erreur lors du partage du document:', error);
      throw new Error(`Erreur lors du partage du document: ${error.message || 'Erreur inconnue'}`);
    }
  }

  /**
   * Récupère les utilisateurs avec qui un document est partagé
   */
  async getDocumentShares(documentId: string): Promise<Array<{
    user_id: string;
    user_email: string;
    score: number | null;
    shared_at: string;
  }>> {
    const { data: shares, error } = await this.supabase
      .from("employees_documents")
      .select(`
        employee_id,
        score,
        created_at,
        users (
          id,
          email
        )
      `)
      .eq("document_id", documentId);

    if (error) {
      console.error('Erreur lors de la récupération des partages:', error);
      throw error;
    }

    return shares?.map(share => ({
      user_id: share.employee_id,
      user_email: (share.users as any)?.email || '',
      score: share.score,
      shared_at: share.created_at
    })) || [];
  }

  /**
   * Retire le partage d'un document avec un utilisateur
   */
  async removeDocumentShare(documentId: string, userId: string, ownerId: string): Promise<void> {
    const { error } = await this.supabase
      .from("employees_documents")
      .delete()
      .eq("document_id", documentId)
      .eq("employee_id", userId);

    if (error) {
      console.error('Erreur lors de la suppression du partage:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un utilisateur a un score pour un document
   */
  async getUserScoreForDocument(documentId: string, userId: string): Promise<number | null> {
    const { data: existingScore, error } = await this.supabase
      .from('employees_documents')
      .select('score')
      .match({ 
        employee_id: userId,
        document_id: documentId
      })
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116 = Not found
      console.error("Erreur lors de la vérification du score existant:", error);
      throw error;
    }

    return existingScore?.score || null;
  }

  /**
   * Enregistre ou met à jour le score d'un utilisateur pour un document
   */
  async saveUserScore(documentId: string, userId: string, score: number): Promise<void> {
    // Essayer de mettre à jour d'abord
    const { data: updateData, error: updateError } = await this.supabase
      .from('employees_documents')
      .update({ score })
      .match({ 
        employee_id: userId,
        document_id: documentId
      })
      .select();

    if (updateError) {
      console.error("Erreur lors de l'enregistrement du score:", updateError);
      throw new Error("Erreur lors de l'enregistrement du score");
    }

    // Si aucune ligne n'a été mise à jour, insérer
    if (!updateData || updateData.length === 0) {
      const { error: insertError } = await this.supabase
        .from('employees_documents')
        .insert([{ 
          employee_id: userId,
          document_id: documentId,
          score
        }]);

      if (insertError) {
        console.error("Erreur lors de l'insertion du score:", insertError);
        throw new Error("Erreur lors de l'insertion du score");
      }
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
      relevance: 1.0, // Logique de pertinence à implémenter
      matchedFields: ['title', 'content']
    })) || [];
  }

  /**
   * Récupère les statistiques d'un document
   */
  async getDocumentStats(documentId: string): Promise<DocumentStats> {
    const { data: shares, error: sharesError } = await this.supabase
      .from('employees_documents')
      .select('score')
      .eq('document_id', documentId)
      .not('score', 'is', null);

    if (sharesError) {
      console.error('Erreur lors de la récupération des statistiques:', sharesError);
      throw sharesError;
    }

    const scores = shares?.map(s => s.score || 0) || [];
    const totalShares = scores.length;
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    return {
      totalQuestions: 0, // À implémenter
      totalAttempts: totalShares,
      averageScore,
      bestScore,
      completionRate: 0, // À implémenter
      sharedCount: totalShares
    };
  }

  /**
   * Vérifie les permissions d'accès d'un utilisateur sur un document
   */
  async checkDocumentAccess(documentId: string, userId: string): Promise<DocumentAccess> {
    // Vérifier si l'utilisateur est propriétaire
    const { data: document } = await this.supabase
      .from('documents')
      .select('owner_id')
      .eq('id', documentId)
      .single();

    if (document?.owner_id === userId) {
      return {
        canRead: true,
        canWrite: true,
        canDelete: true,
        canShare: true
      };
    }

    // Vérifier si l'utilisateur a accès au document via le partage
    const { data: share } = await this.supabase
      .from('employees_documents')
      .select('employee_id')
      .match({ document_id: documentId, employee_id: userId })
      .single();

    if (share) {
      // Si l'utilisateur est dans la table employees_documents, il a accès en lecture
      return {
        canRead: true,
        canWrite: false,
        canDelete: false,
        canShare: false
      };
    }

    return {
      canRead: false,
      canWrite: false,
      canDelete: false,
      canShare: false
    };
  }

  /**
   * Exporte un document
   */
  async exportDocument(documentId: string, format: 'json' | 'txt' | 'pdf' = 'json'): Promise<{
    content: string;
    mimeType: string;
    filename: string;
    size: number;
  }> {
    const document = await this.getDocumentById(documentId);
    
    if (!document) {
      throw new Error('Document non trouvé');
    }

    let content: string;
    let mimeType: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(document, null, 2);
        mimeType = 'application/json';
        break;
      case 'txt':
        content = `${document.title}\n\n${document.content}`;
        mimeType = 'text/plain';
        break;
      case 'pdf':
        // Logique pour générer PDF
        content = `${document.title}\n\n${document.content}`;
        mimeType = 'application/pdf';
        break;
      default:
        throw new Error('Format non supporté');
    }

    return {
      content,
      mimeType,
      filename: `${document.title}.${format}`,
      size: content.length
    };
  }

  /**
   * Importe un document
   */
  async importDocument(content: string, title: string, ownerId: string, format: 'json' | 'txt' = 'txt'): Promise<Document> {
    let documentData: CreateDocumentData;

    if (format === 'json') {
      try {
        const parsed = JSON.parse(content);
        documentData = {
          title: parsed.title || title,
          content: parsed.content || content,
          summary: parsed.summary || '',
          owner_id: ownerId
        };
      } catch (error) {
        throw new Error('Format JSON invalide');
      }
    } else {
      documentData = {
        title,
        content,
        summary: '',
        owner_id: ownerId
      };
    }

    return await this.createDocument(documentData);
  }

  /**
   * Crée un document à partir d'un template
   */
  async createFromTemplate(template: DocumentTemplate, ownerId: string, customData?: any): Promise<Document> {
    const documentData: CreateDocumentData = {
      title: template.title,
      content: template.content,
      summary: template.summary || '',
      owner_id: ownerId
    };

    // Appliquer les données personnalisées si fournies
    if (customData) {
      Object.keys(customData).forEach(key => {
        documentData.content = documentData.content.replace(`{{${key}}}`, customData[key]);
      });
    }

    return await this.createDocument(documentData);
  }

  /**
   * Récupère l'activité d'un document
   */
  async getDocumentActivity(documentId: string): Promise<DocumentActivity[]> {
    // Cette fonction pourrait être étendue pour tracker les modifications, partages, etc.
    const { data: shares, error } = await this.supabase
      .from('employees_documents')
      .select('employee_id, created_at, score')
      .eq('document_id', documentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération de l\'activité:', error);
      throw error;
    }

    return shares?.map(share => ({
      type: share.score ? 'qcm_completed' : 'document_shared',
      user_id: share.employee_id,
      timestamp: share.created_at,
      details: share.score ? `Score: ${share.score}` : 'Document partagé'
    })) || [];
  }
} 