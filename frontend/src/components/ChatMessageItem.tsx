import React, { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { SourceCard } from './SourceCard';
import { FeedbackButtons } from './FeedbackButtons';
import { User, Bot, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  onFeedback?: (messageId: number, feedback: 'UP' | 'DOWN') => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onFeedback }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'USER';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard failure
    }
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: 'var(--color-primary)',
          border: '1px solid var(--border-subtle)'
        }}>
          <Bot size={20} />
        </div>
      )}

      <div className="message-bubble">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isUser ? 'rgba(255,255,255,0.85)' : 'var(--text-muted)' }}>
            {isUser ? 'You' : 'AWS Student Builder Assistant'}
          </span>
          
          {!isUser && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {message.isFallback ? (
                <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                  <AlertTriangle size={11} /> Directory Fallback
                </span>
              ) : (
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                  <ShieldCheck size={11} /> Grounded in Docs
                </span>
              )}
              <button
                onClick={handleCopy}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 6px', fontSize: '0.75rem', height: 'auto' }}
                title="Copy response"
              >
                {copied ? <Check size={13} color="var(--color-success)" /> : <Copy size={13} />}
              </button>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {message.content}
        </div>

        {/* Grounded Source Card */}
        {!isUser && (message.sourceFile || message.primarySource) && (
          <SourceCard
            primarySource={message.primarySource || {
              filename: message.sourceFile || '',
              section: message.sourceSection || 'General',
              relevanceScore: message.confidenceScore,
            }}
            allSources={message.allSources}
          />
        )}

        {/* Thumbs up / down feedback */}
        {!isUser && message.id && onFeedback && (
          <div style={{ marginTop: '0.625rem', display: 'flex', justifyContent: 'flex-end' }}>
            <FeedbackButtons
              messageId={message.id}
              initialFeedback={message.feedback || 'NONE'}
              onFeedback={onFeedback}
            />
          </div>
        )}
      </div>

      {isUser && (
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#ffffff'
        }}>
          <User size={20} />
        </div>
      )}
    </div>
  );
};
