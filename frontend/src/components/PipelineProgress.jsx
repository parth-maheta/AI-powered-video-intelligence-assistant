/**
 * Animated pipeline progress visualization.
 * Shows 10 stages as connected nodes that activate sequentially.
 */

const STAGES = [
  { id: 'downloading',          label: 'Download',  icon: '⬇️' },
  { id: 'chunking',             label: 'Chunk',     icon: '✂️' },
  { id: 'transcribing',         label: 'Transcribe',icon: '🎤' },
  { id: 'generating_title',     label: 'Title',     icon: '📌' },
  { id: 'summarizing',          label: 'Summarize', icon: '📝' },
  { id: 'extracting_actions',   label: 'Actions',   icon: '✅' },
  { id: 'extracting_decisions', label: 'Decisions', icon: '🎯' },
  { id: 'extracting_questions', label: 'Questions', icon: '❓' },
  { id: 'building_rag',         label: 'Knowledge', icon: '🧠' },
  { id: 'complete',             label: 'Done!',     icon: '🚀' },
];

export default function PipelineProgress({ progress }) {
  const currentIndex = STAGES.findIndex(s => s.id === progress.stage);

  return (
    <div className="pipeline">
      <div className="pipeline-header">
        <h2 className="pipeline-title">
          <span className="gradient-text">Analyzing Video</span>
          <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>
        </h2>
        <p className="pipeline-subtitle">Extracting deep neural intelligence</p>
      </div>

      {/* Stage Nodes */}
      <div className="pipeline-stages">
        {STAGES.map((stage, i) => {
          let status = 'pending';
          if (i < currentIndex) status = 'completed';
          else if (i === currentIndex) status = 'active';

          return (
            <div key={stage.id} className={`stage ${status}`}>
              <div className="stage-node">
                <span className="stage-icon">
                  {status === 'completed' ? '✓' : stage.icon}
                </span>
              </div>
              {i < STAGES.length - 1 && (
                <div className={`stage-connector ${i < currentIndex ? 'filled' : ''}`} />
              )}
              <span className="stage-label">{stage.label}</span>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="pipeline-progress-bar">
        <div
          className="pipeline-progress-fill"
          style={{ width: `${progress.progress || 0}%` }}
        />
      </div>

      {/* Status Message */}
      <p className="pipeline-message">{progress.message || 'Initializing...'}</p>
    </div>
  );
}
