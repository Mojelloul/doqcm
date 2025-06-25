'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useSupabaseContext } from '@/lib/context/SupabaseProvider';
import { SubscriptionService } from '@/lib/services/subscriptionService';
import { CanCreateDocumentResult, Offer } from '@/lib/types/subscription';

interface SubscriptionInfoProps {
  userId: string;
}

export default function SubscriptionInfo({ userId }: SubscriptionInfoProps) {
  const { supabase } = useSupabaseContext();
  const [subscriptionInfo, setSubscriptionInfo] = useState<CanCreateDocumentResult | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionInfo();
  }, [userId]);

  const loadSubscriptionInfo = async () => {
    try {
      setLoading(true);
      const subscriptionService = new SubscriptionService(supabase);
      
      // Charger les informations d'abonnement
      const info = await subscriptionService.canCreateDocument(userId);
      setSubscriptionInfo(info);

      // Charger les offres disponibles
      const availableOffers = await subscriptionService.getOffers();
      setOffers(availableOffers);
    } catch (error) {
      console.error('Erreur lors du chargement des informations d\'abonnement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (canCreate: boolean) => {
    return canCreate ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getProgressColor = (used: number, limit: number) => {
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscriptionInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Abonnement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Impossible de charger les informations d'abonnement</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Abonnement
          <Badge className={getStatusColor(subscriptionInfo.canCreate)}>
            {subscriptionInfo.canCreate ? 'Actif' : 'Limité'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!subscriptionInfo.canCreate && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm font-medium">
              {subscriptionInfo.reason}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Documents aujourd'hui</span>
              <span>{subscriptionInfo.usage.documentsToday} / {subscriptionInfo.limits.dailyDocuments}</span>
            </div>
            <Progress 
              value={(subscriptionInfo.usage.documentsToday / subscriptionInfo.limits.dailyDocuments) * 100} 
              className="h-2"
            />
          </div>

          <div className="text-sm text-gray-600">
            <p>Limites par document :</p>
            <ul className="mt-1 space-y-1">
              <li>• Maximum {subscriptionInfo.limits.maxCharacters.toLocaleString()} caractères</li>
              <li>• Maximum {subscriptionInfo.limits.maxRecipients} destinataires</li>
            </ul>
          </div>
        </div>

        {offers.length > 1 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Offres disponibles</h4>
            <div className="space-y-2">
              {offers.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium capitalize">{offer.name}</p>
                    <p className="text-xs text-gray-600">{offer.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {offer.price === 0 ? 'Gratuit' : `${offer.price}€`}
                    </p>
                    <p className="text-xs text-gray-600">
                      {offer.daily_document_limit} docs/jour
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 