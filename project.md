# Projet Web : Système de Gestion Utilisateurs & Campagnes

Ce document définit les spécifications fonctionnelles pour le développement de l'application web.

## 1. Architecture Authentification & Inscription
### Inscription (Workflow complet)
- **Champs requis :** Nom, Email, Nationalité, Sexe, Mot de passe, Diplôme, Photo.
- **Validation en temps réel :**
    - Vérification de l'existence de l'email (doublon interdit).
    - Affichage d'une alerte (Toast ou Alert) à chaque insertion réussie.
- **Processus de Vérification (SMTP) :**
    1. L'utilisateur remplit le formulaire et clique sur "Valider".
    2. Une page de transition s'affiche demandant le code de confirmation.
    3. Un email contenant un code de vérification est envoyé via SMTP.
    4. Saisie du code pour confirmer l'inscription.

### Connexion
- Login via Email et Mot de passe.
- Redirection vers la page d'accueil (Dashboard) après succès.

## 2. Interfaces Utilisateurs

### A. Interface Super Admin
- **Tableau de Bord Central :**
    - Grand tableau listant tous les inscrits.
    - Colonnes : Nom, Email, Nationalité, Toutes les infos.
- **Gestion des Actions :**
    - Boutons Modifier / Supprimer.
    - **Sécurité :** Fenêtre de confirmation avant toute suppression.
    - **Vue détaillée :** Bouton "Voir" ouvrant une fenêtre **Modale** affichant la photo et les informations complètes.
- **Outil de Communication (Sidebar Gauche) :**
    - Bouton "Campagne" ouvrant une zone de texte.
    - Fonctionnalité d'envoi de messages avec support des **pièces jointes**.

### B. Interface Utilisateur (Profil)
- **Affichage Personnel :** Après connexion, affichage de la photo de profil et des informations personnelles.
- **Édition :** Lien permanent vers le profil avec possibilité de modifier les informations.

## 3. Stack Technique Recommandée
- **Backend :** Node.js (Express) ou PHP (Laravel).
- **Base de données :** MySQL ou PostgreSQL.
- **Email :** Nodemailer (Node) ou PHPMailer.
- **Frontend :** Tailwind CSS pour un design moderne et responsive.
