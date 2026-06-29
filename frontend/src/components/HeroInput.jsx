import { useState, useRef, useCallback } from 'react';
import { Link, Upload, FileAudio, Sparkles, Zap } from 'lucide-react';

/**
 * Hero landing section with:
 * - YouTube URL text input
 * - Drag-and-drop file upload zone
 * - Language toggle (English / Hinglish)
 * - Animated analyze button
 */
export default function HeroInput({ onAnalyze }) {
  const [source, setSource] = useState('');
  const [language, setLanguage] = useState('english');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // ── Drag & Drop Handlers ──
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
      setSource('');
    }
  }, []);

  const handleFileSelect = useCallback((e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setSource('');
    }
  }, []);

  const clearFile = useCallback((e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── Submit ──
  const handleSubmit = useCallback(() => {
    if (!source && !file) return;
    onAnalyze(source, language, file);
  }, [source, language, file, onAnalyze]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  const isReady = source.trim() || file;

  return (
    <div className="hero">
      {/* Floating Decorative Elements */}
      <div className="floating-badge badge-1">🧠 Deep Neural Sync</div>
      <div className="floating-badge badge-2">⚡ Accelerated Extraction</div>
      <div className="floating-badge badge-3">🎯 RAG Precision</div>
      <div className="floating-badge badge-4">🌐 Multilingual AI</div>
      <div className="floating-badge badge-5">🎥 Semantic Chunking</div>

      {/* Badge */}
      <div className="hero-badge">
        <Zap size={12} />
        AI-Powered Video Intelligence
      </div>

      {/* Title */}
      <h1 className="hero-title">
        <span className="gradient-text">Clarik</span>
      </h1>
      <p className="hero-subtitle">
        Transcribe, summarize, and chat with any video — powered by AI
      </p>

      <div className="hero-card">
        {/* ── URL Input ── */}
        <div className="url-input-wrapper">
          <Link size={18} className="input-icon" />
          <input
            id="source-url-input"
            type="text"
            placeholder="Paste a YouTube URL..."
            value={source}
            onChange={(e) => { setSource(e.target.value); setFile(null); }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* ── Divider ── */}
        <div className="input-divider">
          <span>or</span>
        </div>

        {/* ── Drop Zone ── */}
        <div
          id="file-drop-zone"
          className={`drop-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div className="file-info">
              <FileAudio size={18} className="file-icon" />
              <span>{file.name}</span>
              <button className="file-clear-btn" onClick={clearFile} aria-label="Remove file">
                ✕
              </button>
            </div>
          ) : (
            <>
              <Upload size={28} className="drop-icon" />
              <p>Drop an audio or video file here, or click to browse</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            onChange={handleFileSelect}
            accept="audio/*,video/*,.mp3,.mp4,.wav,.m4a,.webm,.ogg,.flac,.mkv,.avi"
          />
        </div>

        {/* ── Action Row (Language + Submit) ── */}
        <div className="action-row">
          <div className="language-toggle">
            <button
              id="lang-english"
              className={language === 'english' ? 'active' : ''}
              onClick={() => setLanguage('english')}
            >
              🇬🇧 English
            </button>
            <button
              id="lang-hinglish"
              className={language === 'hinglish' ? 'active' : ''}
              onClick={() => setLanguage('hinglish')}
            >
              🇮🇳 Hinglish
            </button>
          </div>

          <button
            id="analyze-btn"
            className="analyze-btn"
            onClick={handleSubmit}
            disabled={!isReady}
          >
            <Sparkles size={20} className="btn-icon" />
            Analyze Video
          </button>
        </div>
      </div>
    </div>
  );
}
