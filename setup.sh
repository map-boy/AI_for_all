#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  UBWENGE HUB — Project Setup Script
#  Run this ONE script from C:\projects_test\Al_for_all (or any dir)
#  Windows: run in Git Bash or WSL
#  Mac/Linux: bash setup.sh
# ═══════════════════════════════════════════════════════════════════

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

echo -e "${BLUE}"
echo "  ██╗   ██╗██████╗ ██╗    ██╗███████╗███╗   ██╗ ██████╗ ███████╗"
echo "  ██║   ██║██╔══██╗██║    ██║██╔════╝████╗  ██║██╔════╝ ██╔════╝"
echo "  ██║   ██║██████╔╝██║ █╗ ██║█████╗  ██╔██╗ ██║██║  ███╗█████╗  "
echo "  ╚██╗ ██╔╝██╔══██╗██║███╗██║██╔══╝  ██║╚██╗██║██║   ██║██╔══╝  "
echo "   ╚████╔╝ ██████╔╝╚███╔███╔╝███████╗██║ ╚████║╚██████╔╝███████╗"
echo "    ╚═══╝  ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝"
echo -e "${NC}"
echo -e "${GREEN}  UBWENGE HUB — Project Setup${NC}"
echo ""

# ── 1. CREATE DIRECTORY STRUCTURE ──────────────────────────────────
echo -e "${YELLOW}[1/6] Creating project structure...${NC}"
mkdir -p frontend/src/components
mkdir -p frontend/src/lib
mkdir -p backend/node
mkdir -p backend/python/models
mkdir -p mobile/lib
echo -e "${GREEN}  ✅ Directories ready${NC}"

# ── 2. COPY EXISTING FILES INTO NEW STRUCTURE ───────────────────────
echo -e "${YELLOW}[2/6] Moving your existing files...${NC}"

# Copy CSS, index, main, vite config to frontend
[ -f index.css ]       && cp index.css       frontend/src/index.css
[ -f index.html ]      && cp index.html      frontend/index.html
[ -f vite_config.ts ]  && cp vite_config.ts  frontend/vite.config.ts
[ -f tsconfig.json ]   && cp tsconfig.json   frontend/tsconfig.json
[ -f package.json ]    && cp package.json    frontend/package.json
[ -f package-lock.json ] && cp package-lock.json frontend/package-lock.json
[ -f metadata.json ]   && cp metadata.json   metadata.json

# Move src files if they're already in src/
[ -f src/App.tsx ]         && cp src/App.tsx      frontend/src/App.tsx.bak
[ -f src/main.tsx ]        && cp src/main.tsx     frontend/src/main.tsx
[ -f src/lib/utils.ts ]    && cp src/lib/utils.ts frontend/src/lib/utils.ts
[ -f src/index.css ]       && cp src/index.css    frontend/src/index.css

echo -e "${GREEN}  ✅ Files moved${NC}"

# ── 3. WRITE .env FILES ─────────────────────────────────────────────
echo -e "${YELLOW}[3/6] Creating environment files...${NC}"

cat > frontend/.env.local << 'EOF'
# Frontend — only non-secret public vars go here
VITE_APP_NAME=UBWENGE HUB
EOF

cat > backend/node/.env << 'EOF'
# Node backend secrets — NEVER commit this file
GEMINI_API_KEY=your_gemini_api_key_here
CLAUDE_API_KEY=your_claude_api_key_here
PYTHON_SERVICE_URL=http://localhost:8000
PORT=3000
EOF

cat > backend/python/.env << 'EOF'
# Python service secrets
GEMINI_API_KEY=your_gemini_api_key_here
EOF

echo -e "${GREEN}  ✅ .env files created (fill in your API keys!)${NC}"

# ── 4. WRITE .gitignore ─────────────────────────────────────────────
echo -e "${YELLOW}[4/6] Writing root .gitignore...${NC}"

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
.venv/
venv/

# Build outputs
dist/
build/
*.egg-info/

# Environment files — NEVER commit these
.env
.env.local
.env.*.local
backend/node/.env
backend/python/.env

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Flutter
mobile/.dart_tool/
mobile/.flutter-plugins
mobile/.flutter-plugins-dependencies
mobile/build/

