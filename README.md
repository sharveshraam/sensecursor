# SenseCursor

SenseCursor is a glassmorphism-inspired digital writing app built with React, Vite, Tailwind CSS, HTML5 Canvas, and FastAPI. It combines a modular dashboard, reusable handwriting engine, optional text conversion, and export tooling across three workspaces: Smart Board, Infinite Canvas, and PDF Editor.

## Features

- Dashboard with animated workspace cards
- Shared workspace shell with toolbar, floating settings, and canvas surface
- Writing engine with freehand drawing, eraser, undo/redo, pen lift detection, stroke grouping, timeout-based conversion, and ghost text preview
- Local persistence for settings and workspace state
- Infinite canvas pan/zoom interactions
- PDF editor upload overlay placeholder for annotation workflows
- JSON and PDF export hooks
- FastAPI backend with `/recognize`, `/export`, and OCR/image-builder service modules
- Future-ready placeholders for OCR providers, auth, cloud sync, replay, and shape detection

## Frontend Setup

```bash
npm install
npm run dev
```

Frontend runs at [http://localhost:5173](http://localhost:5173).

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at [http://127.0.0.1:8000](http://127.0.0.1:8000).

## Notes

- Settings persist with `localStorage`.
- Clean Text Mode is on by default.
- The backend currently returns dummy OCR text (`hello`).
- PDF editing is implemented as a phase-one upload + annotation workflow, with deeper page rendering/export composition left as the next hook.

## GitHub Pages Deploy Note

This app uses a relative Vite `base` path (`./`) so compiled assets resolve correctly on both:
- project pages (`https://<user>.github.io/<repo>/`)
- user/org root pages (`https://<user>.github.io/`)

If you were seeing a blank page, rebuild and redeploy so `dist/index.html` references relative asset paths.


## Deploy Without Local Node.js

If `npm` is not available on your computer, you can still deploy by pushing code to GitHub.
This repo includes a GitHub Actions workflow that installs Node.js, runs `npm ci`, builds the app,
and deploys `dist/` to GitHub Pages automatically.
- The deploy workflow also writes `dist/404.html` from `dist/index.html` for SPA fallback behavior on direct route hits.

### One-time GitHub Pages setup
1. Open your repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main`, `master`, or `work` to trigger deployment.
