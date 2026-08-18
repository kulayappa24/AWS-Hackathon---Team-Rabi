import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { FeedbackType } from '../types/chat';

interface FeedbackButtonsProps {
  messageId: number;
  initialFeedback: FeedbackType;
  onFeedback: (messageId: number, feedback: 'UP' | 'DOWN') => void;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  initialFeedback,
  onFeedback,
}) => {
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackType>(initialFeedback);

  const handleAction = (type: 'UP' | 'DOWN') => {
    const next = currentFeedback === type ? 'NONE' : type;
    setCurrentFeedback(next as FeedbackType);
    if (next !== 'NONE') {
      onFeedback(messageId, type);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <button
        onClick={() => handleAction('UP')}
        className="btn btn-ghost btn-sm"
        style={{
          padding: '2px 6px',
          color: currentFeedback === 'UP' ? 'var(--color-success)' : 'var(--text-muted)',
          backgroundColor: currentFeedback === 'UP' ? 'var(--color-success-bg)' : 'transparent',
        }}
        title="Helpful answer"
      >
        <ThumbsUp size={13} />
      </button>
      <button
        onClick={() => handleAction('DOWN')}
        className="btn btn-ghost btn-sm"
        style={{
          padding: '2px 6px',
          color: currentFeedback === 'DOWN' ? 'var(--color-danger)' : 'var(--text-muted)',
          backgroundColor: currentFeedback === 'DOWN' ? 'var(--color-danger-bg)' : 'transparent',
        }}
        title="Not helpful"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
};
