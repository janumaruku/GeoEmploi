# Comptes de démonstration — GéoEmploi

Ces comptes sont créés automatiquement par le script de seed (`python -m scripts.seed`).

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | `admin@geoemploi.demo` | `Demo1234!` |
| Employeur | `employer@geoemploi.demo` | `Demo1234!` |
| Chercheur d'emploi | `jobseeker@geoemploi.demo` | `Demo1234!` |

## Lancer localement

```bash
cd backend
alembic upgrade head
python -m scripts.seed
```
