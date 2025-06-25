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
    <div className="container px-2 sm:px-4 py-4 max-w-lg md:max-w-5xl mx-auto">
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TextAnalysisForm />
        </div>
        <div className="lg:col-span-1 mt-6 lg:mt-0">
          {userId && <SubscriptionInfo userId={userId} />}
        </div>
      </div>
    </div>
  );
} 