'use client';

import { useEffect, useState } from 'react';
import { TextAnalysisForm } from "@/components/text-analysis/TextAnalysisForm";
import SubscriptionInfo from "@/components/subscription/SubscriptionInfo";
import { useSupabaseContext } from "@/lib/context/SupabaseProvider";

export default function DashboardPage() {
  const { supabase } = useSupabaseContext();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container px-4 sm:px-6 py-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Analysez vos documents et générez des QCM en toute simplicité
          </p>
        </div>
        
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TextAnalysisForm />
          </div>
          <div className="lg:col-span-1">
            {userId && <SubscriptionInfo userId={userId} />}
          </div>
        </div>
      </div>
    </div>
  );
} 