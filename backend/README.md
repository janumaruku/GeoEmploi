# GéoEmploi API

API REST pour la plateforme de recherche d'emploi géolocalisée. FastAPI + PostgreSQL + Alembic.

## Prérequis

- Python 3.11+
- PostgreSQL installé et lancé en local (pas de Docker)

## 1. Installer PostgreSQL en local (si pas déjà fait)

**macOS (Homebrew) :**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Debian/Ubuntu) :**
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows :** installeur officiel sur https://www.postgresql.org/download/windows/

## 2. Créer la base de données

Connecte-toi à Postgres :
```bash
psql -U postgres
```
Puis dans le prompt `psql` :
```sql
CREATE DATABASE geoemploi;
```
`\q` pour sortir.

## 3. Installer le projet

```bash
chmod +x install.sh start.sh
./install.sh
```

Ça crée un environnement virtuel dans `lib/` et installe tout ce qu'il y a dans `requirements.txt`.

## 4. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvre `.env` et mets tes vrais identifiants Postgres :
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/geoemploi
SECRET_KEY=<une_valeur_aleatoire>
```

Si t'as gardé `postgres`/`postgres` comme user/password par défaut à l'install, le `.env.example` fonctionne tel quel.

## 5. Lancer les migrations

Avec le venv activé (`source lib/bin/activate` si t'es pas déjà dedans) :
```bash
alembic revision --autogenerate -m "create initial tables"
alembic upgrade head
```

La première commande génère le fichier de migration dans `migrations/versions/` en comparant les modèles Python (`app/models/`) à l'état de la base. **Relis ce fichier avant de l'appliquer**, l'autogenerate n'est pas toujours parfait (notamment sur les enums PostgreSQL).

La deuxième commande applique la migration : les tables sont créées dans `geoemploi`.

Pour vérifier que ça a marché :
```bash
psql -U postgres -d geoemploi -c "\dt"
```
Tu dois voir : `users`, `job_seeker_profiles`, `employer_profiles`, `admin_profiles`, `offers`, `applications`, `alembic_version`.

## 6. Lancer le serveur

```bash
./start.sh
```

L'API tourne sur `http://localhost:8000`. Documentation interactive auto-générée sur `http://localhost:8000/docs`.

Vérification rapide :
```bash
curl http://localhost:8000/health
# {"status":"ok","version":"0.1.0","database":"ok"}
```
`/health` teste uniquement la connexion DB (requête `SELECT 1`) — jamais un service externe (cartographie, etc.), pour rester rapide et fiable même si un fournisseur tiers est en panne.

## 7. Peupler la base pour le test de charge

Le cabinet exige un test de charge sur une base d'au moins 500 offres réparties sur au moins
50 communes. Script fourni :
```bash
python -m scripts.seed --offers 500 --employers 60
```
Crée des employeurs vérifiés et des offres réalistes (Faker) réparties sur 51 communes
françaises réelles avec coordonnées (`scripts/communes.py`). Pensé pour tourner sur une base
de test qu'on recrée avant chaque campagne, pas sur une base de prod (pas de dédoublonnage,
relancer le script ajoute de nouvelles lignes).

## Structure du projet

```
app/
├── main.py                  # point d'entrée FastAPI
├── core/
│   ├── config.py             # lecture de .env
│   ├── security.py           # hash de mot de passe
│   └── deps.py                # auth (stub) + vérification de rôle
├── db/
│   ├── base.py                 # Base SQLAlchemy
│   └── session.py              # connexion DB
├── models/                   # tables SQLAlchemy (une classe = une table)
│   ├── user.py                 # auth commune (email/password/role)
│   ├── job_seeker_profile.py   # profil candidat
│   ├── employer_profile.py     # profil entreprise
│   ├── admin_profile.py        # profil admin
│   ├── offer.py                 # offre d'emploi
│   └── application.py           # candidature
├── schemas/                  # validation Pydantic entrée/sortie API
├── crud/                     # logique d'accès DB
└── api/v1/                   # routes HTTP
    ├── users.py                # POST/GET/PUT/DELETE /users, PATCH status
    ├── offers.py                # CRUD offres + modération
    ├── applications.py          # candidatures (ressource plate, filtrée)
    └── admin.py                  # métriques nationales uniquement

migrations/                  # Alembic
requirements.txt
install.sh / start.sh
```

## Modèle de données : pourquoi 4 tables liées à `users`

`User` porte uniquement l'authentification (email, mot de passe, rôle). Les données métier
propres à chaque rôle vivent dans une table séparée, en relation 1-à-1 :

- `job_seeker_profile` → prénom, nom, compétences, expériences, disponibilité
- `employer_profile` → raison sociale, SIRET, secteur, statut de vérification
- `admin_profile` → minimal pour l'instant

Un seul système de login pour tout le monde (`POST /users` avec `role` dans le body),
mais les données stockées ne se ressemblent pas — c'est le choix qu'on a fait plutôt que
de dupliquer l'authentification dans 3 tables séparées.

## Autorisation : rôle = attribut, pas route

Il n'existe pas de namespace `/admin/offers`, `/admin/users` séparé. Les mêmes routes
(`/offers/{id}`, `/users/{id}/status`...) servent tout le monde ; c'est la dépendance
`require_role(...)` dans `core/deps.py` qui décide qui a le droit de faire quoi.
Exception : `/admin/metrics`, qui n'est pas un CRUD sur une ressource existante mais un
endpoint d'agrégation propre à l'admin.

## Auth : stub à remplacer

`core/deps.get_current_user` lit un header `X-User-Id` en clair pour identifier
l'utilisateur appelant — ça permet de tester les routes protégées sans construire tout
de suite le vrai système de token. **À remplacer par du JWT avant toute mise en prod.**

Exemple d'appel authentifié en attendant :
```bash
curl -X GET http://localhost:8000/api/v1/users/1 -H "X-User-Id: 1"
```

## Prochaines étapes possibles

- Géolocalisation : le sujet impose l'usage des flux IGN / API Adresse (pas de fournisseur
  tiers type OpenStreetMap) pour tout géocodage — module séparé, pas encore branché ici.
- Vrai système d'auth JWT à la place du stub `X-User-Id`.
- Dashboard employeur (`GET /users/{id}/dashboard`) et tableau de bord métriques admin
  détaillé, au-delà des compteurs bruts actuels dans `/admin/metrics`.
