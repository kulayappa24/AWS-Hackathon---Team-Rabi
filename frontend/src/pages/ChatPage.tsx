import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatService } from '../services/chatService';
import { ChatMessage, ChatSession, FeedbackType } from '../types/chat';
import { ChatMessageItem } from '../components/ChatMessageItem';
import { SuggestedQuestions } from '../components/SuggestedQuestions';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  Send,
  PlusCircle,
  MessageSquare,
  Bot,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionUuid, setCurrentSessionUuid] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    // Handle prefilled query passed from Dashboard
    if (location.state?.prefilledQuestion) {
      handleSendMessage(location.state.prefilledQuestion);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const userSessions = await chatService.getUserSessions();
      setSessions(userSessions);
    } catch {
      // handled
    }
  };

  const handleSelectSession = async (sessionUuid: string) => {
    try {
      setIsLoading(true);
      setCurrentSessionUuid(sessionUuid);
      const details = await chatService.getSessionDetails(sessionUuid);
      setMessages(details.messages || []);
    } catch {
      showToast('Failed to load conversation.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionUuid(null);
    setMessages([]);
    setInputQuery('');
    inputRef.current?.focus();
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery('');

    // Add user message optimistically
    const userMsg: ChatMessage = {
      sender: 'USER',
      content: query,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await chatService.askQuestion(query, currentSessionUuid || undefined);

      if (!currentSessionUuid) {
        setCurrentSessionUuid(response.sessionUuid);
        loadSessions();
      }

      const assistantMsg: ChatMessage = {
        id: response.messageId,
        sender: 'ASSISTANT',
        content: response.answer,
        sourceFile: response.primarySource?.filename,
        sourceSection: response.primarySource?.section,
        confidenceScore: response.confidence,
        isFallback: response.isFallback,
        primarySource: response.primarySource,
        allSources: response.allSources,
        feedback: 'NONE',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      showToast(err.message || 'Error processing question.', 'error');
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ASSISTANT',
          content: 'An unexpected error occurred while communicating with the assistant. Please try again.',
          isFallback: true,
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: number, feedback: 'UP' | 'DOWN') => {
    try {
      await chatService.sendFeedback(messageId, feedback as FeedbackType);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: feedback as FeedbackType } : msg))
      );
      showToast('Thank you for your feedback!', 'success');
    } catch {
      showToast('Failed to record feedback.', 'error');
    }
  };

  return (
    <div className="chat-container">
      {/* Session History Sidebar */}
      <div
        className="chat-sidebar"
        style={{
          width: sidebarOpen ? '280px' : '0px',
          transition: 'width var(--transition-normal)',
          borderRight: sidebarOpen ? '1px solid var(--border-subtle)' : 'none',
          visibility: sidebarOpen ? 'visible' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={handleNewChat}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <PlusCircle size={16} />
            <span>New Conversation</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', marginBottom: '0.25rem' }}>
            Recent Chats
          </div>

          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No previous chats
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {sessions.map((session) => (
                <button
                  key={session.sessionUuid}
                  onClick={() => handleSelectSession(session.sessionUuid)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    backgroundColor: currentSessionUuid === session.sessionUuid ? 'var(--color-primary-light)' : 'transparent',
                    color: currentSessionUuid === session.sessionUuid ? 'var(--color-primary)' : 'var(--text-primary)',
                    fontWeight: currentSessionUuid === session.sessionUuid ? 600 : 400,
                    fontSize: '0.8125rem',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <MessageSquare size={14} style={{ flexShrink: 0 }} />
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
                    {session.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Conversation View */}
      <div className="chat-main">
        {/* Chat Top Bar */}
        <div style={{
          height: '48px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn btn-ghost btn-sm"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              Grounded AI Assistant
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
              <Bot size={12} /> Knowledge Base Active
            </span>
            <button onClick={handleNewChat} className="btn btn-ghost btn-sm" title="Start fresh conversation">
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="chat-messages-area">
          {messages.length === 0 ? (
            <div style={{ maxWidth: '720px', margin: 'auto', width: '100%', textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                marginBottom: '1rem'
              }}>
                <Bot size={32} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                How can I assist your Student Builder journey?
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                Ask anything regarding workshops, Builder Center publishing, AWS accounts, Bedrock, or club rules. Answers are grounded in approved club files with complete source citations.
              </p>

              <SuggestedQuestions onSelect={(q) => handleSendMessage(q)} />
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessageItem
                  key={msg.id || idx}
                  message={msg}
                  onFeedback={handleFeedback}
                />
              ))}

              {isLoading && (
                <div className="message-row assistant">
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'var(--color-primary)'
                  }}>
                    <Bot size={20} />
                  </div>
                  <div className="message-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size={16} text="Searching approved documents & generating grounded response..." />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Form Bar */}
        <div className="chat-input-area">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ maxWidth: '840px', margin: '0 auto' }}
          >
            <div className="chat-input-box">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about workshops, Builder Center, Bedrock, club directory, or rules..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.875rem', borderRadius: 'var(--radius-md)' }}
                disabled={!inputQuery.trim() || isLoading}
                title="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Grounded AI: Verified against official club documentation</span>
              <span>Primary fallback: Shanmukha Sasi Sadineni</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
