# Real Estate RAG Assistant - POC

A full-stack AI-powered real estate assistant using Retrieval-Augmented Generation (RAG) with FastAPI backend and React TypeScript frontend.

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [How to Run the Project Locally](#how-to-run-the-project-locally)
- [Key Architectural Decisions and Assumptions](#key-architectural-decisions-and-assumptions)
- [How Sample Data Was Generated and Ingested](#how-sample-data-was-generated-and-ingested)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Technical Implementation](#technical-implementation)

## 📁 Project Structure

```
real-estate-ai/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── config.py               # Configuration and settings
│   │   ├── requirements.txt        # Python dependencies
│   │   ├── .env                    # Environment variables (create from .env.example)
│   │   ├── .env.example           # Environment variables template
│   │   ├── data/
│   │   │   └── data_sources.json  # Data sources storage (auto-created)
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   └── database.py        # Database operations
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── data_sources.py    # Data sources API endpoints
│   │   │   ├── ingestion.py       # Ingestion trigger endpoint
│   │   │   └── chat.py            # Chat API endpoint
│   │   └── services/
│   │       ├── __init__.py
│   │       ├── ingestion_service.py  # Async data ingestion logic
│   │       └── chat_service.py       # RAG chat logic
│
└── ui/
    ├── src/
    │   ├── App.tsx            # Main React component
    │   ├── main.tsx           # React entry point
    │   └── index.css          # Global styles
    ├── index.html             # HTML template
    ├── package.json           # Node dependencies
    ├── tsconfig.json          # TypeScript config
    ├── tsconfig.node.json     # TypeScript Node config
    ├── vite.config.ts         # Vite configuration
    ├── tailwind.config.js     # Tailwind CSS config
    └── postcss.config.js      # PostCSS config
```

## ✨ Features

### Backend Features

✅ FastAPI-based REST API  
✅ Asynchronous data ingestion with background tasks  
✅ Support for CSV and Excel files from GitHub raw URLs  
✅ Text chunking with overlap for better context  
✅ OpenAI embeddings generation  
✅ Pinecone vector database integration  
✅ RAG-based chat with semantic search  
✅ Error handling per data source  
✅ Status tracking (pending, processing, completed, failed)

### Frontend Features

✅ React TypeScript with Vite  
✅ Tailwind CSS styling  
✅ Data sources management UI  
✅ Real-time status updates  
✅ Chat interface with message history  
✅ Manual re-ingestion trigger  
✅ Responsive design

## 🔧 Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/)
- **Pinecone API Key** - Get one from [Pinecone](https://www.pinecone.io/)

## 🚀 How to Run the Project Locally

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend/app
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```
   
   **Activate virtual environment:**
   - On Windows (PowerShell):
     ```bash
     venv\Scripts\Activate.ps1
     ```
   - On Windows (CMD):
     ```bash
     venv\Scripts\activate.bat
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   
   Create a `.env` file in the `backend/app` directory:
   ```bash
   # .env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   PINECONE_API_KEY=your-pinecone-api-key-here
   PINECONE_ENVIRONMENT=us-east-1
   PINECONE_INDEX_NAME=real-estate-properties
   ```

5. **Create required directories (if not already present):**
   ```bash
   mkdir -p data
   mkdir -p db routers services
   ```

6. **Run the backend:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   
   You can also access the interactive API documentation at:
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The UI will be available at `http://localhost:5173` (or the port shown in the terminal)

### Verify Installation

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Should return: `{"status": "healthy"}`

2. **Frontend:** Open `http://localhost:5173` in your browser

## 🏗️ Key Architectural Decisions and Assumptions

### 1. **Asynchronous Processing Architecture**
   - **Decision:** Used FastAPI's background tasks with `asyncio.gather()` for concurrent data source processing
   - **Rationale:** Ensures the API remains responsive during ingestion. Multiple data sources can be processed simultaneously without blocking user requests
   - **Assumption:** Data sources are independent and can be processed in parallel without conflicts

### 2. **File-Based Data Storage**
   - **Decision:** Used JSON file (`data/data_sources.json`) instead of a traditional database
   - **Rationale:** Simplicity for POC, no database setup required, easy to inspect and debug
   - **Assumption:** Single-instance deployment. For production, this should be replaced with a proper database (PostgreSQL, MongoDB, etc.)

### 3. **Vector Database Choice: Pinecone**
   - **Decision:** Pinecone for vector storage and similarity search
   - **Rationale:** Managed service, easy setup, good performance for semantic search
   - **Assumption:** Pinecone index dimension is 1536 (OpenAI `text-embedding-3-small` output size)

### 4. **Chunking Strategy**
   - **Decision:** Token-based chunking with 500 tokens per chunk and 50 token overlap
   - **Rationale:** 
     - Overlap ensures context continuity across chunks
     - 500 tokens balances between context richness and embedding cost
     - Token-based (not character-based) ensures consistent chunk sizes across different text densities
   - **Assumption:** Property descriptions are typically short enough that most properties fit in a single chunk

### 5. **Embedding Model Selection**
   - **Decision:** OpenAI `text-embedding-3-small` model
   - **Rationale:** Good balance between cost, speed, and quality for this use case
   - **Assumption:** Embeddings are generated synchronously during ingestion (acceptable for POC scale)

### 6. **Chat Model Selection**
   - **Decision:** GPT-4o-mini for response generation
   - **Rationale:** Cost-effective while maintaining good response quality for structured property queries
   - **Assumption:** User queries are primarily factual (property search) rather than creative

### 7. **Metadata Storage in Pinecone**
   - **Decision:** Store all property fields as metadata alongside embeddings
   - **Rationale:** Enables filtering and direct access to property details without additional lookups
   - **Assumption:** Property data size is manageable (metadata limits in Pinecone are acceptable)

### 8. **Error Isolation**
   - **Decision:** Each data source processed independently with individual error handling
   - **Rationale:** One failed source doesn't block others. Users can see which sources succeeded/failed
   - **Assumption:** Partial ingestion is acceptable (some sources may fail while others succeed)

### 9. **No Data Deduplication**
   - **Decision:** No explicit deduplication logic for properties
   - **Rationale:** POC simplicity. Same property from different sources will be ingested multiple times
   - **Assumption:** For production, implement deduplication based on property ID or unique identifiers

### 10. **GitHub Raw URL as Data Source**
   - **Decision:** Support only GitHub raw URLs for CSV/Excel files
   - **Rationale:** Easy to test, no authentication required, publicly accessible
   - **Assumption:** Data files are publicly accessible. For production, support S3, Google Drive, direct uploads, etc.

### 11. **No Authentication/Authorization**
   - **Decision:** No user authentication or API key protection
   - **Rationale:** POC focus on RAG functionality, not security
   - **Assumption:** For production, implement proper authentication (JWT, OAuth, API keys)

### 12. **CORS Configuration**
   - **Decision:** Allow specific localhost origins for development
   - **Rationale:** Enables frontend-backend communication during development
   - **Assumption:** Production deployment will use same-origin or proper CORS configuration

### 13. **Batch Upsert Strategy**
   - **Decision:** Upsert vectors in batches of 100
   - **Rationale:** Balances API rate limits and performance
   - **Assumption:** Pinecone can handle batch sizes of 100 efficiently

## 📊 How Sample Data Was Generated and Ingested

### Data Generation

The sample data for this POC was generated using **ChatGPT** to create realistic property listings. The data includes:

- **Property IDs** (unique identifiers)
- **Property Names** (descriptive titles)
- **Property Types** (Villa, Apartment, Penthouse, etc.)
- **Locations** (neighborhoods/districts)
- **Cities** (Mumbai, Delhi, Bangalore, etc.)
- **Prices** (in Indian Rupees)
- **Bedrooms** (BHK count)
- **Area** (square feet)
- **Booking Links** (example URLs)
- **Descriptions** (detailed property information)

### Sample Data Format

The CSV/Excel files should follow this structure:

```csv
Property ID,Name,Type,Location,City,Price,Bedrooms,Area,Booking Link,Description
P001,Luxury Villa,Villa,Andheri,Mumbai,15000000,4,2500 sqft,https://book.example.com/p001,Beautiful villa with garden
P002,Modern Apartment,Apartment,Bandra,Mumbai,8000000,3,1800 sqft,https://book.example.com/p002,Sea-facing apartment
```

### Data Ingestion Process

The ingestion pipeline follows these steps:

1. **Add Data Source:**
   - User provides a GitHub raw URL (e.g., `https://raw.githubusercontent.com/username/repo/main/properties.csv`)
   - Backend stores the URL with status `PENDING` in `data/data_sources.json`

2. **Trigger Ingestion:**
   - User clicks "Re-Ingest Data" button
   - Backend endpoint `/api/ingest` triggers asynchronous processing

3. **Fetch and Parse:**
   - For each data source:
     - Fetch file content from GitHub URL using `aiohttp`
     - Parse CSV using Python's `csv` module or Excel using `openpyxl`
     - Convert to list of dictionaries (one per property row)

4. **Text Conversion:**
   - Each property row is converted to structured text:
     ```
     Property ID: P001
     Name: Luxury Villa
     Type: Villa
     Location: Andheri
     City: Mumbai
     Price: 15000000
     ...
     ```

5. **Chunking:**
   - Text is tokenized using `tiktoken` (cl100k_base encoding)
   - Split into chunks of 500 tokens with 50 token overlap
   - Most properties fit in a single chunk, but longer descriptions may span multiple chunks

6. **Embedding Generation:**
   - Each chunk is sent to OpenAI's embedding API (`text-embedding-3-small`)
   - Returns 1536-dimensional vectors
   - Batched for efficiency

7. **Vector Storage:**
   - Vectors are upserted to Pinecone with:
     - **Vector ID:** `{source_id}_{property_index}_{chunk_index}`
     - **Vector:** The 1536-dimensional embedding
     - **Metadata:** 
       - All original property fields (normalized keys)
       - Chunk text
       - Source ID, property index, chunk index
       - Source URL

8. **Status Updates:**
   - Status updated to `PROCESSING` during ingestion
   - Status updated to `COMPLETED` on success
   - Status updated to `FAILED` with error message on failure

### Example Ingestion Flow

```
User adds URL: https://raw.githubusercontent.com/user/repo/properties.csv
  ↓
Status: PENDING
  ↓
User clicks "Re-Ingest Data"
  ↓
Status: PROCESSING
  ↓
Fetch file → Parse CSV → 50 properties found
  ↓
For each property:
  - Convert to text
  - Chunk (usually 1 chunk per property)
  - Generate embedding
  - Prepare metadata
  ↓
Batch upsert to Pinecone (100 vectors per batch)
  ↓
Status: COMPLETED
```

### Data Source Storage

Data sources are stored in `backend/app/data/data_sources.json`:

```json
[
  {
    "id": "uuid-here",
    "url": "https://raw.githubusercontent.com/...",
    "status": "completed",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:35:00",
    "error_message": null
  }
]
```

## 📖 Usage Guide

### 1. Add Data Sources

1. Go to the "Data Sources" tab in the UI
2. Enter a GitHub raw file URL (CSV or Excel)
   - Example: `https://raw.githubusercontent.com/username/repo/main/properties.csv`
3. Click "Add"
4. The data source will appear with "PENDING" status

### 2. Ingest Data

1. Click the "Re-Ingest Data" button
2. All data sources will be processed asynchronously
3. Status will update to:
   - **PROCESSING:** Currently being ingested
   - **COMPLETED:** Successfully ingested
   - **FAILED:** Error occurred (check error message)

### 3. Chat with Properties

1. Go to the "Chat" tab
2. Ask questions like:
   - "What properties are available?"
   - "Show me properties in Mumbai"
   - "I need a 3 BHK apartment"
   - "What's the price range of villas?"
   - "Send me the booking link for property X"

3. The AI will retrieve relevant property data and provide accurate responses based on the ingested data.

## 🔌 API Endpoints

### Data Sources

- `GET /api/data-sources` - List all data sources
- `POST /api/data-sources` - Add new data source
  ```json
  {
    "url": "https://raw.githubusercontent.com/..."
  }
  ```
- `GET /api/data-sources/{id}` - Get specific data source
- `DELETE /api/data-sources/{id}` - Delete data source

### Ingestion

- `POST /api/ingest` - Trigger data ingestion for all pending/processing sources

### Chat

- `POST /api/chat` - Send chat message
  ```json
  {
    "message": "Show me properties in Mumbai"
  }
  ```
  Response:
  ```json
  {
    "response": "Here are the properties in Mumbai..."
  }
  ```

## 🔬 Technical Implementation

### RAG Pipeline

#### Data Ingestion

1. **Fetch files** from GitHub URLs using `aiohttp`
2. **Parse CSV/Excel** using Python's `csv` module and `openpyxl`
3. **Convert rows** to structured text
4. **Chunk text** with overlap (500 tokens, 50 overlap) using `tiktoken`
5. **Generate embeddings** using OpenAI `text-embedding-3-small`
6. **Store in Pinecone** with metadata

#### Query Processing

1. **Convert user query** to embedding using OpenAI
2. **Search Pinecone** for top-k similar chunks (default: 5)
3. **Retrieve relevant context** with metadata

#### Response Generation

1. **Pass context and query** to GPT-4o-mini
2. **Generate grounded response** based on retrieved context
3. **Return to user**

### Key Design Decisions

- **Asynchronous Processing:** Background tasks ensure API remains responsive
- **Batch Processing:** All sources processed concurrently
- **Error Isolation:** One source failure doesn't block others
- **Metadata Storage:** Property fields stored as Pinecone metadata
- **Chunking Strategy:** Overlap ensures context continuity
- **Status Tracking:** Real-time updates for user feedback

## 🛠️ Development Notes

- Backend runs on port `8000` by default
- Frontend runs on port `5173` by default (Vite)
- CORS is configured for `http://localhost:3000` and `http://localhost:5173`
- Pinecone index is auto-created if it doesn't exist
- Data sources file is auto-created on first run

## 📝 License

This is a Proof of Concept (POC) project.

## 🤝 Contributing

This is a POC project. For production use, consider:
- Adding authentication/authorization
- Replacing file-based storage with a database
- Adding data validation and deduplication
- Implementing rate limiting
- Adding comprehensive error handling
- Adding unit and integration tests
- Supporting more data source types (S3, Google Drive, etc.)

