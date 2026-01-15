# Plateforme Bancaire Sécurisée Al Baraka Digital (Front-End)

## 📝 Description
Ce projet est le frontend de l'application bancaire **Al Baraka Digital**. Il offre une interface moderne, sécurisée et modulaire développée avec **Angular**, permettant l'interaction avec des APIs REST sécurisées (JWT / OAuth2).

## 📅 Contexte du Projet
Ce développement s'inscrit dans le sprint **V3 Frontend Angular** (5 Janvier 2026 - 16 Janvier 2026).  
L'objectif est de fournir une interface utilisateur permettant la gestion complète des opérations bancaires interfacée avec un backend Spring Boot.

## 🚀 Fonctionnalités Principales

### 🔐 Sécurité & Authentification
*   **Authentification sécurisée** : Connexion via JWT.
*   **Protection des routes** : Utilisation de Guards (`AuthGuard`, `RoleGuard`) pour sécuriser l'accès selon les rôles.
*   **Intercepteurs HTTP** : Gestion automatique des tokens et des erreurs (401/403).

### 👤 Espace Client
*   Tableau de bord : Consultation du solde et historique.
*   Opérations : Dépôt, Retrait, Virement.
*   Upload de justificatifs : Requis pour les montants > 10 000 DH.
*   Suivi du statut des opérations (en attente, validée, rejetée).

### 🕵️ Espace Agent Bancaire
*   Validation des opérations : Visualisation des transactions avec statut `PENDING`.
*   Contrôle : Vérification des justificatifs uploadés.
*   Action : Approbation ou rejet des demandes.

### 🛠️ Espace Administrateur
*   Gestion des utilisateurs : Activation/Désactivation des comptes.
*   Gestion des rôles : Attribution des droits d'accès.

## 🏗️ Architecture Technique
L'application suit une structure modulaire rigoureuse :

*   **CoreModule** : Services singletons (`AuthService`, `TokenService`), Guards, Interceptors, Modèles (`User`, `Operation`).
*   **AuthModule** : Composants de Login et Register.
*   **Features Modules (Lazy Loading)** :
    *   `ClientModule`
    *   `AgentModule`
    *   `AdminModule`
*   **Techniques Angular** : Reactive Forms, Observables (RxJS), Lazy Loading.

## ⚙️ Installation

1.  **Cloner le dépôt**
    ```bash
    git clone https://github.com/MohammedElmostaine/Al-Baraka-Digital-Front.git
    cd Al-Baraka-Digital-Front
    ```

2.  **Installer les dépendances**
    ```bash
    npm install
    ```

3.  **Lancer le serveur de développement**
    ```bash
    ng serve
    ```
    Accédez à l'application via `http://localhost:4200/`.

## 👨‍💻 Auteur
Projet réalisé dans le cadre du cursus "Concepteur Développeur d'Applications".
