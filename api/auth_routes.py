from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from bson.objectid import ObjectId

from database.mongodb import MongoDB
from utils.auth import admin_required

auth = Blueprint("auth", __name__)

db = MongoDB()


@auth.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid JSON"
            }), 400

        username = data.get("username", "").strip().lower()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password are required."
            }), 400

        # Check if user already exists
        if db.find_user(username):
            return jsonify({
                "success": False,
                "message": "User already exists."
            }), 409

        # Password hashing should happen inside create_user()
        db.create_user(username, password)

        return jsonify({
            "success": True,
            "message": "Registration successful."
        }), 201

    except Exception as e:
        print("Register Error:", e)

        return jsonify({
            "success": False,
            "message": "Registration failed."
        }), 500


@auth.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid JSON"
            }), 400

        username = data.get("username", "").strip().lower()
        password = data.get("password", "")

        if not username or not password:
            return jsonify({
                "success": False,
                "message": "Username and password are required."
            }), 400

        # verify_user() should:
        # 1. Find user by username
        # 2. Verify password using check_password_hash()
        user = db.verify_user(username, password)

        if not user:
            return jsonify({
                "success": False,
                "message": "Invalid username or password."
            }), 401

        if user.get("status") == "suspended":
            return jsonify({
                "success": False,
                "message": "Your account has been suspended. Please contact system support."
            }), 403

        access_token = create_access_token(
            identity=str(user["_id"]),
            additional_claims={
                "username": username,
                "role": user.get("role", "user")
            }
        )

        return jsonify({
            "success": True,
            "message": "Login successful.",
            "token": access_token,
            "username": username,
            "role": user.get("role", "user")
        }), 200

    except Exception as e:
        print("Login Error:", e)

        return jsonify({
            "success": False,
            "message": "Login failed."
        }), 500


@auth.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Invalid JSON"
            }), 400

        current_password = data.get("current_password")
        new_password = data.get("new_password")

        if not current_password or not new_password:
            return jsonify({
                "success": False,
                "message": "Current and new passwords are required."
            }), 400

        user = db.get_user(user_id)
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        # Verify old password
        if not db.verify_user(user["username"], current_password):
            return jsonify({
                "success": False,
                "message": "Incorrect current password."
            }), 401

        # Hash and update new password
        from werkzeug.security import generate_password_hash
        new_hash = generate_password_hash(new_password)
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password": new_hash}}
        )

        return jsonify({
            "success": True,
            "message": "Password updated successfully."
        }), 200

    except Exception as e:
        print("Change Password Error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to update password."
        }), 500


@auth.route("/admin/users", methods=["GET"])
@admin_required()
def admin_users():
    try:
        users_cursor = db.users.find({}, {"password": 0})
        users_list = []
        for user in users_cursor:
            # Extract creation timestamp from ObjectId
            user_id = str(user["_id"])
            try:
                created_at = user["_id"].generation_time.strftime("%Y-%m-%d %H:%M:%S")
            except Exception:
                created_at = "Unknown"
            
            user["_id"] = user_id
            user["created_at"] = created_at
            user["status"] = user.get("status", "active")
            users_list.append(user)
        return jsonify({
            "success": True,
            "users": users_list
        }), 200
    except Exception as e:
        print("Admin users fetch error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to fetch users."
        }), 500


@auth.route("/admin/users/<user_id>/role", methods=["PUT"])
@admin_required()
def change_user_role(user_id):
    try:
        data = request.get_json()
        new_role = data.get("role")
        if new_role not in ["admin", "user"]:
            return jsonify({
                "success": False,
                "message": "Invalid role specified."
            }), 400

        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": new_role}}
        )
        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        return jsonify({
            "success": True,
            "message": "User role updated successfully."
        }), 200
    except Exception as e:
        print("Change role error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to update user role."
        }), 500


@auth.route("/admin/users/<user_id>", methods=["DELETE"])
@admin_required()
def delete_user(user_id):
    try:
        result = db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404
        return jsonify({
            "success": True,
            "message": "User account deleted successfully."
        }), 200
    except Exception as e:
        print("Delete user error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to delete user."
        }), 500


@auth.route("/admin/users/<user_id>/suspend", methods=["PUT"])
@admin_required()
def toggle_user_suspend(user_id):
    try:
        data = request.get_json()
        status = data.get("status")
        if status not in ["active", "suspended"]:
            return jsonify({
                "success": False,
                "message": "Invalid status specified."
            }), 400

        result = db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"status": status}}
        )
        if result.matched_count == 0:
            return jsonify({
                "success": False,
                "message": "User not found."
            }), 404

        return jsonify({
            "success": True,
            "message": f"User status updated to {status} successfully."
        }), 200
    except Exception as e:
        print("Toggle suspend error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to update user status."
        }), 500


@auth.route("/admin/logs", methods=["GET"])
@admin_required()
def admin_logs():
    try:
        import datetime
        now = datetime.datetime.utcnow()
        mock_logs = [
            {"timestamp": (now - datetime.timedelta(minutes=2)).strftime("%Y-%m-%d %H:%M:%S"), "level": "INFO", "source": "API", "message": "Admin user accessed system control panel"},
            {"timestamp": (now - datetime.timedelta(minutes=15)).strftime("%Y-%m-%d %H:%M:%S"), "level": "WARN", "source": "OLLAMA", "message": "Inference token generation delay: 1.45s"},
            {"timestamp": (now - datetime.timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S"), "level": "SUCCESS", "source": "FAISS", "message": "Successfully synchronized local vectors"},
            {"timestamp": (now - datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S"), "level": "INFO", "source": "DB", "message": "Cleaned up expired research sessions"},
            {"timestamp": (now - datetime.timedelta(hours=4)).strftime("%Y-%m-%d %H:%M:%S"), "level": "ERROR", "source": "API", "message": "Flask JWT extension validation exception (re-directed)"},
        ]
        return jsonify({
            "success": True,
            "logs": mock_logs
        }), 200
    except Exception as e:
        print("Admin logs fetch error:", e)
        return jsonify({
            "success": False,
            "message": "Failed to fetch logs."
        }), 500