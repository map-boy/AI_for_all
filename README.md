# 🇷🇼 UBWENGE HUB — Unified AI Platform for Rwanda

> AI-powered platform built for Rwanda — Finance Intelligence · Interview Integrity · Tourism Guide

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Python](https://img.shields.io/badge/Python-3.11-green)
![React](https://img.shields.io/badge/React-19-61dafb)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 💰 Finance AI
- Upload your transactions and get instant wealth analysis
- AI-powered poverty probability prediction
- Saving recommendations tailored for Rwanda's economy
- Beautiful charts showing your financial trends

### 🎓 Proctor AI
- Real-time face detection using MediaPipe
- AI interview integrity monitoring via webcam
- Detects suspicious behavior during remote interviews
- Privacy-first — all processing happens in your browser

### 🗺️ Rwanda Tour Guide
- Bilingual AI guide (Kinyarwanda + English)
- Ask about local events, news, restaurants, and culture
- Voice input and text-to-speech output
- Powered by Google Gemini AI

---

## 🏗️ Architecture
```
ubwenge-hub/
├── frontend/          # React + TypeScript + Vite (port 5173)
│   └── src/
│       ├── components/
│       │   ├── FinanceAI.tsx
│       │   ├── ProctorAI.tsx
│       │   ├── RwandaTour.tsx
│       │   ├── HomeHub.tsx
│       │   └── NavigationRail.tsx
│       └── App.tsx
│
├── backend/
│   ├── node/          # Express + TypeScript API (port 3001)
│   │   └── server.ts
│   └── python/        # FastAPI + ML models (port 8000)
│       └── main.py
│
└── mobile/            # Flutter (coming soon)
    └── lib/main.dart
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Google Gemini API key → [Get one free](https://aistudio.google.com/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/map-boy/AI_for_all.git
cd AI_for_all
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
VITE_GEMINI_API_KEY=your_gemini_key_here
```
```bash
npm run dev
```
→ Opens at **http://localhost:5173**

### 3. Setup Node Backend
```bash
cd backend/node
npm install
```

Create `backend/node/.env`:
```
GEMINI_API_KEY=your_gemini_key_here
PORT=3001
```
```bash
npm run dev
```
→ Runs at **http://localhost:3001**

### 4. Setup Python Backend
```bash
cd backend/python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
→ Runs at **http://localhost:8000**

---

## 🔑 Environment Variables

| File | Variable | Description |
|---|---|---|
| `frontend/.env.local` | `VITE_GEMINI_API_KEY` | Gemini key for browser features |
| `backend/node/.env` | `GEMINI_API_KEY` | Gemini key for server-side AI |
| `backend/node/.env` | `PORT` | Node server port (default 3001) |
| `backend/node/.env` | `PYTHON_SERVICE_URL` | Python service URL (default http://localhost:8000) |

> ⚠️ Never commit `.env` or `.env.local` files — they are in `.gitignore`

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS |
| Animation | Motion (Framer Motion) |
| Charts | Recharts |
| Face Detection | MediaPipe Tasks Vision |
| Node Backend | Express, TypeScript, tsx |
| Python Backend | FastAPI, NumPy, Uvicorn |
| AI | Google Gemini 2.0 Flash |
| Mobile (soon) | Flutter |

---

## 📱 Coming Soon

- [ ] Flutter mobile app (iOS + Android)
- [ ] Deploy to Vercel + Render
- [ ] User authentication
- [ ] Rwanda maps integration
- [ ] Offline Kinyarwanda support

---

## 🤝 Contributing

1. Fork the repo
2. Create your branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m "feat: add amazing feature"`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

Built with ❤️ for Rwanda by **WANDAA**

> *"Ubwenge" means "Intelligence/Wisdom" in Kinyarwanda*