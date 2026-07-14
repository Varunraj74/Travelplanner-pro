# TravelGPT — TravelPlanner Pro

> AI-powered travel planning · Flask + IBM Watsonx.ai · Deploy on **Render** or **Vercel**

---

## 🚀 Deploy on Render (Recommended)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "TravelGPT"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USER/travelgpt.git
git push -u origin main
```

### Step 2 — Create Web Service on Render
1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` — settings are pre-filled:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn wsgi:app --workers 2 --timeout 120 --bind 0.0.0.0:$PORT`
   - **Python version:** 3.11.9

### Step 3 — Set Environment Variables
In the Render dashboard → **Environment**:

| Key | Value |
|-----|-------|
| `IBM_API_KEY` | Your IBM Cloud API key |
| `IBM_PROJECT_ID` | Your Watsonx.ai project ID |
| `IBM_REGION` | `us-south` *(or your region)* |
| `SECRET_KEY` | Any long random string |

> `RENDER=true` is set automatically by `render.yaml` — enables ProxyFix.

### Step 4 — Deploy
Click **Deploy** and wait ~2 minutes. Your app will be live at `https://travelgpt.onrender.com`.

---

## 🌐 Deploy on Vercel

1. Push to GitHub
2. Import at [vercel.com](https://vercel.com/new)
3. Add the same 4 env vars in Vercel Dashboard → Settings → Environment Variables
4. Deploy — `vercel.json` handles all routing automatically

---

## 🛠️ Local Development

```bash
# 1. Create virtual environment
python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set credentials
cp .env.example .env
# Edit .env with your IBM_API_KEY and IBM_PROJECT_ID

# 4. Run
python run.py
# Open http://localhost:5000
```

---

## 📁 Project Structure

```
travelgpt/
├── wsgi.py               ← Gunicorn / Render entry point
├── run.py                ← Local dev runner
├── render.yaml           ← Render deployment config
├── vercel.json           ← Vercel deployment config
├── requirements.txt      ← Python dependencies
├── .env.example          ← Environment variables template
├── api/
│   ├── __init__.py       ← Makes api/ a Python package
│   ├── index.py          ← Flask app + all routes
│   ├── auth.py           ← Register / login
│   ├── watsonx_client.py ← IBM Watsonx.ai REST API
│   └── pdf_generator.py  ← PDF export (fpdf2)
├── templates/            ← Jinja2 HTML templates
│   ├── base.html
│   ├── login.html
│   ├── register.html
│   ├── index.html        ← Trip planner form
│   ├── result.html       ← Generated plan view
│   └── chat.html         ← TravelGPT chatbot page
└── static/
    ├── css/main.css
    └── js/main.js
```

---

## 🔑 IBM Watsonx.ai Setup

1. Create an [IBM Cloud account](https://cloud.ibm.com/registration)
2. Provision **Watson Machine Learning** service
3. Open [watsonx.ai](https://dataplatform.cloud.ibm.com/wx/home) → create a project → copy the **Project ID**
4. IBM Cloud → Manage → [API Keys](https://cloud.ibm.com/iam/apikeys) → create key
5. Set `IBM_API_KEY` and `IBM_PROJECT_ID`

> **Without credentials** the app runs in **Demo Mode** — a full sample plan is shown so the UI works without an IBM account.

---

## 🎯 Demo Question

> Plan a 4-day family trip from Chennai to Munnar for 4 people with a budget of ₹40,000.
> Train travel, standard hotel, interested in nature, sightseeing, and local food.

Click **✨ Fill Demo** on the planner page to auto-fill this.
# TravelGPT-pro
# Travelplanner-pro
# Travelplanner-pro
