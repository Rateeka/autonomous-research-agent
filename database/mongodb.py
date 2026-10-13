import os
from pymongo import MongoClient
from bson.objectid import ObjectId
from werkzeug.security import generate_password_hash, check_password_hash


class MongoDB:

    def __init__(self):
        mongo_uri = os.getenv(
            "MONGO_URI",
            "mongodb://localhost:27017"
        )

        self.client = MongoClient(mongo_uri)
        self.db = self.client["research_agent"]

        self.users = self.db["users"]
        self.history = self.db["research_history"]

        self.users.create_index("username", unique=True)

    def create_user(self, username, password):
        username = username.strip().lower()

        if self.find_user(username):
            return None

        user = {
            "username": username,
            "password": generate_password_hash(password),
            "role": "user"
        }

        return self.users.insert_one(user)

    def find_user(self, username):
        return self.users.find_one({
            "username": username.strip().lower()
        })

    def verify_user(self, username, password):
        user = self.find_user(username)

        if not user:
            return None

        stored_password = user["password"]

        if stored_password.startswith(("pbkdf2:", "scrypt:")):
            if check_password_hash(stored_password, password):
                return user
            return None

        if stored_password == password:
            new_hash = generate_password_hash(password)

            self.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"password": new_hash}}
            )

            user["password"] = new_hash
            return user

        return None

    def get_user(self, user_id):
        return self.users.find_one({
            "_id": ObjectId(user_id)
        })

    def save_research(
        self,
        query,
        papers,
        summaries,
        verification,
        citations,
        reports
    ):
        data = {
            "query": query,
            "papers": papers,
            "summaries": summaries,
            "verification": verification,
            "citations": citations,
            "reports": reports
        }

        return self.history.insert_one(data)

    def get_history(self):
        history = []

        for item in self.history.find():
            item["_id"] = str(item["_id"])
            history.append(item)

        return history

    def get_research(self, research_id):
        item = self.history.find_one({
            "_id": ObjectId(research_id)
        })

        if item:
            item["_id"] = str(item["_id"])

        return item
