from passlib.context import CryptContext
import warnings

# Suppress bcrypt version warning
with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        return pwd_context.verify(plain_password, hashed_password)
