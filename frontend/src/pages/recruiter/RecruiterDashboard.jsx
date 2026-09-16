import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  Calendar, 
  Sparkles, 
  PlusCircle, 
  Eye, 
  FileText, 
  ArrowRight,
  Clock,
  Building2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, profileRes] = await Promise.all([
          api.get('/recruiters/dashboard'),
          api.get('/recruiters/profile')
        ]);
        setStats(statsRes.data.data);
        setProfile(profileRes.data.data);
      } catch (err) {
        console.error(err);
        showToast('Error loading recruiter metrics.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading recruiter pipeline...</div>;
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Recruiter Dashboard</h1>
            {profile?.companyName && (
              <span className="badge" style={{ background: '#EEF2FF', color: '#4F46E5', fontSize: '0.8rem' }}>
                <Building2 size={12} style={{ marginRight: 4 }} /> {profile.companyName}
              </span>
            )}
          </div>
          <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
            Welcome back, {profile?.fullName || user.fullName}. Manage your hiring campaigns and applicant evaluations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">
            <PlusCircle size={16} /> Post New Position
          </Link>
          <Link to="/recruiter/jobs" className="btn btn-secondary btn-sm">
            <Briefcase size={16} /> Manage Openings
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Jobs Posted</div>
            <div className="stat-value">{stats?.totalJobs || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <Briefcase size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Active Openings</div>
            <div className="stat-value" style={{ color: '#10B981' }}>{stats?.activeJobs || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Candidates</div>
            <div className="stat-value">{stats?.totalApplicants || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">In Interview</div>
            <div className="stat-value" style={{ color: '#0EA5E9' }}>{stats?.interview || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F0F9FF', color: '#0EA5E9' }}>
            <Calendar size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Shortlisted</div>
            <div className="stat-value">{stats?.shortlisted || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <UserCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Offers / Hired</div>
            <div className="stat-value" style={{ color: '#10B981' }}>{stats?.selected || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Grid: Recent Applications & Active Jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Recent Applicants */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Candidate Applications</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Latest submissions across your posted jobs</p>
            </div>
            <Link to="/recruiter/applicants" className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
              View All Pipeline <ArrowRight size={14} />
            </Link>
          </div>

          {!stats?.recentApplications || stats.recentApplications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
              <Users size={36} color="#CBD5E1" style={{ margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>No candidate applications yet</div>
              <p style={{ fontSize: '0.85rem' }}>Candidates will appear here as soon as they submit applications.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Applied Position</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentApplications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0F172A' }}>{app.candidateName || 'Anonymous'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{app.candidateEmail}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{app.jobTitle}</div>
                      </td>
                      <td>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}</td>
                      <td>{getStatusBadge(app.status)}</td>
                      <td>
                        <Link
                          to={`/recruiter/jobs/${app.jobId}/applicants`}
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                        >
                          Review &amp; Status
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Posted Jobs List */}
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Your Job Postings</h3>
            <Link to="/recruiter/jobs/new" style={{ fontSize: '0.8rem', color: '#4F46E5', fontWeight: 600 }}>
              + Post Job
            </Link>
          </div>

          {!stats?.recentJobs || stats.recentJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#64748B' }}>
              <Briefcase size={32} color="#CBD5E1" style={{ margin: '0 auto 0.5rem' }} />
              <p style={{ fontSize: '0.85rem' }}>You haven't posted any jobs yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats.recentJobs.map((job) => (
                <div
                  key={job.id}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #E2E8F0',
                    background: '#F8FAFC',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                      <Link to={`/jobs/${job.id}`} style={{ color: '#0F172A' }}>{job.title}</Link>
                    </h4>
                    <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>{job.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{job.jobType.replace('_', ' ')}</span>
                    <span style={{ fontWeight: 600, color: '#4F46E5' }}>{job.applicantCount} applicants</span>
                  </div>
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '0.5rem', marginTop: '0.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <Link to={`/recruiter/jobs/${job.id}/applicants`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      View Candidates
                    </Link>
                    <Link to={`/recruiter/jobs/${job.id}/edit`} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default RecruiterDashboard;
