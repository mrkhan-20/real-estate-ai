from fastapi import APIRouter, BackgroundTasks
from services.ingestion_service import ingest_all_sources

router = APIRouter()

@router.post("/ingest")
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """Trigger data ingestion for all sources"""
    # Run ingestion as a background task
    background_tasks.add_task(ingest_all_sources)
    return {"message": "Data ingestion started"}