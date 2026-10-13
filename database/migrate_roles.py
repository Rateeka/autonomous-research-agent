from pymongo import MongoClient

def migrate():
    client = MongoClient("mongodb://localhost:27017")
    db = client["research_agent"]
    users = db["users"]
    
    # Update users missing the 'role' field
    result = users.update_many(
        {"role": {"$exists": False}},
        {"$set": {"role": "user"}}
    )
    print(f"Migration completed. Modified {result.modified_count} users.")

if __name__ == "__main__":
    migrate()
