<div align="center">

# 🎬 Clarik

### AI-Powered Video Intelligence Assistant

**Extract insights from any video in seconds — not hours.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

[Features](#-features) · [Demo](#-how-it-works) · [Quick Start](#-quick-start) · [API Reference](#-api-reference) · [Architecture](#-architecture) · [Contributing](#-contributing)

</div>

---

## 🧠 What is Clarik?

Clarik is an end-to-end AI assistant that transforms video and audio content into structured, actionable intelligence. Paste a YouTube URL or upload a file, and Clarik will:

> **Transcribe → Summarize → Extract Insights → Let You Chat with the Content**

Whether it's a 3-hour lecture, a team standup, or a podcast episode — Clarik distils it into a digestible report you can export as PDF, and a RAG-powered chatbot you can query for details.

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🎯 Core Intelligence
- **Smart Transcription** — Whisper (local) for English, Sarvam AI for Hinglish with auto Hindi→English translation
- **AI Summarization** — Mistral-powered concise summaries via LangChain
- **Action Item Extraction** — Automatically identifies tasks and follow-ups
- **Key Decision Mining** — Highlights critical decisions from discussions
- **Open Question Detection** — Surfaces unresolved topics

</td>
<td width="50%">

### 💬 Interactive Analysis
- **RAG-Powered Chat** — Ask follow-up questions against the full transcript using ChromaDB + HuggingFace embeddings
- **Real-Time Progress** — WebSocket-driven pipeline progress with live stage updates
- **PDF Export** — One-click branded PDF reports
- **Dual Input Modes** — YouTube URL or direct file upload

</td>
</tr>
</table>

### 🌐 Multilingual Support

| Language | Engine | Type |
|----------|--------|------|
| 🇬🇧 English | OpenAI Whisper | Local (on-device) |
| 🇮🇳 Hinglish | Sarvam AI | Cloud API + Translation |

---

## 🔄 How It Works

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   YouTube    │     │   Download   │     │   Chunk &    │     │  Transcribe  │
│   URL or     │────▶│   & Convert  │────▶│   Split      │────▶│  (Whisper /  │
│   File       │     │   to WAV     │     │   Audio      │     │   Sarvam)    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                     ┌──────────────────────────────────────────────────┘
                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Generate    │     │  Summarize   │     │  Extract     │     │  Build RAG   │
│  Title       │────▶│  Content     │────▶│  Insights    │────▶│  Knowledge   │
│  (LLM)       │     │  (LLM)       │     │  (LLM)       │     │  Base        │
└──────────────┘     └──────────────┘     └──────────────┘     └──────┬───────┘
                                                                      │
                     ┌──────────────────────────────────────────────────┘
                     ▼
              ┌──────────────┐
              │  📊 Results  │
              │  Dashboard + │
              │  💬 Chat     │
              └──────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Immersive 3D UI with Three.js, GSAP animations |
| **Backend** | FastAPI + WebSocket | REST API, real-time progress streaming |
| **Transcription** | OpenAI Whisper / Sarvam AI | Local & cloud speech-to-text |
| **LLM** | Mistral AI via LangChain | Summarization, extraction, Q&A |
| **Vector Store** | ChromaDB | RAG retrieval engine |
| **Embeddings** | HuggingFace Sentence Transformers | Semantic search embeddings |
| **Audio** | yt-dlp + pydub + FFmpeg | Download, convert, chunk |
| **Export** | FPDF2 | Branded PDF report generation |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Minimum Version |
|------------|----------------|
| Python | ≥ 3.10 |
| Node.js | ≥ 18 |
| FFmpeg | Latest (must be on PATH) |

### 1. Clone & Setup Backend

```bash
# Clone the repository
git clone https://github.com/parth-maheta/AI-powered-video-intelligence-assistant.git
cd AI-powered-video-intelligence-assistant

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS / Linux

# Install Python dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys (see table below)
```

### 2. Setup Frontend

```bash
cd frontend
npm install
```

### 3. Run

Open **two terminals**:

```bash
# Terminal 1 — Start the API server
uvicorn api.server:app --reload --port 8000
```

```bash
# Terminal 2 — Start the frontend dev server
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🔑 Environment Variables

Create a `.env` file in the project root (use `.env.example` as a template):

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `MISTRAL_API_KEY` | ✅ | API key for [Mistral AI](https://console.mistral.ai/) | — |
| `WHISPER_MODEL` | ❌ | Whisper model size (`tiny` · `base` · `small` · `medium` · `large`) | `small` |
| `SARVAM_API_KEY` | ⚠️ | Required only for Hinglish transcription ([Sarvam AI](https://sarvam.ai/)) | — |
| `SARVAM_STT_MODEL` | ❌ | Sarvam STT model identifier | `saaras:v2.5` |

---

## 📡 API Reference

### `GET /api/health`
Health check endpoint.

**Response:** `{ "status": "ok", "service": "clarik" }`

---

### `POST /api/analyze`
Start an analysis pipeline.

| Parameter | Type | Description |
|-----------|------|-------------|
| `source_url` | `string` | YouTube URL to process |
| `file` | `file` | Direct audio/video upload |
| `language` | `string` | `english` (default) or `hinglish` |

**Response:** `{ "session_id": "uuid" }`

> Connect to `ws://localhost:8000/ws/{session_id}` for real-time progress.

---

### `POST /api/chat`
Ask a question about the analyzed content.

```json
{ "session_id": "uuid", "question": "What were the key takeaways?" }
```

**Response:** `{ "answer": "..." }`

---

### `GET /api/export/{session_id}`
Download a PDF report for a completed analysis.

**Response:** `application/pdf` file download.

---

## 🏗️ Architecture

```
AI-powered-video-intelligence-assistant/
│
├── api/                          # FastAPI backend
│   ├── server.py                 # REST endpoints + WebSocket handler
│   └── pipeline_runner.py        # Threaded pipeline with progress queue
│
├── core/                         # AI processing modules
│   ├── transcriber.py            # Whisper & Sarvam transcription engines
│   ├── summarizer.py             # LLM summarization & title generation
│   ├── extractor.py              # Action items, decisions & questions
│   ├── rag_engine.py             # LangChain RAG chain builder
│   └── vector_store.py           # ChromaDB vector store management
│
├── utils/
│   └── audio_processor.py        # Audio download, conversion & chunking
│
├── frontend/                     # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx               # Main application shell
│   │   ├── components/
│   │   │   ├── Scene3D.jsx       # Three.js 3D background scene
│   │   │   ├── NeuralBackground.jsx  # Animated neural network canvas
│   │   │   ├── HeroInput.jsx     # URL / file upload input
│   │   │   ├── PipelineProgress.jsx  # Real-time stage tracker
│   │   │   ├── ResultsDashboard.jsx  # Analysis results display
│   │   │   ├── ResultCard.jsx    # Individual result section card
│   │   │   └── ChatPanel.jsx     # RAG-powered Q&A interface
│   │   └── utils/
│   │       └── api.js            # API client utilities
│   └── index.html
│
├── main.py                       # CLI entry point
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variable template
└── README.md
```

---

## 🧪 Usage Examples

### CLI Mode

```bash
python main.py
# Enter YouTube URL or local file path: https://youtube.com/watch?v=...
# Language (english/hinglish): english
```

### Python API

```python
from dotenv import load_dotenv
load_dotenv()

from main import run_pipeline

result = run_pipeline("https://youtube.com/watch?v=VIDEO_ID", language="english")

print(result["title"])          # Auto-generated title
print(result["summary"])        # AI summary
print(result["action_items"])   # Extracted action items
print(result["key_decisions"])  # Key decisions
print(result["open_questions"]) # Unresolved questions
```

### Ask Questions via RAG

```python
from core.rag_engine import ask_question

answer = ask_question(result["rag_chain"], "What was the main argument?")
print(answer)
```

---

## 🗺️ Roadmap

- [ ] Speaker diarization (who said what)
- [ ] Multi-language expansion beyond English & Hinglish
- [ ] Video frame analysis with vision models
- [ ] Collaborative workspaces with shared analysis
- [ ] Browser extension for one-click video analysis

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch — `git checkout -b feat/amazing-feature`
3. **Commit** your changes — `git commit -m "feat: add amazing feature"`
4. **Push** to the branch — `git push origin feat/amazing-feature`
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with 💜 by [Parth Maheta](https://github.com/parth-maheta)**

⭐ Star this repo if you found it useful!

</div>
