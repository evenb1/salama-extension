from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import pipeline
import torch

app = FastAPI(title="SALAMA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load UlizaLlama (HuggingFace will download it)
print("🔄 Loading UlizaLlama model...")
try:
    llm = pipeline(
        "text-generation",
        model="Jacaranda/UlizaLlama",
        torch_dtype=torch.float16,
        device_map="auto"
    )
    print("✅ UlizaLlama loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")
    llm = None

@app.get("/")
def root():
    return {
        "message": "SALAMA API",
        "status": "ok",
        "version": "0.3.0",
        "model_loaded": llm is not None
    }

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_status": "loaded" if llm else "not loaded"
    }

class AnalyzeRequest(BaseModel):
    contract_address: str

@app.post("/analyze")
def analyze_contract(request: AnalyzeRequest):
    """Analyze smart contract and return Swahili explanation"""
    
    if not llm:
        raise HTTPException(status_code=503, detail="Model not loaded yet")
    
    # Simple prompt for now (we'll improve this later with contract fetching)
    prompt = f"""Eleza contract hii kwa Kiswahili rahisi.

Contract address: {request.contract_address}

Je, contract hii inafanya nini? Eleza kwa lugha ya kawaida."""
    
    try:
        result = llm(
            prompt,
            max_new_tokens=200,
            do_sample=True,
            temperature=0.7
        )
        
        explanation = result[0]['generated_text']
        
        return {
            "contract_address": request.contract_address,
            "explanation": explanation,
            "risk_score": 0,
            "warnings": [],
            "is_mock": False
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)