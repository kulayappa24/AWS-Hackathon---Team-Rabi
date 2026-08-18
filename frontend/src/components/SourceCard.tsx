import React, { useState } from 'react';
import { SourceCitation } from '../types/chat';
import { FileText, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';

interface SourceCardProps {
  primarySource?: SourceCitation;
  allSources?: SourceCitation[];
}

export const SourceCard: React.FC<SourceCardProps> = ({ primarySource, allSources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!primarySource && (!allSources || allSources.length === 0)) {
    return null;
  }

  const mainSource = primarySource || (allSources && allSources[0]);

  return (
    <div style={{
      marginTop: '0.75rem',
      padding: '0.625rem 0.875rem',
      backgroundColor: 'var(--bg-surface-subtle)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.8125rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={15} color="var(--color-primary)" />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Source:</span>
          <span className="badge badge-source" style={{ fontFamily: 'var(--font-mono)' }}>
            {mainSource?.filename}
          </span>
          {mainSource?.section && (
            <span style={{ color: 'var(--text-secondary)' }}>
              • Section: <strong>{mainSource.section}</strong>
            </span>
          )}
        </div>

        {allSources && allSources.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600 }}
          >
            {expanded ? (
              <>Less <ChevronUp size={14} /></>
            ) : (
              <>{allSources.length} sources <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>

      {expanded && allSources && allSources.length > 1 && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-strong)', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          {allSources.map((src, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <Bookmark size={13} />
              <span style={{ fontFamily: 'var(--font-mono)' }}>{src.filename}</span>
              <span>— {src.section}</span>
              {src.relevanceScore && (
                <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Relevance: {(src.relevanceScore * 100).toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
