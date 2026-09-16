import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Bookmark, 
  Building2,
  TrendingUp,
  User,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          api.get('/candidates/dashboard'),
          api.get('/candidates/profile')
        ]);
        setStats(statsRes.data.data);
        setProfile(profileRes.data.data);
      } catch (err) {
        console.error('Failed to load candidate dashboard:', err);
        showToast('Error loading dashboard data.', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPLIED': return <span className="badge badge-applied">Applied</span>;
      case 'UNDER_REVIEW': return <span className="badge badge-review">Under Review</span>;
      case 'SHORTLISTED': return <span className="badge badge-shortlist">Shortlisted</span>;
      case 'INTERVIEW': return <span className="badge badge-interview">Interview</span>;
      case 'SELECTED': return <span className="badge badge-selected">Selected</span>;
      case 'REJECTED': return <span className="badge badge-rejected">Rejected</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 20; // baseline for having account
    if (profile.fullName) score += 10;
    if (profile.phone) score += 10;
    if (profile.location) score += 10;
    if (profile.headline) score += 10;
    if (profile.skills) score += 15;
    if (profile.education) score += 10;
    if (profile.resumeFileName) score += 15;
    return Math.min(score, 100);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading your dashboard...</div>;
  }

  const completionPct = calculateProfileCompletion();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Welcome Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.3rem' }}>
            Hello, {profile?.fullName || user.fullName || 'Candidate'} 👋
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Track your job applications, profile completeness, and interview schedules.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/jobs" className="btn btn-primary btn-sm">
            <Briefcase size={16} /> Browse New Jobs
          </Link>
          <Link to="/candidate/profile" className="btn btn-secondary btn-sm">
            <User size={16} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Completion Alert Banner if incomplete */}
      {completionPct < 100 && (
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
              <Sparkles size={18} color="#4F46E5" /> Profile Completion: {completionPct}%
            </div>
            <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${completionPct}%`, height: '100%', background: 'linear-gradient(90deg, #4F46E5, #0EA5E9)', borderRadius: 4 }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.4rem' }}>
              {!profile?.resumeFileName ? 'Upload your PDF resume to unlock instant 1-click applications.' : 'Add your skills and education details to attract recruiter attention.'}
            </div>
          </div>
          <Link to="/candidate/profile" className="btn btn-secondary btn-sm">
            Complete Profile
          </Link>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Applied</div>
            <div className="stat-value">{stats?.totalApplied || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <Briefcase size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Under Review</div>
            <div className="stat-value">{stats?.underReview || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Shortlisted</div>
            <div className="stat-value">{stats?.shortlisted || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Interviews</div>
            <div className="stat-value">{stats?.interview || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ECFEFF', color: '#06B6D4' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Selected / Hired</div>
            <div className="stat-value" style={{ color: '#10B981' }}>{stats?.selected || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <Sparkles size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Saved Bookmarks</div>
            <div className="stat-value">{stats?.savedJobsCount || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F8FAFC', color: '#64748B' }}>
            <Bookmark size={24} />
          </div>
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Job Applications</h3>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>Status updates and recruiter feedback</p>
          </div>
          <Link to="/candidate/applications" className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
            View All ({stats?.totalApplied || 0}) <ArrowRight size={14} />
          </Link>
        </div>

        {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
            <Briefcase size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>You have not applied for any jobs yet</div>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>Explore verified open positions and submit your resume.</p>
            <Link to="/jobs" className="btn btn-primary btn-sm">Browse Openings</Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Recruiter Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <Link to={`/jobs/${app.jobId}`} style={{ fontWeight: 600, color: '#0F172A' }}>
                        {app.jobTitle}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{app.jobLocation}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#4F46E5' }}>{app.companyName}</span>
                    </td>
                    <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}</td>
                    <td>{getStatusBadge(app.status)}</td>
                    <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.825rem', color: app.recruiterNotes ? '#334155' : '#94A3B8' }}>
                        {app.recruiterNotes || 'No notes yet'}
                      </span>
                    </td>
                    <td>
                      <Link to="/candidate/applications" className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}>
                        Track Stage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default CandidateDashboard;
