import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AwsLogo } from './AwsLogo';
import { MessageSquare, LayoutDashboard, User, LogOut, LogIn, UserPlus, PlayCircle, Settings } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }}>
            <AwsLogo height={32} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                Student Builder Groups
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Club Member Portal
              </span>
            </div>
          </Link>

          <nav className="nav-links">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Dashboard
                </Link>
                <Link
                  to="/chat"
                  className={`nav-link ${isActive('/chat') ? 'active' : ''}`}
                >
                  <MessageSquare size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  AI Chat
                </Link>
                <Link
                  to="/smoke-test"
                  className={`nav-link ${isActive('/smoke-test') ? 'active' : ''}`}
                  title="Official 3 Benchmark Questions"
                >
                  <PlayCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#FF9900' }} />
                  Smoke Tests
                </Link>
                <Link
                  to="/admin"
                  className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
                  title="Document Publishing & Re-Index Console"
                >
                  <Settings size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Admin
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
                >
                  <User size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  {user?.name?.split(' ')[0] || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost btn-sm"
                  title="Sign Out"
                  style={{ color: '#D1D5DB' }}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/smoke-test"
                  className={`nav-link ${isActive('/smoke-test') ? 'active' : ''}`}
                  title="Official 3 Benchmark Questions"
                >
                  <PlayCircle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px', color: '#FF9900' }} />
                  Smoke Tests
                </Link>
                <Link to="/login" className="btn btn-ghost btn-sm" style={{ color: '#FFFFFF' }}>
                  <LogIn size={16} />
                  <span>Login</span>
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  <UserPlus size={16} />
                  <span>Join Club</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
