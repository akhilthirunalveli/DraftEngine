import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

if not firebase_admin._apps:
    c = credentials.Certificate(settings.FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(c)

db = firestore.client()