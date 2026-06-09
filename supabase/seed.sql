-- =====================================================================
-- Vitrio — Données de démonstration
-- Crée un admin, des clients, leurs sites, messages, abonnements et des
-- demandes de contact, pour pouvoir démontrer l'app immédiatement.
--
-- ⚠️ Réservé au développement local (supabase db reset).
-- Les utilisateurs sont créés directement dans auth.users ; le trigger
-- handle_new_user crée automatiquement leur profil, que l'on enrichit ensuite.
--
-- Connexion (magic link en prod) — en local, mot de passe : « vitrio1234 »
-- =====================================================================

-- Identifiants fixes pour pouvoir relier les enregistrements entre eux.
-- admin : 00000000-0000-0000-0000-000000000001
-- léa   : 00000000-0000-0000-0000-000000000002 (restaurant)
-- karim : 00000000-0000-0000-0000-000000000003 (garage)
-- sophie: 00000000-0000-0000-0000-000000000004 (immobilier)

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'admin@vitrio.fr', crypt('vitrio1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"nom":"Admin Vitrio","entreprise":"Vitrio SAS"}', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lea@bistrot-lumiere.fr', crypt('vitrio1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"nom":"Léa Martin","entreprise":"Le Bistrot Lumière"}', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'karim@garage-central.fr', crypt('vitrio1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"nom":"Karim Benali","entreprise":"Garage Central"}', now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sophie@horizon-immo.fr', crypt('vitrio1234', gen_salt('bf')), now(),
   '{"provider":"email","providers":["email"]}', '{"nom":"Sophie Durand","entreprise":"Horizon Immobilier"}', now(), now())
on conflict (id) do nothing;

-- Enrichir les profils (le trigger les a déjà créés).
update public.profiles set role = 'admin' where user_id = '00000000-0000-0000-0000-000000000001';

-- Sites des clients
insert into public.sites (id, owner_id, url_origine, nom_domaine, statut, contenu, created_at)
values
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002',
   'https://ancien-bistrot-lumiere.fr', 'bistrot-lumiere.fr', 'en_ligne',
   '{"entreprise":"Le Bistrot Lumière","slogan":"Cuisine de marché, ambiance chaleureuse","telephone":"04 76 00 11 22","email":"contact@bistrot-lumiere.fr","adresse":"5 place Victor Hugo, 38000 Grenoble","horaires":"Mar–Sam : 12h–14h / 19h–22h","promo":"Menu déjeuner à 18€ en semaine","apropos":"Depuis 2009, Le Bistrot Lumière revisite les classiques avec des produits locaux et de saison.","couleur":"#b4541f"}'::jsonb,
   now() - interval '40 days'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003',
   'https://ancien-garage-central.fr', 'garage-central-grenoble.fr', 'en_ligne',
   '{"entreprise":"Garage Central","slogan":"Entretien et réparation toutes marques","telephone":"04 76 33 44 55","email":"contact@garage-central.fr","adresse":"18 avenue Jean Jaurès, 38100 Grenoble","horaires":"Lun–Ven : 8h–18h","promo":"Diagnostic offert ce mois-ci","apropos":"Une équipe de mécaniciens passionnés au service de votre véhicule depuis plus de 20 ans.","couleur":"#1f4fb4"}'::jsonb,
   now() - interval '22 days'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004',
   'https://ancien-horizon-immo.fr', null, 'analyse',
   '{"entreprise":"Horizon Immobilier","slogan":"Votre projet, notre priorité","telephone":"04 76 88 99 00","email":"contact@horizon-immo.fr","adresse":"42 cours Berriat, 38000 Grenoble","horaires":"Lun–Sam : 9h–19h","apropos":"Agence indépendante spécialisée dans l'achat, la vente et la location sur l'agglomération grenobloise."}'::jsonb,
   now() - interval '3 days');

-- Messages reçus sur les sites des clients
insert into public.site_messages (site_id, nom, email, message, lu, recu_le)
values
  ('10000000-0000-0000-0000-000000000002', 'Paul Riviere', 'paul.riviere@email.fr',
   'Bonjour, avez-vous une table pour 6 personnes vendredi soir ?', false, now() - interval '2 hours'),
  ('10000000-0000-0000-0000-000000000002', 'Inès Caron', 'ines.caron@email.fr',
   'Proposez-vous un menu végétarien ? Merci d''avance.', false, now() - interval '1 day'),
  ('10000000-0000-0000-0000-000000000002', 'Marc Petit', 'marc.petit@email.fr',
   'Super soirée hier, le service était parfait !', true, now() - interval '4 days'),
  ('10000000-0000-0000-0000-000000000003', 'Julie Fontaine', 'julie.fontaine@email.fr',
   'Combien coûte une révision complète sur une Clio IV ?', false, now() - interval '6 hours'),
  ('10000000-0000-0000-0000-000000000003', 'Thomas Leroy', 'thomas.leroy@email.fr',
   'Pouvez-vous me rappeler pour un devis embrayage ?', true, now() - interval '3 days');

-- Abonnements (hébergement)
insert into public.subscriptions (user_id, stripe_customer_id, stripe_subscription_id, statut, plan, periode_fin)
values
  ('00000000-0000-0000-0000-000000000002', 'cus_demo_lea', 'sub_demo_lea', 'active', 'pro', now() + interval '21 days'),
  ('00000000-0000-0000-0000-000000000003', 'cus_demo_karim', 'sub_demo_karim', 'active', 'essentiel', now() + interval '12 days'),
  ('00000000-0000-0000-0000-000000000004', 'cus_demo_sophie', null, 'inactive', null, null);

-- Demandes de contact reçues sur le site marketing Vitrio
insert into public.contact_requests (nom, email, message, traite, recu_le)
values
  ('Nadia Bouaziz', 'nadia@fleurs-nadia.fr',
   'Bonjour, je tiens un magasin de fleurs et mon site date de 2015. J''aimerais un devis pour une refonte.', false, now() - interval '5 hours'),
  ('Olivier Mercier', 'contact@plomberie-mercier.fr',
   'Intéressé par l''offre Pro. Est-ce que la prise de RDV en ligne est incluse ?', false, now() - interval '2 days'),
  ('Camille Roy', 'camille@institut-eclat.fr',
   'Mon institut de beauté n''a pas de site du tout. Vous partez de zéro aussi ?', true, now() - interval '6 days');
