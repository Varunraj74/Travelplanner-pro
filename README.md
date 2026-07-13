# TravelGPT — TravelPlanner Pro

> An AI-powered travel planning assistant built with **Flask** + **IBM Watsonx.ai**, fully deployable on **Vercel**.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🤖 AI Travel Plans | IBM Watsonx.ai (Granite-13B) generates full itineraries |
| 🔐 Authentication | Register/login with hashed passwords stored in `/tmp` |
| 📄 PDF Export | Download your travel plan as a styled PDF |
| 🚀 Vercel Ready | Serverless deployment via `@vercel/python` |
| 🎨 Responsive UI | Clean, mobile-friendly design |
| 💡 Demo Mode | Works without API keys (sample plan shown) |

---

## 📁 Project Structure

```
travelgpt/
├── api/
│   ├── index.py          # Main Flask app (Vercel entry point)
│   ├── auth.py           # User registration & login
│   ├── watsonx_client.py # IBM Watsonx.ai API integration
│   └── pdf_generator.py  # fpdf2-based PDF generation
├── templates/
│   ├── base.html         # Base layout
│   ├── login.html        # Login page
│   ├── register.html     # Register page
│   ├── index.html        # Trip planner form
│   └── result.html       # Generated travel plan
├── static/
│   ├── css/main.css      # Stylesheet
│   └── js/main.js        # Client-side JS
├── vercel.json           # Vercel deployment config
├── requirements.txt      # Python dependencies
└── .env.example          # Environment variables template
```

---

## 🚀 Deploy to Vercel

### 1. Clone & push to GitHub

```bash
git init && git add . && git commit -m "TravelGPT initial commit"
# Push to GitHub, then import in vercel.com
```

### 2. Import in Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Vercel auto-detects `vercel.json` — no extra config needed

### 3. Set Environment Variables in Vercel Dashboard

| Variable | Value |
|----------|-------|
| `IBM_API_KEY` | Your IBM Cloud API key |
| `IBM_PROJECT_ID` | Your Watsonx project ID |
| `IBM_REGION` | `us-south` (or your region) |
| `SECRET_KEY` | A long random secret string |

---

## 🛠️ Local Development

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy and fill environment variables
cp .env.example .env

# Run locally (from repo root)
cd api && flask run
# or
python -c "from index import app; app.run(debug=True)"
```

Open [http://localhost:5000](http://localhost:5000)

---

## 🔑 IBM Watsonx.ai Setup

1. Create an [IBM Cloud account](https://cloud.ibm.com)
2. Provision **Watson Machine Learning** service
3. Create a **Watsonx.ai project** and copy the Project ID
4. Generate an **IBM Cloud API key**
5. Set `IBM_API_KEY` and `IBM_PROJECT_ID` in your `.env` / Vercel environment

> **Note:** Without credentials, the app runs in **Demo Mode** with a sample travel plan — perfect for testing the UI.

---

## 🎯 Demo Question

> Plan a 4-day family trip from Chennai to Munnar for 4 people with a budget of ₹40,000.
> We prefer train travel, a standard hotel, and enjoy nature, sightseeing, and local food.

Click **"Fill Demo"** on the planner page to auto-fill this scenario.

---

## 📋 Requirements

- Python 3.11+
- See [`requirements.txt`](requirements.txt) for all packages

---

## 📄 License

MIT — free to use, modify, and deploy.
# TravelGPT-AI
