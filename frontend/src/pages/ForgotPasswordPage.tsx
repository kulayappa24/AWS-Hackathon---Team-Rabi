import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Alert } from '../components/Alert';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { KeyRound, ArrowLeft, MailCheck, Mail, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await authService.forgotPassword({ email });
      setSentEmail(email);
      setIsSent(true);

      const token = res.data?.token;
      if (token) {
        setResetToken(token);
        const url = window.location.origin + window.location.pathname + '#/reset-password?token=' + token;
        setResetUrl(url);
      }
      showToast('Password reset link generated and dispatched!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!resetUrl) return;
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    showToast('Reset link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNavigateToReset = () => {
    if (resetToken) {
      navigate(`/reset-password?token=${resetToken}`);
    }
  };

  const handleResend = () => {
    setIsSent(false);
    setEmail(sentEmail);
    setResetToken(null);
    setResetUrl(null);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      flex: 1
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
        
        {isSent ? (
          /* Email Dispatched & Direct Reset View */
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              color: 'var(--color-success)',
              marginBottom: '1.25rem'
            }}>
              <MailCheck size={32} />
            </div>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Password Reset Dispatched
            </h2>

            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
              We have processed the password reset request for: <br/>
              <strong style={{ color: 'var(--color-primary)', wordBreak: 'break-all' }}>{sentEmail}</strong>
            </p>

            {/* Direct One-Click Reset Card (Works instantly across all environments) */}
            {resetToken && (
              <div style={{
                width: '100%',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 153, 0, 0.08)',
                border: '1px solid #FF9900',
                borderRadius: '10px',
                textAlign: 'left',
                marginBottom: '1.5rem',
                boxShadow: '0 2px 8px rgba(255, 153, 0, 0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '13px', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ⚡ Instant Password Reset Link
                  </span>
                  <span style={{ fontSize: '11px', background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    Active (30 Mins)
                  </span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: '1.4' }}>
                  Click the button below to immediately set your new password without waiting for inbox delivery:
                </p>

                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleNavigateToReset}
                    className="btn btn-primary"
                    style={{ flex: 1, justifyContent: 'center', fontWeight: 'bold', fontSize: '13px', padding: '10px 16px' }}
                  >
                    <span>Proceed to Reset Password</span>
                    <ExternalLink size={15} />
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px', padding: '10px 14px' }}
                    title="Copy reset link to clipboard"
                  >
                    {copied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              textAlign: 'left',
              marginBottom: '1.5rem',
              width: '100%'
            }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>
                ✉️ Email Delivery Information:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <li>Email dispatched via <strong>Amazon SES SDK (AWS us-east-1)</strong>.</li>
                <li>Check your verified campus inbox (including Spam/Junk folders).</li>
                <li>In AWS Sandbox mode, use the direct reset button above for instant testing.</li>
              </ul>
            </div>

            <button
              onClick={handleResend}
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center', marginBottom: '1rem' }}
            >
              <RefreshCw size={16} />
              <span>Send to a different email</span>
            </button>

            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
              <ArrowLeft size={16} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          /* Input Form View */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                marginBottom: '1rem'
              }}>
                <KeyRound size={24} />
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Reset Password</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Enter your registered campus email address and we'll dispatch your password reset link.
              </p>
            </div>

            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="forgotEmail">Registered Campus Email</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="forgotEmail"
                    type="email"
                    className="form-input"
                    placeholder="name@campus.edu"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (error) setError(null); }}
                    disabled={isSubmitting}
                    required
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Mail
                    size={16}
                    style={{
                      position: 'absolute',
                      left: '0.875rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                      pointerEvents: 'none'
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size={18} text="Sending Reset Link..." />
                ) : (
                  <>
                    <MailCheck size={18} />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600 }}>
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
