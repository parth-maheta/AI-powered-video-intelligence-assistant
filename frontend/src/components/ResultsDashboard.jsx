import ResultCard from './ResultCard';
import { ArrowLeft, FileDown } from 'lucide-react';
import { API_BASE } from '../utils/api';

/**
 * Results dashboard with bento grid layout.
 * Displays all analysis results.
 */
export default function ResultsDashboard({ results, sessionId, onReset }) {
  const handleExport = () => {
    window.open(`${API_BASE}/api/export/${sessionId}`, '_blank');
  };

  const cards = [
    { title: 'Summary',        icon: '📝', content: results.summary,        className: 'span-2' },
    { title: 'Action Items',   icon: '✅', content: results.action_items,   className: '' },
    { title: 'Key Decisions',  icon: '🎯', content: results.key_decisions,  className: 'span-2' },
    { title: 'Open Questions', icon: '❓', content: results.open_questions, className: '' },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <button id="back-btn" className="back-btn" onClick={onReset}>
          <ArrowLeft size={16} />
          New Analysis
        </button>

        <h1 className="dashboard-title">
          <span className="gradient-text">{results.title}</span>
        </h1>

        <button id="export-btn" className="export-btn" onClick={handleExport}>
          <FileDown size={16} />
          Export PDF
        </button>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        {cards.map((card, i) => (
          <ResultCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            content={card.content}
            className={card.className}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
