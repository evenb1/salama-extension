import requests
import os

ETHERSCAN_API_KEY = os.getenv("ETHERSCAN_API_KEY", "YourApiKeyToken")

def get_contract_source(address: str, chain: str = "ethereum") -> dict:
    """Fetch verified contract source code from blockchain explorer"""
    
    base_urls = {
        "ethereum": "https://api.etherscan.io/api",
        "polygon": "https://api.polygonscan.com/api",
        "base": "https://api.basescan.org/api"
    }
    
    url = base_urls.get(chain, base_urls["ethereum"])
    
    params = {
        "module": "contract",
        "action": "getsourcecode",
        "address": address,
        "apikey": ETHERSCAN_API_KEY
    }
    
    try:
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        
        if data.get("status") == "1" and data.get("result"):
            result = data["result"][0]
            return {
                "success": True,
                "source_code": result.get("SourceCode", ""),
                "contract_name": result.get("ContractName", "Unknown"),
                "compiler_version": result.get("CompilerVersion", ""),
                "is_verified": True
            }
        
        return {
            "success": False,
            "error": "Contract not verified or not found",
            "is_verified": False
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "is_verified": False
        }