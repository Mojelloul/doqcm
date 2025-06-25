-- Script pour corriger les utilisateurs existants sans abonnement
-- S'assurer que l'offre gratuite existe
INSERT INTO public.offers (name, daily_document_limit, max_characters, max_recipients, price, description)
VALUES (
  'free',
  10,
  5000,
  20,
  0,
  'Plan gratuit - 10 documents par jour, 5000 caractères, 20 destinataires'
) ON CONFLICT (name) DO NOTHING;

-- Récupérer l'ID de l'offre gratuite
DO $$
DECLARE
  free_offer_id UUID;
BEGIN
  SELECT id INTO free_offer_id FROM public.offers WHERE name = 'free' LIMIT 1;
  
  -- Ajouter un abonnement gratuit aux utilisateurs qui n'en ont pas
  INSERT INTO public.user_subscriptions (user_id, offer_id, status, start_date)
  SELECT 
    u.id,
    free_offer_id,
    'active',
    u.created_at
  FROM public.users u
  LEFT JOIN public.user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
  WHERE us.id IS NULL
  AND free_offer_id IS NOT NULL;
  
  -- Afficher le nombre d'utilisateurs corrigés
  RAISE NOTICE 'Abonnements gratuits ajoutés pour les utilisateurs existants';
END $$;

-- Vérifier le résultat
SELECT 
  'Utilisateurs avec abonnement' as status,
  COUNT(DISTINCT us.user_id) as count
FROM public.user_subscriptions us
WHERE us.status = 'active'
UNION ALL
SELECT 
  'Utilisateurs sans abonnement' as status,
  COUNT(u.id) as count
FROM public.users u
LEFT JOIN public.user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
WHERE us.id IS NULL; 