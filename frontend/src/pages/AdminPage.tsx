import React, { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { ClubDocument, DocumentDetail } from '../types/document';
import { useToast } from '../context/ToastContext';

export const AdminPage: React.FC = () => {
  const { showToast } = useToast();

  const [documents, setDocuments] = useState<ClubDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  // Form State
  const [editingDocId, setEditingDocId] = useState<number | null>(null);
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Evaluator Quick Tester State
  const [testQuestion, setTestQuestion] = useState('What time is lunch today and where is judging happening?');
  const [evaluatorResponse, setEvaluatorResponse] = useState<any>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await documentService.getAllDocuments();
      setDocuments(docs);
    } catch (err: any) {
      showToast('Failed to load documents: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (doc: ClubDocument) => {
    try {
      showToast(`Loading ${doc.filename}...`, 'info');
      const detail: DocumentDetail = await documentService.getDocumentDetail(doc.id);
      setEditingDocId(detail.id);
      setFilename(detail.filename);
      setTitle(detail.title || '');
      setContent(detail.content || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast('Could not load document content: ' + err.message, 'error');
    }
  };

  const handleResetForm = () => {
    setEditingDocId(null);
    setFilename('');
    setTitle('');
    setContent('');
    setSyncStatus(null);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filename.trim()) {
      showToast('Please provide a valid filename (e.g. event-day-briefing.md)', 'error');
      return;
    }
    if (!content.trim()) {
      showToast('Document content cannot be empty', 'error');
      return;
    }

    try {
      setIsPublishing(true);
      setSyncStatus('Re-indexing server knowledge base (~60s sync window)...');

      if (editingDocId) {
        await documentService.updateDocument(editingDocId, {
          title: title.trim(),
          content: content.trim(),
        });
        showToast(`Updated & Re-Indexed: ${filename}`, 'success');
      } else {
        await documentService.publishDocument({
          filename: filename.trim(),
          title: title.trim(),
          content: content.trim(),
        });
        showToast(`Published & Re-Indexed: ${filename}`, 'success');
      }

      setSyncStatus('✅ Index rebuilt successfully! Chatbot & Dashboard are synchronized.');
      handleResetForm();
      await fetchDocuments();
    } catch (err: any) {
      showToast('Publish failed: ' + err.message, 'error');
      setSyncStatus('❌ Re-index error: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: number, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"? This will remove it from the AI knowledge index.`)) {
      return;
    }
    try {
      await documentService.deleteDocument(id);
      showToast(`Deleted: ${docName}`, 'success');
      await fetchDocuments();
    } catch (err: any) {
      showToast('Delete failed: ' + err.message, 'error');
    }
  };

  const handleReindexAll = async () => {
    try {
      setIsReindexing(true);
      setSyncStatus('Re-indexing all approved documents...');
      const docs = await documentService.reindexDocuments();
      setDocuments(docs);
      showToast(`All ${docs.length} documents re-indexed successfully!`, 'success');
      setSyncStatus(`✅ Synchronized ${docs.length} documents into the live vector index.`);
    } catch (err: any) {
      showToast('Re-index failed: ' + err.message, 'error');
    } finally {
      setIsReindexing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setContent(text);
      // Auto-extract title from first heading
      const match = text.match(/^#\s+(.*)$/m);
      if (match) {
        setTitle(match[1].trim());
      }
    };
    reader.readAsText(file);
    showToast(`Loaded local file: ${file.name}`, 'info');
  };

  const handleLoadBriefingTemplate = () => {
    setFilename('event-day-briefing.md');
    setTitle('Event Day Briefing — Campus Hackathon');
    setContent(`# Event Day Briefing — Campus Hackathon

## Important Schedule & Room Updates

**Attention All Participants:** Please note the following critical schedule and venue updates for today's hackathon:

### 1. Venue & Room Changes
- **Judging Room**: Judging has officially moved to **Room 204 (Seminar Hall B)**. Please bring your laptops there for final evaluations.
- **Mentorship Zone**: Lab 3 (Ground Floor).

### 2. Schedule Adjustments
- **9:00 AM**: Hackathon Part 2 (30% Knowledge Sync Phase) officially begins.
- **1:30 PM**: **Lunch is delayed** to 1:30 PM (Food Court Area, 2nd Floor).
- **3:30 PM**: Code Freeze & Final Project Submissions.
- **4:00 PM**: Submission Deadline on Builder Center / Portal.
- **4:30 PM**: Final Pitches & Demos in Room 204.
- **6:00 PM**: Award Ceremony & Results Announcement.

---

## Evaluation Criteria & Port 8080 API
- Every team must expose the \`POST /ask\` endpoint on port **8080** (\`http://<your-machine-ip>:8080/ask\`).
- Grounded AI response citing source files is mandatory.
- The 3 smoke test questions will be evaluated directly.

---

## Campus Contact & Support
If you encounter any issues with Wi-Fi, port forwarding, or rules:
- **Shanmukha Sasi Sadineni**, AWS Student Builder Group Leader
  - **Email**: sadinenisasi@gmail.com
  - **Phone**: 7396025334
`);
    showToast('Loaded Event Day Briefing template into editor.', 'info');
  };

  const handleTestEvaluatorApi = async () => {
    if (!testQuestion.trim()) return;
    try {
      setIsEvaluating(true);
      const res = await documentService.evaluateAsk(testQuestion.trim());
      setEvaluatorResponse(res);
      showToast('Evaluator POST /ask returned 200 OK with grounded answer!', 'success');
    } catch (err: any) {
      showToast('Evaluator API test failed: ' + err.message, 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#FF9900', color: '#131921', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              ADMIN CONSOLE · 30% SYNC
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Live Knowledge Base Manager</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>
            Club Document Publishing & Re-Index Engine
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Publish changes or upload documents. Content is searchable by the AI chatbot within ~60 seconds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleReindexAll}
            disabled={isReindexing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px' }}
          >
            {isReindexing ? '⚡ Re-indexing...' : '🔄 Re-index All Docs'}
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncStatus && (
        <div style={{
          background: syncStatus.includes('✅') ? '#ECFDF5' : (syncStatus.includes('❌') ? '#FEF2F2' : '#EFF6FF'),
          border: `1px solid ${syncStatus.includes('✅') ? '#10B981' : (syncStatus.includes('❌') ? '#EF4444' : '#3B82F6')}`,
          color: syncStatus.includes('✅') ? '#065F46' : (syncStatus.includes('❌') ? '#991B1B' : '#1E40AF'),
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {syncStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Editor Card */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
              {editingDocId ? `✏️ Edit & Re-Index: ${filename}` : '📝 Add or Publish Document'}
            </h2>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleLoadBriefingTemplate}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '12px' }}
              >
                📄 Load Event Day Briefing
              </button>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', fontSize: '12px' }}>
                📁 Upload .md File
                <input
                  type="file"
                  accept=".md,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
              {editingDocId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handlePublish}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Document Filename *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. event-day-briefing.md"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  disabled={!!editingDocId}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                  Document Title (Optional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Event Day Briefing — Campus Hackathon"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Markdown Content * (Searchable in Chatbot upon Publish)
              </label>
              <textarea
                className="input-field"
                rows={12}
                placeholder="Paste Markdown document content with # and ## headers..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', lineHeight: '1.6' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isPublishing}
                style={{ padding: '10px 24px', fontWeight: '700' }}
              >
                {isPublishing ? '⚡ Publishing & Indexing...' : (editingDocId ? '🔄 Update & Re-Index' : '🚀 Publish Document')}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Documents Table */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>
              📚 Indexed Knowledge Base Documents ({documents.length})
            </h2>
            <span style={{ fontSize: '12px', color: '#10B981', background: '#ECFDF5', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
              Auto-Synced Real Time
            </span>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Loading documents...
            </div>
          ) : documents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              No documents indexed yet. Use the form above to publish your first document!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px' }}>Filename</th>
                    <th style={{ padding: '10px' }}>Title</th>
                    <th style={{ padding: '10px' }}>Chunks</th>
                    <th style={{ padding: '10px' }}>Size</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '12px 10px', fontWeight: '600', color: 'var(--color-accent)' }}>
                        📄 {doc.filename}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-primary)' }}>
                        {doc.title || doc.filename}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-secondary)' }}>
                        <span style={{ background: 'var(--bg-surface-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                          {doc.totalChunks} chunks
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>
                        {(doc.fileSizeBytes / 1024).toFixed(1)} KB
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          {doc.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEdit(doc)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '12px' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id, doc.filename)}
                            className="btn btn-sm"
                            style={{ fontSize: '12px', color: '#EF4444', borderColor: '#FCA5A5' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Evaluator API Quick Tester (POST /ask on port 8080) */}
        <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid #FF9900', borderRadius: '12px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ background: '#232F3E', color: '#FF9900', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                EVALUATOR API · PORT 8080
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginTop: '6px' }}>
                Interactive POST /ask Tester (Strict Evaluator Contract)
              </h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Top-Level Unwrapped JSON Contract
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <input
              type="text"
              className="input-field"
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="Enter test question..."
              style={{ flex: 1 }}
            />
            <button
              onClick={handleTestEvaluatorApi}
              disabled={isEvaluating}
              className="btn btn-primary"
              style={{ padding: '0 20px', whiteSpace: 'nowrap' }}
            >
              {isEvaluating ? 'Testing...' : 'Test POST /ask'}
            </button>
          </div>

          {evaluatorResponse && (
            <div style={{ background: '#1E293B', color: '#F8FAFC', padding: '16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto' }}>
              <div style={{ color: '#10B981', fontWeight: 'bold', marginBottom: '8px' }}>
                // HTTP 200 OK Response (Exact Hackathon JSON Schema):
              </div>
              <pre>{JSON.stringify(evaluatorResponse, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
