from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List
from db import database

router = APIRouter()

class DataSourceCreate(BaseModel):
    url: str

class DataSourceResponse(BaseModel):
    id: str
    url: str
    status: str
    created_at: str
    updated_at: str
    error_message: str | None = None

@router.get("/data-sources", response_model=List[DataSourceResponse])
async def get_data_sources():
    """Get all configured data sources"""
    sources = database.get_all_sources()
    return sources

@router.post("/data-sources", response_model=DataSourceResponse)
async def create_data_source(source: DataSourceCreate):
    """Add a new data source URL"""
    # Validate GitHub raw URL
    if "raw.githubusercontent.com" not in source.url:
        raise HTTPException(
            status_code=400,
            detail="Only GitHub raw file URLs are allowed"
        )
    
    # Check if URL already exists
    existing_sources = database.get_all_sources()
    for existing in existing_sources:
        if existing["url"] == source.url:
            raise HTTPException(
                status_code=400,
                detail="This data source URL already exists"
            )
    
    new_source = database.create_source(source.url)
    return new_source

@router.delete("/data-sources/{source_id}")
async def delete_data_source(source_id: str):
    """Delete a data source"""
    deleted = database.delete_source(source_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Data source not found")
    return {"message": "Data source deleted successfully"}

@router.get("/data-sources/{source_id}", response_model=DataSourceResponse)
async def get_data_source(source_id: str):
    """Get a specific data source by ID"""
    source = database.get_source_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Data source not found")
    return source