from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="SALAMA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "SALAMA API", "status": "ok", "version": "0.2.0"}

@app.get("/health")
def health():
    return {"status": "healthy"}

class AnalyzeRequest(BaseModel):
    contract_address: str

@app.post("/analyze")
def analyze_contract(request: AnalyzeRequest):
    """Mock endpoint - will be real on HF Spaces"""
    
    # Mock Swahili response
    return {
        "contract_address": request.contract_address,
        "explanation": "Hii ni contract ya kubadilisha tokens. Inafanya kazi kama soko la biashara.",
        "risk_score": 3,
        "warnings": [],
        "is_mock": True
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)