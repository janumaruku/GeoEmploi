# 🚀 CI/CD GéoEmploi

Ce dossier `.github/workflows` contient l'automatisation du projet GéoEmploi. (Attention : Tous les fichiers de ce dossier doivent impérativement rester ici, sinon GitHub ne pourra pas les lire).

## Comment tester le projet ? (Pour les profs/évaluateurs)

Ce workflow GitHub Actions s'occupe de tout builder à notre place dès qu'on push sur `main`. Ça permet à l'équipe pédagogique de tester le projet sans s'embêter à installer les dépendances et lancer les serveurs à la main.

Pour récupérer la version finale de l'application :
1. Allez sur l'onglet **"Actions"** de notre repo GitHub.
2. Cliquez sur le dernier pipeline réussi (le check vert).
3. Tout en bas de la page, dans **"Artifacts"**, téléchargez **`geoemploi-build`**. C'est un ZIP qui contient le front et le back compilés et prêts à tourner.

## Comptes de Démo 

Pour éviter de vous retrouver sur une application vide, la CI peuple automatiquement la base de données avec des comptes de tests :

- **Admin :** `admin@geoemploi.demo`
- **Employeur :** `employer@geoemploi.demo`
- **Candidat :** `jobseeker@geoemploi.demo`

Le mot de passe pour tous les comptes est : `Demo1234!`
