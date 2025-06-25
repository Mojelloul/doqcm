-- Script d'initialisation des abonnements
-- 1. Créer les offres par défaut
-- 2. Créer des abonnements gratuits pour les utilisateurs existants

-- Vérifier si les offres existent déjà
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM offers WHERE name = 'free') THEN
        INSERT INTO offers (name, daily_document_limit, max_characters, max_recipients, price, description)
        VALUES (
            'free',
            1,
            5000,
            20,
            0,
            'Plan gratuit - 1 document par jour, 5000 caractères, 20 destinataires'
        );
        RAISE NOTICE 'Offre gratuite créée';
    ELSE
        RAISE NOTICE 'Offre gratuite existe déjà';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM offers WHERE name = 'premium') THEN
        INSERT INTO offers (name, daily_document_limit, max_characters, max_recipients, price, description)
        VALUES (
            'premium',
            10,
            10000,
            50,
            9.99,
            'Plan premium - 10 documents par jour, 10000 caractères, 50 destinataires'
        );
        RAISE NOTICE 'Offre premium créée';
    ELSE
        RAISE NOTICE 'Offre premium existe déjà';
    END IF;
END $$;

-- Créer des abonnements gratuits pour les utilisateurs existants qui n'en ont pas
INSERT INTO user_subscriptions (user_id, offer_id, status, start_date)
SELECT 
    u.id,
    o.id,
    'active',
    NOW()
FROM users u
CROSS JOIN offers o
WHERE o.name = 'free'
AND NOT EXISTS (
    SELECT 1 FROM user_subscriptions us 
    WHERE us.user_id = u.id AND us.status = 'active'
);

-- Afficher le nombre d'abonnements créés
SELECT COUNT(*) as abonnements_crees FROM user_subscriptions WHERE status = 'active';

-- Afficher les offres disponibles
SELECT name, daily_document_limit, max_characters, max_recipients, price, description FROM offers ORDER BY price; 