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
    <div className="container px-4 sm:px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TextAnalysisForm />
        </div>
        <div className="lg:col-span-1">
          {userId && <SubscriptionInfo userId={userId} />}
        </div>
      </div>
    </div>
  );
} 