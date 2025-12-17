from typing import List, Dict
from openai import OpenAI
from pinecone import Pinecone
from config import settings

client = OpenAI(api_key=settings.openai_api_key)
pc = Pinecone(api_key=settings.pinecone_api_key)

def generate_query_embedding(query: str) -> List[float]:
    """Generate embedding for user query"""
    response = client.embeddings.create(
        model=settings.embedding_model,
        input=query
    )
    return response.data[0].embedding

def retrieve_relevant_context(query: str, top_k: int = 5) -> List[Dict]:
    """Retrieve relevant property information from Pinecone"""
    try:
        index = pc.Index(settings.pinecone_index_name)
        
        # Generate query embedding
        query_embedding = generate_query_embedding(query)
        
        # Search in Pinecone
        results = index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True
        )
        
        # Extract and return relevant matches
        contexts = []
        for match in results.matches:
            contexts.append({
                "text": match.metadata.get("text", ""),
                "score": match.score,
                "metadata": match.metadata
            })
        
        return contexts
    
    except Exception as e:
        print(f"Error retrieving context: {str(e)}")
        return []

def generate_response(query: str, contexts: List[Dict]) -> str:
    """Generate AI response using retrieved context"""
    
    if not contexts:
        return "I don't have any property information available at the moment. Please make sure data sources are configured and ingested."
    
    # Build context string
    context_text = "\n\n".join([
        f"Property Information {i+1} (Relevance: {ctx['score']:.2f}):\n{ctx['text']}"
        for i, ctx in enumerate(contexts)
    ])
    
    # Create system prompt
    system_prompt = """You are a helpful real estate assistant. Your job is to help users find properties based on their requirements.

Use the property information provided to answer questions accurately. Always base your responses on the retrieved data, not on assumptions.

When providing information:
- Be specific about property details (location, price, type, etc.)
- If a user asks for booking links or contact information, provide them if available in the data
- If multiple properties match, present them clearly
- If no properties match the criteria, say so clearly
- Be conversational and helpful

Important: Only use information from the provided context. If information is not available, say so."""

    # Create user prompt with context
    user_prompt = f"""Based on the following property information, please answer the user's question.

Property Information:
{context_text}

User Question: {query}

Please provide a helpful and accurate response based only on the property information above."""

    # Generate response using GPT
    try:
        response = client.chat.completions.create(
            model=settings.chat_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        
        return response.choices[0].message.content
    
    except Exception as e:
        return f"I encountered an error generating a response. Please try again. Error: {str(e)}"

async def process_chat_message(message: str) -> str:
    """Process chat message and return AI response"""
    # Retrieve relevant context
    contexts = retrieve_relevant_context(message, top_k=settings.top_k_results)
    
    # Generate response
    response = generate_response(message, contexts)
    
    return response