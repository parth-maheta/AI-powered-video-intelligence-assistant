# 🎬 Clarik — AI Video Intelligence Assistant

Clarik is an AI-powered video intelligence assistant that extracts, transcribes, and analyzes audio from video sources. It supports **English** (via OpenAI Whisper) and **Hinglish** (via Sarvam AI with automatic Hindi→English translation).

---

## ✨ Features

- **YouTube & Local File Support** — Paste a YouTube URL or provide a local audio/video file
- **Automatic Audio Extraction** — Downloads and converts audio to WAV using `yt-dlp` + FFmpeg
- **Smart Chunking** — Splits long audio into manageable 10-minute chunks for reliable transcription
- **Dual Transcription Engines**
  - 🇬🇧 **English** → OpenAI Whisper (runs locally)
  - 🇮🇳 **Hinglish** → Sarvam AI (cloud API with built-in translation)
- **LLM-Powered Analysis** — Integrates with Mistral AI via LangChain for intelligent Q&A
- **RAG Pipeline** — ChromaDB + HuggingFace embeddings for context-aware retrieval

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Audio Extraction | `yt-dlp`, `pydub`, `FFmpeg` |
| Speech-to-Text | OpenAI Whisper (local), Sarvam AI (cloud) |
| LLM | Mistral AI via LangChain |
| Vector Store | ChromaDB |
| Embeddings | HuggingFace Sentence Transformers |
| UI | Streamlit |
| Export | ReportLab / FPDF2 (PDF), TXT |

---

## 🚀 Quick Start

### Prerequisites

- Python ≥ 3.10
- [FFmpeg](https://ffmpeg.org/download.html) installed and on PATH

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/AI-VIDEO-AGENT.git
cd AI-VIDEO-AGENT

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Usage

```python
from dotenv import load_dotenv
load_dotenv()

from utils.audio_processor import process_input
from core.transcriber import transcribe_all

source = "https://www.youtube.com/watch?v=VIDEO_ID"
language = "english"  # or "hinglish"

chunks = process_input(source)
transcript = transcribe_all(chunks, language=language)
print(transcript)
```

---

## 📁 Project Structure

```
AI-VIDEO-AGENT/
├── core/
│   └── transcriber.py       # Whisper & Sarvam transcription engines
├── utils/
│   └── audio_processor.py   # Audio download, conversion & chunking
├── downloads/                # Runtime-generated audio files (gitignored)
├── .env.example              # Environment variable template
├── requirements.txt          # Python dependencies
├── test.py                   # Quick test script
└── README.md
```

---

## 🔑 Environment Variables

| Variable | Description |
|---|---|
| `MISTRAL_API_KEY` | API key for Mistral AI |
| `WHISPER_MODEL` | Whisper model size (`tiny`, `base`, `small`, `medium`, `large`) |
| `SARVAM_API_KEY` | API key for Sarvam AI |
| `SARVAM_STT_MODEL` | Sarvam STT model identifier |

---

## 📄 License

MIT

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.
