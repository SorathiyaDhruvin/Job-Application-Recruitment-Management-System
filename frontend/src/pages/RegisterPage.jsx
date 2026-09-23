import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, User, Building2, Lock, Mail, Phone, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const RegisterPage = () => {
  const [role, setRole] = useState('CANDIDATE'); // 'CANDIDATE' or 'RECRUITER'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters long.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName,
        email,
        password,
        role,
        phone,
        companyName: role === 'RECRUITER' ? companyName : undefined,
        designation: role === 'RECRUITER' ? designation : undefined
      };

      const authData = await register(payload);
      showToast(`Account created successfully! Welcome, ${authData.fullName}!`, 'success');

      if (authData.role === 'RECRUITER') {
        navigate('/recruiter/dashboard', { replace: true });
      } else {
        navigate('/candidate/dashboard', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 140px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2.5rem 1.5rem',
      background: 'radial-gradient(ellipse at top, rgba(26, 53, 87, 0.06), transparent 60%)'
    }}>
      <div style={{ maxWidth: 520, width: '100%' }}>
        
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#FFFFFF', marginBottom: '0.75rem', boxShadow: '0 4px 14px var(--primary-glow)'
          }}>
            <Briefcase size={24} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.35rem' }}>Create Your Account</h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>Join the next-generation recruitment ecosystem</p>
        </div>

        {/* Role Switcher Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#E2E8F0',
          padding: 4,
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            style={{
              padding: '0.65rem',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: role === 'CANDIDATE' ? '#FFFFFF' : 'transparent',
              color: role === 'CANDIDATE' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'CANDIDATE' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            I am a Candidate
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            style={{
              padding: '0.65rem',
              borderRadius: 8,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              background: role === 'RECRUITER' ? '#FFFFFF' : 'transparent',
              color: role === 'RECRUITER' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: role === 'RECRUITER' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            I am a Recruiter
          </button>
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder={role === 'CANDIDATE' ? 'e.g. Dhruvin Sorathiya' : 'e.g. Sarah Jenkins'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Work or Personal Email *</label>
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* Recruiter-specific fields */}
            {role === 'RECRUITER' && (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. TechCorp Global"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Title / Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Lead Talent Partner"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'CANDIDATE' ? 'Candidate' : 'Recruiter'}`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748B' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
