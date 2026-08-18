import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, BookOpen, ArrowRight, Calendar, Users, Cpu } from 'lucide-react';
import { AwsLogo } from '../components/AwsLogo';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-app) 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '4.5rem 0 3.5rem 0'
      }}>
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span className="badge badge-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}>
                <Cpu size={14} /> AWS Student Builder Groups · Campus Chapter
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <AwsLogo height={50} />
            </div>

            <h1 style={{ fontSize: '2.75rem', marginBottom: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Student Builder Groups <br />
              <span style={{ color: 'var(--color-primary)' }}>Club Member Portal</span>
            </h1>

            <p style={{ fontSize: '1.125rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              The central hub for campus Student Builders. Access club documentation, prepare for workshops, publish on AWS Builder Center, and ask our grounded AI assistant questions directly from approved club guides.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/chat" className="btn btn-primary btn-lg">
                    <MessageSquare size={18} />
                    <span>Open AI Chat</span>
                  </Link>
                  <Link to="/dashboard" className="btn btn-secondary btn-lg">
                    <span>Member Dashboard</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg">
                    <span>Join the Club</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    <span>Member Login</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Built for Student Builders</h2>
          <p>Everything you need to learn, build, and publish on AWS with your campus peers.</p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card card-hover">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#B45309', marginBottom: '1rem' }}>
              <MessageSquare size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Grounded AI Assistant</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Answers strictly from verified club documents. Every response cites the exact filename and section heading, with a safe fallback to chapter leadership for out-of-scope inquiries.
            </p>
          </div>

          <div className="card card-hover">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669', marginBottom: '1rem' }}>
              <BookOpen size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Club Knowledge Base</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Indexed resources on onboarding FAQs, AWS account setup, Builder Center guidelines, Amazon Bedrock starter notes, club rules, workshop schedules, and serverless patterns.
            </p>
          </div>

          <div className="card card-hover">
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706', marginBottom: '1rem' }}>
              <Cpu size={22} />
            </div>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.2rem' }}>Builder Center Publishing</h3>
            <p style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}>
              Guidelines and support for campus student builders to write, submit, and publish cloud projects and articles on AWS Builder Center.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership & Weekly Meetings Info */}
      <section className="container">
        <div className="card" style={{
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-strong)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Calendar size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>General Meetings</span>
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>Wednesdays at 6:00 PM</h3>
            <p style={{ fontSize: '0.9375rem' }}>
              CS Building, Room 101. Bring your laptop and AWS account. All students with an active AWS account (Free Tier is fine) are welcome.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Users size={18} color="var(--color-primary)" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Chapter Leadership</span>
            </div>
            <h3 style={{ marginBottom: '0.25rem' }}>Shanmukha Sasi Sadineni</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              AWS Student Builder Group Leader
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              Email: <code>sadinenisasi@gmail.com</code> · Phone: <code>7396025334</code>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
