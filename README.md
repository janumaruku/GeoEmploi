# GéoEmploi

Plateforme de recherche d'emploi géolocalisée pour le Ministère du Job et Bonheur.
Backend FastAPI + PostgreSQL, frontend React + Vite, cartographie Leaflet sur fonds IGN.

Ce README explique comment lancer le projet en entier, de zéro, sur une machine qui ne l'a
jamais eu. Deux parties à installer dans l'ordre : le **backend** d'abord (l'API doit
tourner avant le front, qui en dépend), puis le **frontend**.

## 1. Cloner le projet

```bash
git clone <url_du_repo>
cd GeoEmploi
```

## 2. Installer et lancer le backend

Tout est détaillé dans **[`backend/README.md`](backend/README.md)** — installation de
PostgreSQL, création de la base, migrations Alembic, variables d'environnement, lancement
du serveur. Suis-le à la lettre, dans l'ordre, la première fois.

En résumé (mais lis vraiment le README backend, il y a des pièges Ubuntu-spécifiques
documentés dessus — authentification `peer`, conflits de port) :
```bash
cd backend
./install.sh
cp .env.example .env   # puis édite .env avec tes identifiants Postgres
alembic upgrade head
./start.sh
```

Vérifie que ça tourne :
```bash
curl http://localhost:8000/health
# {"status":"ok","version":"0.1.0","database":"ok"}
```

**Laisse ce terminal ouvert** — le backend doit continuer de tourner pendant que tu lances
le frontend dans un second terminal.

## 3. Installer et lancer le frontend

Dans un **nouveau terminal**, à la racine du projet :
```bash
cd geoemploi-front
npm install
cp .env.example .env
npm run dev
```

Le frontend démarre sur `http://localhost:5173` (ou le port que Vite t'indique). Il est
déjà configuré pour rediriger ses appels `/api/...` vers le backend sur `localhost:8000`
(voir `vite.config.js`) — pas besoin de configurer CORS ni de toucher aux URLs.

Ouvre `http://localhost:5173` dans ton navigateur : la carte, la recherche d'offres, la
connexion et l'inscription doivent fonctionner directement contre le backend qui tourne
dans l'autre terminal.

## Résumé de l'architecture

```
GeoEmploi/
├── backend/           # API FastAPI (Python) — voir backend/README.md
│   ├── app/             # code de l'API (models, routes, auth JWT...)
│   ├── migrations/       # migrations Alembic
│   └── scripts/           # seed de données de test
└── geoemploi-front/    # interface React + Vite
    └── src/
        ├── api/           # appels HTTP vers le backend (fetch)
        └── components/     # carte, formulaires, affichage des offres
```

## Données des offres et fond de carte IGN

Les marqueurs ne sont pas des offres fournies par IGN. Ils correspondent aux offres de la
base PostgreSQL, récupérées par le frontend avec `GET /api/v1/offers`. Chaque nouvelle offre
stocke une commune et les coordonnées du centroïde renvoyé par l'API Découpage administratif.
Le script `backend/scripts/seed.py` crée 1 000 offres de démonstration par défaut. Il garantit
au moins une offre dans chacune des 51 communes, puis répartit les offres restantes entre elles.

IGN fournit uniquement le fond cartographique :

1. Leaflet demande une tuile à `/api/v1/map/tiles/{z}/{x}/{y}` ;
2. le backend transmet la demande au service WMTS de la Géoplateforme IGN ;
3. la tuile est mise en cache temporairement dans `MAP_CACHE_DIR` ;
4. les marqueurs d'offres sont ensuite affichés par-dessus le fond IGN.

La configuration par défaut utilise le service WMTS public :

```env
IGN_WMTS_BASE_URL=https://data.geopf.fr/wmts
IGN_WMTS_LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2
IGN_WMTS_TIMEOUT_SECONDS=8
MAP_CACHE_DIR=/tmp/geoemploi-map-cache
```

La couche publique `PLANIGNV2` ne nécessite pas de clé API. Il ne faut donc ajouter aucun
secret au frontend ni committer de clé dans Git. Une clé ne serait nécessaire que pour une
ressource IGN privée ou à accès restreint ; dans ce cas, elle devrait être ajoutée uniquement
dans `backend/.env`, jamais dans `geoemploi-front/.env`, puis prise en charge par le proxy.

Le formulaire employeur recherche uniquement des communes. Il ne collecte plus de rue ni de
numéro. L'API publique `geo.api.gouv.fr/communes` fournit le nom de la commune et son
centroïde ; IGN ne crée et ne fournit aucune offre d'emploi.

## Prochaine session : relancer le projet

Une fois que tout ça a été installé une première fois, tu n'as **pas besoin de tout
refaire** à chaque fois. Voir la section *"Tu as déjà tout installé ? Relancer le projet
un autre jour"* en haut de [`backend/README.md`](backend/README.md) — en résumé : vérifie
que Postgres tourne, lance `./start.sh` côté backend et `npm run dev` côté frontend, c'est
tout.
