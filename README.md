# 🌟 WaqtApp: Plateforme Web Bilingue de Gestion de Rendez-vous

**WaqtApp** est une application web moderne (React 18 + Vite + TypeScript + Tailwind CSS) dédiée à la prise de rendez-vous multi-secteurs au Maroc (Santé, Beauté & Spa, Notaires & Adouls, Mécanique Auto, Artisans).

Conçue pour un accès libre et direct en mode démo (sans e-mail ni mot de passe requis), elle propose une expérience fluide bilingue Français / Arabe avec support natif RTL / LTR.

## ✨ Fonctionnalités Clés

*   **Accès Libre & Démo Publique :** Testez l'ensemble des parcours instantanément sans aucune contrainte d'authentification.
*   **Trois Espaces Dédiés :**
    *   **🧑‍💻 Espace Citoyen / Client :** Recherche multicritère (par ville, spécialité, nom), consultation des fiches détaillées, prise de rendez-vous en ligne avec créneaux horaires, calcul des tarifs (DH), choix d'acompte (Stripe / CMI simulé), synchronisation Google Calendar et gestion des annulations.
    *   **💼 Espace Professionnel (Mawid Pro) :** Tableau de bord d'activité (RDV confirmés, CA estimé), gestion en direct du statut des consultations (Confirmer, Terminer, Annuler), module de gestion des collaborateurs et rôles (Gérant, Réceptionniste, Collaborateur), souscription aux plans Pro (Mensuel / Annuel).
    *   **🛡️ Espace Administration & Annuaire :** Module d'analyse et d'extraction automatique à partir de textes bruts copiés d'annuaires professionnels (ex: Télécontact Casablanca, Rabat...), alimentation par lot de la base de données, et édition en direct des fiches existantes (libellés bilingues, adresses, téléphones, tarifs).
*   **Bilingue Intégral Français / Arabe :** Basculement instantané d'une langue à l'autre avec adaptation complète du sens de lecture (RTL / LTR) et typographie soignée (Cairo & Plus Jakarta Sans).
*   **Persistance Locale (`localStorage`) :** Toutes les modifications, réservations et données importées sont conservées localement dans le navigateur.

## 🚀 Déploiement sur Vercel

Cette application est prête pour un déploiement continu sur **Vercel** :

1. Connectez votre dépôt GitHub à [Vercel](https://vercel.com).
2. Framework Preset : **Vite**
3. Build Command : `npm run build`
4. Output Directory : `dist`
5. Install Command : `npm install`
