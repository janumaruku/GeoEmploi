# Tous les modèles sont importés ici pour que SQLAlchemy puisse résoudre
# les relations déclarées par nom de classe (ex: relationship("AdminProfile")),
# quel que soit l'ordre dans lequel les autres modules du projet les utilisent.
from app.models.user import User, UserRole, UserStatus
from app.models.job_seeker_profile import JobSeekerProfile
from app.models.employer_profile import EmployerProfile, VerificationStatus
from app.models.admin_profile import AdminProfile
from app.models.offer import Offer, OfferStatus
from app.models.application import Application, ApplicationStatus
