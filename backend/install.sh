#!/bin/bash
set -e

python3 -m venv lib
source lib/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

echo "Dépendances installées."
echo "N'oublie pas de copier .env.example en .env et d'y mettre tes vrais identifiants Postgres."
