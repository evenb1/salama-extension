from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
import os
from dotenv import load_dotenv
from contract_fetcher import get_contract_source

# Load environment variables
load_dotenv()

app = FastAPI(title="SALAMA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.get("/")
def root():
    return {
        "message": "SALAMA API",
        "status": "ok",
        "version": "0.5.0",
        "llm": "OpenAI GPT-4"
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "llm_status": "ready"
    }

class AnalyzeRequest(BaseModel):
    contract_address: str

@app.post("/analyze")
def analyze_contract(request: AnalyzeRequest):
    """Analyze smart contract and return Swahili explanation"""
    
    # Fetch actual contract from blockchain
    contract_data = get_contract_source(request.contract_address)
    
    if not contract_data.get("success"):
        raise HTTPException(
            status_code=400, 
            detail=f"Could not fetch contract: {contract_data.get('error')}"
        )
    
    # Build prompt with real contract code
    prompt = f"""Wewe ni msaidizi wa usalama wa blockchain. Eleza contract hii kwa Kiswahili sanifu na rahisi.

Contract Name: {contract_data['contract_name']}
Address: {request.contract_address}

Code (first 1000 characters):
{contract_data['source_code'][:1000]}

Tafadhali:
1. Eleza kwa ufupi contract hii inafanya nini
2. Je, ina hatari yoyote kwa mtumiaji?
3. Toa ushauri wa usalama

Jibu kwa Kiswahili tu, kwa lugha ya kawaida ambayo Mkenya anaweza kuelewa."""
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Wewe ni msaidizi wa usalama wa blockchain. Eleza mambo kwa Kiswahili rahisi."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        explanation = response.choices[0].message.content
        
        return {
            "contract_address": request.contract_address,
            "contract_name": contract_data['contract_name'],
            "explanation": explanation,
            "risk_score": 0,
            "warnings": [],
            "llm_used": "OpenAI GPT-4"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)