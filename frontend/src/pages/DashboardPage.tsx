import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { documentService } from '../services/documentService';
import { chatService } from '../services/chatService';
import { ClubDocument } from '../types/document';
import { ChatSession } from '../types/chat';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  MessageSquare,
  BookOpen,
  FileText,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Users,
  AlertTriangle,
  PlayCircle,
  Settings
} from 'lucide-react';
import { SUGGESTED_STARTER_QUESTIONS } from '../components/SuggestedQuestions';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  useEffect(() => {
    loadDashboardData();

    // Auto-poll documents every 15s for instant ~60s sync requirement
    const interval = setInterval(async () => {
      try {
        const docs = await documentService.getAllDocuments();
        setDocuments(docs);
        setLastSyncTime(new Date());
      } catch {
        // silent background sync
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [docs, chatSessions] = await Promise.all([
        documentService.getAllDocuments(),
        chatService.getUserSessions()
      ]);
      setDocuments(docs);
      setSessions(chatSessions);
      setLastSyncTime(new Date());
    } catch {
      // handled by api client
    } finally {
      setLoading(false);
    }
  };

  const handleReindex = async () => {
    try {
      setReindexing(true);
      const updated = await documentService.reindexDocuments();
      setDocuments(updated);
      setLastSyncTime(new Date());
    } finally {
      setReindexing(false);
    }
  };

  const handleAskQuestion = (question: string) => {
    navigate('/chat', { state: { prefilledQuestion: question } });
  };

  const hasEventBriefing = documents.some(d => d.filename.includes('event-day-briefing'));

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <LoadingSpinner text="Loading your member dashboard..." />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1140px', margin: '0 auto' }}>
      
      {/* Event Day Alert Banner */}
      {hasEventBriefing && (
        <div style={{
          background: 'linear-gradient(90deg, #FEF3C7 0%, #FDE68A 100%)',
          border: '1px solid #F59E0B',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 10px rgba(245, 158, 11, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#D97706', color: '#FFF', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, color: '#92400E', fontSize: '15px' }}>
                📢 EVENT DAY UPDATE: Judging Moved to Room 204 & Lunch Delayed to 1:30 PM
              </div>
              <div style={{ color: '#78350F', fontSize: '13px', marginTop: '2px' }}>
                Latest schedule briefing is live in the AI index. Ask the chatbot for real-time venue and timeline details!
              </div>
            </div>
          </div>

          <button
            onClick={() => handleAskQuestion('What time is lunch today and where is judging happening?')}
            className="btn"
            style={{ background: '#B45309', color: '#FFF', fontWeight: 'bold', fontSize: '13px', padding: '8px 16px', borderRadius: '6px' }}
          >
            Ask AI About Schedule →
          </button>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-surface-elevated) 100%)',
        border: '1px solid var(--border-strong)',
        padding: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-primary">
                <ShieldCheck size={13} /> Logged In as {user?.role?.replace('ROLE_', '') || 'MEMBER'}
              </span>
              <span style={{ fontSize: '12px', color: '#10B981', background: '#ECFDF5', padding: '3px 8px', borderRadius: '4px', fontWeight: '600' }}>
                ⚡ Auto-Sync Active ({lastSyncTime.toLocaleTimeString()})
              </span>
            </div>
            <h1 style={{ fontSize: '1.875rem', marginBottom: '0.5rem' }}>
              Welcome back, {user?.name}!
            </h1>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', fontSize: '0.9375rem' }}>
              Your campus portal gives you direct access to grounded AI assistance based on official club guides, real-time schedule briefings, and event logistics.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/smoke-test" className="btn btn-secondary">
              <PlayCircle size={17} color="#FF9900" />
              <span>Smoke Test Runner</span>
            </Link>
            <Link to="/admin" className="btn btn-secondary">
              <Settings size={17} />
              <span>Admin Console</span>
            </Link>
            <Link to="/chat" className="btn btn-primary">
              <MessageSquare size={17} />
              <span>Launch AI Chat</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Suggested Inquiries (Includes Official Benchmark Questions) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.25rem' }}>Official Inquiries & Benchmark Questions</h2>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to test live grounded AI responses</span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '0.75rem'
        }}>
          {SUGGESTED_STARTER_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="card card-hover"
              style={{
                textAlign: 'left',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-primary)',
                fontSize: '0.875rem',
                borderLeft: idx === 0 ? '3px solid #FF9900' : '1px solid var(--border-subtle)'
              }}
            >
              <span>{q}</span>
              <ArrowRight size={15} color="var(--color-primary)" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Recent Conversations & Club Knowledge Base */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Club Knowledge Base */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>Club Knowledge Base ({documents.length} Guides)</h3>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleReindex}
                disabled={reindexing}
                className="btn btn-ghost btn-sm"
                title="Re-index document store"
              >
                <RefreshCw size={14} style={{ animation: reindexing ? 'spin 1s linear infinite' : 'none' }} />
                <span>{reindexing ? 'Indexing...' : 'Re-index'}</span>
              </button>
              <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }}>
                + Add / Edit
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {documents.map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: doc.filename.includes('event-day-briefing') ? 'rgba(255, 153, 0, 0.08)' : 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  border: doc.filename.includes('event-day-briefing') ? '1px solid #FF9900' : '1px solid var(--border-subtle)',
                  fontSize: '0.8125rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                  <FileText size={15} color={doc.filename.includes('event-day-briefing') ? '#FF9900' : 'var(--color-primary)'} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.title || doc.filename}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    ({doc.filename})
                  </span>
                </div>
                <span className="badge badge-success" style={{ flexShrink: 0, fontSize: '0.7rem' }}>
                  {doc.totalChunks} chunks
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--color-primary)" />
              <h3 style={{ fontSize: '1.1rem' }}>Recent Conversations</h3>
            </div>
            <Link to="/chat" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)' }}>
              New Chat
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
              <p style={{ fontSize: '0.875rem' }}>No conversations yet.</p>
              <Link to="/chat" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
                Start Your First Chat
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {sessions.slice(0, 5).map((session) => (
                <Link
                  key={session.sessionUuid}
                  to={`/chat?session=${session.sessionUuid}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                    <MessageSquare size={14} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {session.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {session.messages?.length || 0} messages
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Club Links & Evaluator Helper */}
      <div className="card" style={{
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        padding: '1.25rem 1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              Primary Campus Contact: Shanmukha Sasi Sadineni (Leader)
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              sadinenisasi@gmail.com · 7396025334
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/smoke-test" className="btn btn-secondary btn-sm">
            <span>Smoke Tests</span>
          </Link>
          <a
            href="https://builder.aws.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-sm"
          >
            <span>AWS Builder Center</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
