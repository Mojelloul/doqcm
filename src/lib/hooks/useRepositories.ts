import { useSupabaseContext } from '../context/SupabaseProvider';
import { DocumentRepository, QCMRepository, UserRepository } from '../repositories';
import { useMemo } from 'react';

export function useRepositories() {
  const { supabase } = useSupabaseContext();

  const repositories = useMemo(() => {
    return {
      documentRepository: new DocumentRepository(supabase),
      qcmRepository: new QCMRepository(supabase),
      userRepository: new UserRepository(supabase),
    };
  }, [supabase]);

  return repositories;
} 