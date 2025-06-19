import { useSupabaseContext } from '../context/SupabaseProvider';
import { UserService } from '../services/userService';
import { DocumentService } from '../services/documentService';
import { QCMService } from '../services/qcmService';
import { AIService } from '../services/aiService';
import { ConfigService } from '../services/configService';
import { UtilityService } from '../services/utilityService';
import { errorHandler } from '../services/errorHandler';
import { cacheService } from '../services/cacheService';
import { notificationService } from '../services/notificationService';
import { useMemo } from 'react';

export function useServices() {
  const { supabase } = useSupabaseContext();

  const services = useMemo(() => {
    const aiService = new AIService();
    
    return {
      userService: new UserService(supabase),
      documentService: new DocumentService(supabase),
      qcmService: new QCMService(supabase, aiService),
      aiService,
      configService: ConfigService.getInstance(),
      utilityService: new UtilityService(),
      errorHandler,
      cacheService,
      notificationService,
    };
  }, [supabase]);

  return services;
} 