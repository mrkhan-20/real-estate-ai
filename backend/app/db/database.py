import json
import os
from typing import List, Optional
from datetime import datetime
import uuid

DATA_FILE = "data/data_sources.json"

def init_db():
    """Initialize the database file if it doesn't exist"""
    os.makedirs("data", exist_ok=True)
    if not os.path.exists(DATA_FILE):
        with open(DATA_FILE, "w") as f:
            json.dump([], f)

def get_all_sources() -> List[dict]:
    """Get all data sources"""
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def get_source_by_id(source_id: str) -> Optional[dict]:
    """Get a specific data source by ID"""
    sources = get_all_sources()
    for source in sources:
        if source["id"] == source_id:
            return source
    return None

def create_source(url: str) -> dict:
    """Create a new data source"""
    sources = get_all_sources()
    
    new_source = {
        "id": str(uuid.uuid4()),
        "url": url,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
        "updated_at": datetime.now().isoformat(),
        "error_message": None
    }
    
    sources.append(new_source)
    
    with open(DATA_FILE, "w") as f:
        json.dump(sources, f, indent=2)
    
    return new_source

def update_source_status(source_id: str, status: str, error_message: Optional[str] = None):
    """Update the status of a data source"""
    sources = get_all_sources()
    
    for source in sources:
        if source["id"] == source_id:
            source["status"] = status
            source["updated_at"] = datetime.now().isoformat()
            if error_message:
                source["error_message"] = error_message
            break
    
    with open(DATA_FILE, "w") as f:
        json.dump(sources, f, indent=2)

def delete_source(source_id: str) -> bool:
    """Delete a data source"""
    sources = get_all_sources()
    initial_length = len(sources)
    
    sources = [s for s in sources if s["id"] != source_id]
    
    with open(DATA_FILE, "w") as f:
        json.dump(sources, f, indent=2)
    
    return len(sources) < initial_length