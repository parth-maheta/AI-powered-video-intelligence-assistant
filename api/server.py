"""
Clarik API — FastAPI backend with REST endpoints, WebSocket progress, and PDF export.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import uuid
import asyncio
import os
import sys
from io import BytesIO

# Add project root to path for core/utils imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from api.pipeline_runner import PipelineRunner

app = FastAPI(title="Clarik API", version="1.0.0", description="AI-Powered Video Intelligence")

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# In-memory session stores
# ──────────────────────────────────────────────
sessions: dict = {}   # session_id -> result data
runners: dict = {}    # session_id -> PipelineRunner instance


# ──────────────────────────────────────────────
# Health Check
# ──────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "clarik"}


# ──────────────────────────────────────────────
# Analyze — Start pipeline
# ──────────────────────────────────────────────
@app.post("/api/analyze")
async def analyze(
    source_url: str = Form(None),
    language: str = Form("english"),
    file: UploadFile = File(None),
):
    """
    Start the analysis pipeline. Accepts either a YouTube URL or an uploaded file.
    Returns a session_id to connect via WebSocket for progress updates.
    """
    if not source_url and not file:
        raise HTTPException(status_code=400, detail="Provide either source_url or a file upload.")

    session_id = str(uuid.uuid4())

    # Handle file upload — save to downloads/
    if file:
        os.makedirs("downloads", exist_ok=True)
        # Sanitize filename
        safe_name = f"{session_id}_{file.filename}"
        file_path = os.path.join("downloads", safe_name)
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        source = file_path
    else:
        source = source_url

    # Create and start pipeline runner (background thread)
    runner = PipelineRunner(session_id, source, language)
    runners[session_id] = runner
    runner.start()

    return {"session_id": session_id}


# ──────────────────────────────────────────────
# WebSocket — Real-time pipeline progress
# ──────────────────────────────────────────────
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()

    runner = runners.get(session_id)
    if not runner:
        await websocket.send_json({"stage": "error", "progress": 0, "message": "Session not found."})
        await websocket.close()
        return

    loop = asyncio.get_running_loop()
    try:
        while True:
            # Non-blocking read from the thread-safe queue
            msg = await loop.run_in_executor(None, runner.queue.get)
            await websocket.send_json(msg)

            if msg.get("stage") == "complete":
                # Store results for later use (chat, export)
                sessions[session_id] = msg.get("data", {})
                break
            elif msg.get("stage") == "error":
                break
    except WebSocketDisconnect:
        pass


# ──────────────────────────────────────────────
# Chat — RAG Q&A
# ──────────────────────────────────────────────
@app.post("/api/chat")
async def chat(body: dict):
    """Send a question to the RAG chain for a given session."""
    session_id = body.get("session_id")
    question = body.get("question")

    if not session_id or not question:
        raise HTTPException(status_code=400, detail="Provide session_id and question.")

    runner = runners.get(session_id)
    if not runner or not runner.rag_chain:
        raise HTTPException(status_code=404, detail="Session not found or RAG chain not ready.")

    from core.rag_engine import ask_question
    answer = ask_question(runner.rag_chain, question)

    return {"answer": answer}


# ──────────────────────────────────────────────
# Export — PDF report
# ──────────────────────────────────────────────
@app.get("/api/export/{session_id}")
async def export_pdf(session_id: str):
    """Generate and download a PDF report for a completed analysis."""
    data = sessions.get(session_id)
    if not data:
        raise HTTPException(status_code=404, detail="Session not found. Run analysis first.")

    from fpdf import FPDF

    def sanitize(text: str) -> str:
        """Replace unicode chars that latin-1 can't handle."""
        replacements = {
            "\u2014": "--",   # em dash
            "\u2013": "-",    # en dash
            "\u2018": "'",    # left single quote
            "\u2019": "'",    # right single quote
            "\u201c": '"',    # left double quote
            "\u201d": '"',    # right double quote
            "\u2022": "*",    # bullet
            "\u2026": "...",  # ellipsis
            "\u00a0": " ",   # non-breaking space
        }
        for char, replacement in replacements.items():
            text = text.replace(char, replacement)
        return text.encode("latin-1", "replace").decode("latin-1")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # ── Title ──
    pdf.set_font("Helvetica", "B", 22)
    pdf.set_text_color(124, 58, 237)
    title_text = sanitize(data.get("title", "Clarik Analysis Report"))
    pdf.cell(0, 15, title_text, ln=True)
    pdf.ln(3)

    # ── Divider ──
    pdf.set_draw_color(124, 58, 237)
    pdf.set_line_width(0.5)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y())
    pdf.ln(8)

    # ── Sections ──
    sections = [
        ("Summary", data.get("summary", "N/A")),
        ("Action Items", data.get("action_items", "N/A")),
        ("Key Decisions", data.get("key_decisions", "N/A")),
        ("Open Questions", data.get("open_questions", "N/A")),
    ]

    for heading, content in sections:
        # Section heading
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(59, 130, 246)
        pdf.cell(0, 10, heading, ln=True)
        pdf.ln(2)

        # Section content
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(40, 40, 40)
        pdf.multi_cell(0, 6, sanitize(content))
        pdf.ln(6)

    # ── Footer ──
    pdf.ln(10)
    pdf.set_font("Helvetica", "I", 9)
    pdf.set_text_color(150, 150, 150)
    pdf.cell(0, 10, "Generated by Clarik - AI-Powered Video Intelligence", ln=True, align="C")

    # Output
    pdf_bytes = pdf.output()
    buffer = BytesIO(bytes(pdf_bytes) if not isinstance(pdf_bytes, bytes) else pdf_bytes)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="clarik_report_{session_id[:8]}.pdf"'
        },
    )
