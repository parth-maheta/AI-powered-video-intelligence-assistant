import { useState, useCallback, useRef, useEffect } from 'react';
import NeuralBackground from './components/NeuralBackground';
import HeroInput from './components/HeroInput';
import PipelineProgress from './components/PipelineProgress';
import ResultsDashboard from './components/ResultsDashboard';
import ChatPanel from './components/ChatPanel';
import Scene3D from './components/Scene3D';
import { API_BASE, WS_BASE } from './utils/api';
import './App.css';

function App() {
  const [sessionState, setSessionState] = useState('idle'); // idle | processing | complete
  const [sessionId, setSessionId] = useState(null);
  const [progress, setProgress] = useState({ stage: '', progress: 0, message: '' });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Refs for smooth scrolling
  const progressRef = useRef(null);
  const resultsRef = useRef(null);

  const scrollToRef = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleAnalyze = useCallback(async (source, language, file) => {
    setSessionState('processing');
    setError(null);
    setProgress({ stage: 'connecting', progress: 0, message: 'Starting analysis...' });
    
    // Allow React to render the progress section before scrolling to it
    setTimeout(() => scrollToRef(progressRef), 100);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    } else {
      formData.append('source_url', source);
    }
    formData.append('language', language);

    try {
      const res = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to start analysis');
      }

      const data = await res.json();
      const sid = data.session_id;
      setSessionId(sid);

      // Connect WebSocket for real-time progress
      const ws = new WebSocket(`${WS_BASE}/ws/${sid}`);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        setProgress(msg);

        if (msg.stage === 'complete') {
          setResults(msg.data);
          setSessionState('complete');
          ws.close();
          // Scroll to results after a short delay
          setTimeout(() => scrollToRef(resultsRef), 500);
        }

        if (msg.stage === 'error') {
          setError(msg.message);
          setSessionState('idle');
          ws.close();
        }
      };

      ws.onerror = () => {
        setError('WebSocket connection failed. Is the backend running?');
        setSessionState('idle');
      };
    } catch (err) {
      setError(err.message);
      setSessionState('idle');
    }
  }, []);

  const handleReset = useCallback(() => {
    setSessionState('idle');
    setSessionId(null);
    setProgress({ stage: '', progress: 0, message: '' });
    setResults(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="app">
      <NeuralBackground intensity={sessionState === 'complete' ? 0.3 : 1} />
      
      {/* 3D Scene Layer */}
      <div className="scene-layer">
        <Scene3D isAnalyzing={sessionState === 'processing'} />
      </div>

      {error && (
        <div className="error-toast">
          <span>⚠️ {error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Main Scrolling Container */}
      <div className="scrolling-container">
        
        {/* Landing Section (Always visible at top) */}
        <section className="section-hero">
          <HeroInput onAnalyze={handleAnalyze} />
        </section>

        {/* Processing Section */}
        {sessionState !== 'idle' && (
          <section className="section-progress" ref={progressRef}>
            <PipelineProgress progress={progress} />
          </section>
        )}

        {/* Results Section */}
        {sessionState === 'complete' && results && (
          <section className="section-results" ref={resultsRef}>
            <ResultsDashboard
              results={results}
              sessionId={sessionId}
              onReset={handleReset}
            />
          </section>
        )}
      </div>

      {/* Floating Chat Widget */}
      {sessionState === 'complete' && sessionId && (
        <ChatPanel sessionId={sessionId} />
      )}
    </div>
  );
}

export default App;
