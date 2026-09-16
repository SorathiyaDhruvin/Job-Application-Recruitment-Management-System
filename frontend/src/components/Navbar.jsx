import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  PlusCircle, 
  FileText, 
  Bookmark, 
  Building2, 
  ShieldCheck, 
  ChevronDown,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isCandidate, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Brand Logo */}
      <Link to="/" className="nav-brand" onClick={() => setMobileMenuOpen(false)}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'linear-gradient(135deg, #4F46E5 0%, #0EA5E9 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)'
        }}>
          <Briefcase size={20} />
        </div>
        <span>Recruit<span style={{ color: '#0EA5E9' }}>Pro</span></span>
      </Link>

      {/* Center Nav Links */}
      <ul className="nav-links" style={{ display: mobileMenuOpen ? 'flex' : undefined }}>
        <li>
          <Link to="/jobs" className={`nav-link ${isActive('/jobs') ? 'active' : ''}`}>
            Find Jobs
          </Link>
        </li>
        <li>
          <Link to="/companies" className={`nav-link ${isActive('/companies') ? 'active' : ''}`}>
            Companies
          </Link>
        </li>

        {isAuthenticated && isCandidate && (
          <>
            <li>
              <Link to="/candidate/dashboard" className={`nav-link ${isActive('/candidate/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/candidate/applications" className={`nav-link ${isActive('/candidate/applications') ? 'active' : ''}`}>
                My Applications
              </Link>
            </li>
          </>
        )}

        {isAuthenticated && isRecruiter && (
          <>
            <li>
              <Link to="/recruiter/dashboard" className={`nav-link ${isActive('/recruiter/dashboard') ? 'active' : ''}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/recruiter/jobs" className={`nav-link ${isActive('/recruiter/jobs') ? 'active' : ''}`}>
                Manage Jobs
              </Link>
            </li>
          </>
        )}

        {isAuthenticated && isAdmin && (
          <li>
            <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              Admin Panel
            </Link>
          </li>
        )}
      </ul>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.4rem 0.8rem', gap: '0.6rem', borderRadius: 'var(--radius-full)' }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}>
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.fullName || user.email}
              </span>
              <ChevronDown size={14} color="#64748B" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: 240,
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-light)',
                  padding: '0.5rem',
                  zIndex: 100,
                  animation: 'scaleIn 0.15s ease-out'
                }}
              >
                <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-subtle)', marginBottom: '0.3rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>{user.fullName}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{user.email}</div>
                  <span className={`badge ${
                    isCandidate ? 'badge-applied' : isRecruiter ? 'badge-shortlist' : 'badge-interview'
                  }`} style={{ marginTop: '0.4rem', display: 'inline-block' }}>
                    {user.role}
                  </span>
                </div>

                {isCandidate && (
                  <>
                    <Link
                      to="/candidate/profile"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: 6, color: '#334155', fontSize: '0.875rem' }}
                      className="btn-ghost"
                    >
                      <User size={16} /> Candidate Profile
                    </Link>
                    <Link
                      to="/candidate/saved-jobs"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: 6, color: '#334155', fontSize: '0.875rem' }}
                      className="btn-ghost"
                    >
                      <Bookmark size={16} /> Saved Jobs
                    </Link>
                  </>
                )}

                {isRecruiter && (
                  <>
                    <Link
                      to="/recruiter/jobs/new"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: 6, color: '#334155', fontSize: '0.875rem' }}
                      className="btn-ghost"
                    >
                      <PlusCircle size={16} /> Post New Job
                    </Link>
                    <Link
                      to="/recruiter/company"
                      onClick={() => setDropdownOpen(false)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: 6, color: '#334155', fontSize: '0.875rem' }}
                      className="btn-ghost"
                    >
                      <Building2 size={16} /> Company Settings
                    </Link>
                  </>
                )}

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.8rem', borderRadius: 6, color: '#334155', fontSize: '0.875rem' }}
                    className="btn-ghost"
                  >
                    <ShieldCheck size={16} /> Admin Console
                  </Link>
                )}

                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '0.3rem 0' }} />
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.8rem',
                    borderRadius: 6,
                    color: '#EF4444',
                    background: 'none',
                    border: 'none',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                  className="btn-ghost"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4
          }}
          className="mobile-toggle"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
