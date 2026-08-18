import React, { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { SmokeTestSuite } from '../types/document';
import { useToast } from '../context/ToastContext';

export const SmokeTestPage: React.FC = () => {
  const { showToast } = useToast();
  const [suite, setSuite] = useState<SmokeTestSuite | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    try {
      setIsRunning(true);
      const res = await documentService.runSmokeTests();
      setSuite(res);
      if (res.allPassed) {
        showToast(`All ${res.totalTests} Smoke Tests Passed 100%!`, 'success');
      } else {
        showToast(`${res.passedTests}/${res.totalTests} tests passed.`, 'warning');
      }
    } catch (err: any) {
      showToast('Failed to run smoke tests: ' + err.message, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#232F3E', color: '#FF9900', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
              OFFICIAL BENCHMARK RUNNER
            </span>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>09-smoke-test-questions.md</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: '8px', color: 'var(--text-primary)' }}>
            Grounded AI Smoke Test Suite
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
            Evaluates accuracy, source grounding, and latency across the 3 official hackathon benchmark questions.
          </p>
        </div>

        <button
          onClick={runTests}
          disabled={isRunning}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontWeight: '700' }}
        >
          {isRunning ? '⏳ Running 3 Tests...' : '▶️ Run Smoke Tests'}
        </button>
      </div>

      {/* Summary Stats Cards */}
      {suite && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Overall Status</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: suite.allPassed ? '#10B981' : '#EF4444' }}>
              {suite.allPassed ? '✅ 100% PASSED' : '⚠️ ISSUES DETECTED'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {suite.passedTests} of {suite.totalTests} tests succeeded
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Total Execution Time</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {suite.totalDurationMs} ms
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Avg {(suite.totalDurationMs / suite.totalTests).toFixed(0)} ms / query
            </div>
          </div>

          <div className="card" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '20px', borderRadius: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Port 8080 Evaluator</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#FF9900' }}>
              POST /ask
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Unwrapped JSON Contract Active
            </div>
          </div>
        </div>
      )}

      {/* Tests Breakdown */}
      {isRunning ? (
        <div className="card" style={{ padding: '60px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Executing Benchmark Queries...</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Retrieving vector embeddings and evaluating grounded citations.</p>
        </div>
      ) : suite ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {suite.tests.map((test, idx) => (
            <div
              key={test.id}
              className="card"
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${test.passed ? '#10B981' : '#EF4444'}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: test.passed ? '0 2px 8px rgba(16, 185, 129, 0.08)' : '0 2px 8px rgba(239, 68, 68, 0.08)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    background: test.passed ? '#ECFDF5' : '#FEF2F2',
                    color: test.passed ? '#059669' : '#DC2626',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '800'
                  }}>
                    {test.passed ? '✓ PASSED' : '✗ FAILED'}
                  </span>
                  <span style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-primary)' }}>
                    Test #{idx + 1}: {test.name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>⏱️ <strong>{test.latencyMs} ms</strong></span>
                  <span>🎯 Score: <strong>{(test.score * 100).toFixed(0)}%</strong></span>
                </div>
              </div>

              {/* Question */}
              <div style={{ background: 'var(--bg-surface-subtle)', padding: '12px 16px', borderRadius: '8px', marginBottom: '14px', fontSize: '14px' }}>
                <span style={{ fontWeight: '700', color: 'var(--text-secondary)', marginRight: '8px' }}>Q:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>"{test.question}"</span>
              </div>

              {/* Source Document Match */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px', fontSize: '13px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>EXPECTED DOCUMENT</span>
                  <strong style={{ color: '#2563EB' }}>📄 {test.expectedDocument}</strong>
                </div>

                <div style={{ background: test.passed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${test.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', display: 'block' }}>ACTUAL RETRIEVED DOCUMENT</span>
                  <strong style={{ color: test.passed ? '#059669' : '#DC2626' }}>📄 {test.actualDocument}</strong>
                </div>
              </div>

              {/* Generated Answer */}
              <div style={{ background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', padding: '14px 16px', borderRadius: '8px', fontSize: '13px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: '700', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Grounded AI Answer:
                </div>
                <div style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
                  {test.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Evaluator Curl Command helper */}
      <div className="card" style={{ marginTop: '32px', background: '#1E293B', color: '#F8FAFC', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#FF9900', marginBottom: '8px' }}>
          💡 Local Evaluator API Quick Command for Judges
        </h3>
        <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '12px' }}>
          Judges on the event Wi-Fi can run this curl command directly against your server on port 8080:
        </p>
        <div style={{ background: '#0F172A', padding: '12px 16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '12px', overflowX: 'auto', color: '#38BDF8' }}>
          curl -X POST http://localhost:8080/ask \<br />
          &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
          &nbsp;&nbsp;-d '&#123;"question": "What time is lunch today and where is judging happening?"&#125;'
        </div>
      </div>
    </div>
  );
};
