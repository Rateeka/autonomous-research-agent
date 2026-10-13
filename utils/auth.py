from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash


def hash_password(password):

    return generate_password_hash(password)


def verify_password(password, hashed):

    return check_password_hash(hashed, password)


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            if claims.get("role") == "admin":
                return fn(*args, **kwargs)
            else:
                return jsonify({
                    "success": False,
                    "message": "Admin access required."
                }), 403
        return decorator
    return wrapper