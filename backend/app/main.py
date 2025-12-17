from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import data_sources, chat, ingestion
from db.database import init_db

app = FastAPI(title="Real Estate RAG Assistant API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routers
app.include_router(data_sources.router, prefix="/api", tags=["Data Sources"])
app.include_router(ingestion.router, prefix="/api", tags=["Ingestion"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])

@app.get("/")
async def root():
    return {
        "message": "Real Estate RAG Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "data_sources": "/api/data-sources",
            "ingest": "/api/ingest",
            "chat": "/api/chat"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}