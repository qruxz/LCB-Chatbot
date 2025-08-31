# 🌱 LCB Chatbot RAG Powered Assistant

This project is an **AI-powered chatbot** for **LCB – Navyakosh Organic Fertilizer**.  
It combines **Google Gemini** with a **Retrieval-Augmented Generation (RAG)** system to deliver **precise, fact-based, short answers** to farmers’ queries about the brand, products, and benefits.

---

## ✨ Features
- **Backend (FastAPI + Gemini + RAG)**  
  - Google Gemini integration (`google-generativeai`)  
  - RAG with **ChromaDB vector database**  
  - Loads **Scraped Data using Beautifulsoup** ()  
  - FAQ-first → **short, precise answers**  
  - RESTful API with CORS  
  - Contact logging + lead capture  
  - Predefined sample questions  

- **Frontend (React / Next.js )**  
  - Simple chat UI  
  - **Predefined quick questions** (one-click access)  
  - Real-time responses from backend API  
  - Deployed anywhere (Netlify, Vercel, Render)  

---

## 🏗️ RAG System Architecture

```
User Query → Vectorization Using ChromaDB → Similarity Search → FAQ Match → Gemini Response
      ↓
 Scrapped Website Data → Document Splitting → Vector Storage → ChromaDB → LLM's response
```

**Workflow**:  
1. `Scraped Website Data` → converted into structured docs.  
2. Docs chunked and stored in **ChromaDB** as vectors.  
3. User query embedded → similarity search finds closest docs/FAQs.  
4. Gemini(i.e LLM) uses retrieved info to generate a **concise branded answer**.  

---

## 🚀 Backend Setup

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Environment Variables
Copy template:
```bash
cp env.example .env
```
Edit `.env`:
```bash
GEMINI_API_KEY=AIzaSyBxxxx-your-key
```

### 3. Run the Server
```bash
python app.py
```

Backend runs at 👉 [http://localhost:5001](http://localhost:5001)

---

## 📡 API Endpoints

### **POST /api/chat**
Ask chatbot a question.

**Request:**
```json
{
  "message": "What kind of results can I expect after using Navyakosh Organic Fertilizer?"
}
```

**Response:**
```json
{
  "response": "Ans. Farmers who use Navyakosh Organic Fertilizer report higher yields, healthier crops, and improved soil quality. Studies have shown a 29% increase in grain yield and a 24.8% improvement in seed weight compared to chemical fertilisers.",
  "success": true
}
```

---

### **GET /api/health**
Check API health.
```json
{
  "status": "healthy",
  "api_key": "configured",
  "rag_system": "initialized"
}
```

---

### **POST /api/rebuild-vectorstore**
Rebuilds vector DB after updating brand data.
```json
{
  "message": "Vector database rebuilt successfully",
  "success": true
}
```

---

## 🗂️ Brand Data Configuration

All brand/product info lives in **`Scraped_DATA Folder**:  

```json
{
  "brand": {
    "name": "LCB - Navyakosh Organic Fertilizer",
    "tagline": "Smart Organic Solution for Sustainable Farming",
    "description": "Navyakosh is an advanced organic fertilizer made from cow dung...",
    "benefits": [
      "Improves soil fertility and water-holding capacity",
      "Boosts crop yield and quality"
    ],
    "purchase_links": ["https://amzn.in/d/hBRlaGo"]
  },
  "products": [
    {
      "crop": "Wheat",
      "applications": [
        "4-5 bags (50kg each) per acre during land preparation",
        "2-3 bags 45–60 days after sowing"
      ],
      "mechanism": "Azospirillum, Azotobacter, PSB, and SSB release and fix nutrients for wheat."
    }
  ],
  "faqs": [
    {
      "q": "What kind of results can I expect?",
      "a": "Ans. Farmers who use Navyakosh Organic Fertilizer report higher yields..."
    }
  ],
  "contact": {
    "phone": "+91-9876543210",
    "email": "info@lcbnavyakosh.com",
    "address": "Lucknow, Uttar Pradesh, India"
  }
}
```

➡ Update this file → call `/api/rebuild-vectorstore` → chatbot updated instantly.

---

## 💬 Frontend Integration

Example predefined questions:  

```javascript
const predefinedQuestions = [
  "What is Navyakosh Organic Fertilizer?",
  "What crops can I use it for?",
  "What are the benefits of Navyakosh?",
  "How should I apply it for wheat?",
  "What kind of results can I expect?"
];
```

Frontend flow:  
1. User clicks a **predefined question** or types their own.  
2. Frontend sends it to `/api/chat`.  
3. Display Gemini’s concise response in chat UI.  

---

## 📂 File Structure
```
backend/
├── app.py              # Main Flask app
├── rag_system.py       # RAG engine
├── brand_data.json     # Brand/product knowledge
├── requirements.txt    # Python dependencies
├── env.example         # Env template
├── .env                # API keys
├── chroma_db/          # Vector DB storage
└── README.md           # Documentation
frontend/
├── index.html / App.js # Simple chat UI
└── ...
```

---

## 🔮 Why Gemini + RAG?
- **FAQ-first answers** → short, accurate, branded  
- **No hallucination** → always grounded in `brand_data.json`  
- **Lightweight** → runs locally, no external DB needed  
- **Scalable** → can add more products, brands, FAQs easily  
- **Farmer-friendly** → answers in simple, clear language  

---

✅ With this setup, you now have:  
- A **backend API** (FastAPI + Gemini + RAG).  
- A **frontend UI** with predefined questions.  
- A **Scraped_data knowledge base** in JSON.  
- A chatbot ready to deploy for farmers & dealers.  
