import { useState, useRef, useCallback } from 'react';
import Markdown from 'react-markdown';
import { Maximize2, Minimize2 } from 'lucide-react';

/**
 * Glassmorphic result card with:
 * - 3D tilt effect on hover
 * - Animated gradient border
 * - Expand/collapse to full screen overlay
 * - Markdown rendering for LLM output
 */
export default function ResultCard({ title, icon, content, className = '', index = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);

  // ── 3D Tilt Effect ──
  const handleMouseMove = useCallback((e) => {
    if (expanded) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(1000px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) scale(1.01)`;
  }, [expanded]);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (card) {
      card.style.transform = '';
    }
  }, []);

  const toggleExpand = useCallback((e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  }, []);

  return (
    <>
      {expanded && (
        <div className="card-overlay" onClick={toggleExpand} />
      )}

      <div
        ref={cardRef}
        className={`result-card ${className} ${expanded ? 'expanded' : ''}`}
        style={{ '--i': index }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="card-header">
          <span className="card-icon">{icon}</span>
          <h3>{title}</h3>
          <button
            className="expand-btn"
            onClick={toggleExpand}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        <div className="card-content">
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </>
  );
}
