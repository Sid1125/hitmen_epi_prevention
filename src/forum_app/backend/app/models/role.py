from enum import Enum

class UserRole(str, Enum):
    ALPHA = "alpha"  # Admin role - can delete any post
    DELTA = "delta"  # Normal user role - can only manage own posts