# ML models (too large for git — use git-lfs or cloud storage)
backend/python/models/*.pkl
backend/python/models/*.h5
EOF

echo -e "${GREEN}  ✅ .gitignore written${NC}"

# ── 5. WRITE README ─────────────────────────────────────────────────
echo -e "${YELLOW}[5/6] Writing README.md...${NC}"

cat > README.md << 'EOF'
<div align="center">

# 🇷🇼 UBWENGE HUB

**Unified AI Platform for Rwanda**
Finance · Integrity · Tourism

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Flutter](https://img.shields.io/badge/Flutter-02569B?style=flat&logo=flutter&logoColor=white)](https://flutter.dev)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org)

</div>

## Features

| Module | Description | Tech |
|--------|-------------|------|
| 💰 Finance AI | Wealth trend prediction & MoMo statement analysis | React + FastAPI + scikit-learn |
| 🎓 Proctor AI | Camera-based exam integrity monitoring | React + MediaPipe + WebRTC |
| 🗺️ Rwanda Tour | Bilingual AI tourist guide (Kinyarwanda/English) | React + Google Gemini |

## Project Structure

```
ubwenge-hub/
├── frontend/          ← TypeScript + React + Vite (web app)
│   └── src/
│       ├── components/
│       │   ├── NavigationRail.tsx
│       │   ├── HomeHub.tsx
│       │   ├── FinanceAI.tsx
│       │   ├── ProctorAI.tsx
│       │   └── RwandaTour.tsx
│       ├── App.tsx
│       └── main.tsx
├── backend/
│   ├── node/          ← TypeScript + Express (API gateway, auth)
│   │   └── server.ts
│   └── python/        ← Python + FastAPI (ML models)
│       ├── main.py
│       └── requirements.txt
└── mobile/            ← Flutter (iOS + Android + macOS via Xcode)
    └── lib/main.dart
```

## Quick Start (Web)

```bash
# 1. Install frontend dependencies
cd frontend && npm install

# 2. Set your API key
echo "GEMINI_API_KEY=your_key_here" >> .env.local

# 3. Start Node backend
cd ../backend/node && npm install && npx tsx server.ts

# 4. (Optional) Start Python service
cd ../backend/python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# 5. Open http://localhost:3000
```

## Mobile (Flutter + Xcode)

```bash
cd mobile
flutter pub get
flutter run                    # Android / default device
open ios/Runner.xcworkspace    # iOS via Xcode
open macos/Runner.xcworkspace  # macOS via Xcode
```

## Environment Variables

| File | Variable | Description |
|------|----------|-------------|
| `backend/node/.env` | `GEMINI_API_KEY` | Google Gemini API key |
| `backend/node/.env` | `CLAUDE_API_KEY` | Anthropic Claude API key |
| `backend/node/.env` | `PYTHON_SERVICE_URL` | URL to Python FastAPI service |

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend (Node)**: Express, TypeScript, tsx
- **Backend (Python)**: FastAPI, scikit-learn, NumPy, Pydantic
- **AI**: Google Gemini 2.0, MediaPipe Face Landmarker
- **Mobile**: Flutter, Dart (iOS + Android + macOS via Xcode)

## License

MIT © UBWENGE HUB Team — Rwanda 🇷🇼
EOF

echo -e "${GREEN}  ✅ README.md written${NC}"

# ── 6. GIT INIT ─────────────────────────────────────────────────────
echo -e "${YELLOW}[6/6] Initializing Git repository...${NC}"

if [ ! -d ".git" ]; then
  git init
  git add .
  git commit -m "feat: initial UBWENGE HUB v2.0 — modular structure (TypeScript + Python + Flutter)"
  echo -e "${GREEN}  ✅ Git repo initialized with first commit${NC}"
else
  git add .
  git commit -m "refactor: migrate to modular architecture (frontend/backend/mobile)"
  echo -e "${GREEN}  ✅ Changes committed to existing repo${NC}"
fi

# ── DONE ────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  UBWENGE HUB setup complete!${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${BLUE}Next steps:${NC}"
echo -e "  1. Fill in API keys in ${YELLOW}backend/node/.env${NC}"
echo -e "  2. ${YELLOW}cd frontend && npm install${NC}"
echo -e "  3. ${YELLOW}cd backend/node && npx tsx server.ts${NC}"
echo -e "  4. Push to GitHub:"
echo -e "     ${YELLOW}git remote add origin https://github.com/YOUR_USERNAME/ubwenge-hub.git${NC}"
echo -e "     ${YELLOW}git push -u origin main${NC}"
echo ""
