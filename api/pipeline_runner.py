"""
Pipeline Runner — Wraps the existing Clarik pipeline in a background thread
with progress callbacks via a thread-safe queue for WebSocket streaming.
"""

import threading
import queue
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()


class PipelineRunner(threading.Thread):
    """
    Runs the full Clarik analysis pipeline in a background thread.
    Progress updates are pushed to a thread-safe queue that the
    WebSocket handler reads from.

    Heavy imports (whisper, torch, langchain, chromadb) are deferred
    to run() so the server starts quickly and the reloader stays stable.
    """

    def __init__(self, session_id: str, source: str, language: str = "english"):
        super().__init__(daemon=True)
        self.session_id = session_id
        self.source = source
        self.language = language
        self.queue = queue.Queue()
        self.rag_chain = None
        self.results = {}

    def _update(self, stage: str, progress: int, message: str):
        """Push a progress update to the queue."""
        self.queue.put({
            "stage": stage,
            "progress": progress,
            "message": message,
        })

    def run(self):
        # ── Lazy imports — only load heavy libs when pipeline actually runs ──
        from utils.audio_processor import process_input
        from core.transcriber import transcribe_all
        from core.summarizer import summarize, generate_title
        from core.extractor import extract_action_items, extract_key_decisions, extract_questions
        from core.rag_engine import build_rag_chain

        try:
            # ── Stage 1: Download / Convert ──
            self._update("downloading", 5, "Processing audio source...")
            chunks = process_input(self.source)

            # ── Stage 2: Chunking complete ──
            self._update("chunking", 10, f"Audio split into {len(chunks)} chunk(s)")

            # ── Stage 3: Transcribe ──
            self._update("transcribing", 15, "Transcribing audio with AI...")
            transcript = transcribe_all(chunks, language=self.language)

            # ── Stage 4: Generate Title ──
            self._update("generating_title", 30, "Generating title...")
            title = generate_title(transcript)

            # ── Stage 5: Summarize ──
            self._update("summarizing", 45, "Summarizing transcript...")
            summary = summarize(transcript)

            # ── Stage 6: Extract Action Items ──
            self._update("extracting_actions", 60, "Extracting action items...")
            action_items = extract_action_items(transcript)

            # ── Stage 7: Extract Key Decisions ──
            self._update("extracting_decisions", 75, "Extracting key decisions...")
            decisions = extract_key_decisions(transcript)

            # ── Stage 8: Extract Open Questions ──
            self._update("extracting_questions", 85, "Finding open questions...")
            questions = extract_questions(transcript)

            # ── Stage 9: Build RAG Knowledge Base ──
            self._update("building_rag", 92, "Building knowledge base for chat...")
            self.rag_chain = build_rag_chain(transcript)

            # ── Stage 10: Complete ──
            self.results = {
                "title": title,
                "transcript": transcript,
                "summary": summary,
                "action_items": action_items,
                "key_decisions": decisions,
                "open_questions": questions,
            }

            self.queue.put({
                "stage": "complete",
                "progress": 100,
                "message": "Analysis complete!",
                "data": self.results,
            })

        except Exception as e:
            self.queue.put({
                "stage": "error",
                "progress": 0,
                "message": f"Pipeline error: {str(e)}",
            })
