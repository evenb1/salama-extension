# 🛡️ SALAMA Extension

**Smart Contract Safety for Swahili Speakers**

SALAMA (meaning "Safety" in Swahili) is a Chrome extension that explains blockchain smart contracts in Swahili, helping African Web3 users avoid scams and understand what they're signing.

## 🎯 Problem

Millions of Swahili speakers want to use DeFi but face two barriers:
1. **Language:** Everything is in English
2. **Safety:** No easy way to detect scams before signing

## ✨ Solution

SALAMA automatically:
- Detects when you interact with smart contracts (MetaMask, Rainbow, etc.)
- Analyzes the contract for red flags
- Explains what it does **in Swahili**
- Warns you about potential scams

## 🏗️ Architecture
```
Chrome Extension → FastAPI Backend (HF Spaces) → UlizaLlama (Swahili LLM)
                ↓
         Supabase (Community Reports)
```

## 🚀 Built For

[ETH Safari Hackathon 2025](https://dorahacks.io/hackathon/eth-safari-2025) - AI & Swahili LLM Challenge

## 📦 Tech Stack

- **Frontend:** Chrome Extension (Vanilla JS)
- **Backend:** FastAPI + UlizaLlama (HuggingFace Spaces)
- **Database:** Supabase
- **Blockchain:** Etherscan API

## 🛠️ Development
```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Extension
cd extension
# Load unpacked extension in Chrome
```

## 📄 License

MIT License - see [LICENSE](LICENSE)

---

**Karibu! Welcome to safer Web3 for Africa 🌍**
