import uuid
from app.db.firestore import db
from app.core.security import get_hash, verify_pwd

class AuthService:
    def __init__(self):
        self.col = db.collection("users")

    def get(self, e):
        s = self.col.where("email", "==", e).stream()
        return next(s, None)

    def reg(self, e, p):
        if self.get(e): return None
        uid = str(uuid.uuid4())
        h = get_hash(p)
        d = {"uid": uid, "email": e, "hashed_password": h}
        self.col.document(uid).set(d)
        return d

    def login(self, e, p):
        u = self.get(e)
        if not u: return None
        d = u.to_dict()
        if verify_pwd(p, d["hashed_password"]):
            return d
        return None