# 🚀 Intégration et Déploiement Continus (CI/CD)

Ce dossier `.github/workflows` contient l'automatisation du projet GéoEmploi. **(Attention : Tous les fichiers de ce dossier doivent impérativement rester ici, sinon GitHub ne pourra pas les lire).**

## À quoi ça sert ?
L'objectif de cette automatisation (le fichier `build.yml`) est de permettre à n'importe quel évaluateur de tester l'application finale **sans avoir besoin de connaissances techniques**.

Dès que quelqu'un publie (push) du code sur GitHub, un ordinateur virtuel se lance chez GitHub et effectue les tâches suivantes automatiquement :
1. Il installe la base de données PostgreSQL.
2. Il installe tout le code Backend (Python) et Frontend (React).
3. Il **remplit automatiquement la base de données avec de vraies offres** et crée des comptes de démonstration (pour que l'application ne soit pas vide).
4. Il compile tout le projet en un seul fichier de production.
5. Il génère un fichier `.zip` (le "Build") que l'on peut télécharger en un clic.

## Comment télécharger et tester le projet ? (Pour les évaluateurs)
Même si vous ne savez pas coder, vous pouvez récupérer la version finale du projet générée par ce système :

1. Allez sur la page GitHub du projet.
2. Cliquez sur l'onglet **"Actions"** en haut.
3. Cliquez sur la dernière ligne verte ("GéoEmploi CI/CD Build").
4. Descendez tout en bas de la page jusqu'à la section **"Artifacts"**.
5. Cliquez sur **`geoemploi-build`** pour télécharger le fichier ZIP contenant le projet prêt à l'emploi.

## Comptes de Démonstration disponibles :
Pour faciliter vos tests dans l'application, les comptes suivants sont générés automatiquement par notre système lors du déploiement :
- **Email :** `admin@geoemploi.demo` (Administrateur)
- **Email :** `employer@geoemploi.demo` (Employeur)
- **Email :** `jobseeker@geoemploi.demo` (Candidat)

**Mot de passe commun :** `Demo1234!`
