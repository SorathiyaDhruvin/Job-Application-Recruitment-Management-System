import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Briefcase, 
  Building2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'jobs' | 'companies'
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // User filter
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes, jobsRes, compRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/jobs'),
        api.get('/admin/companies')
      ]);
      setStats(statsRes.data.data);
      setUsersList(usersRes.data.data || []);
      setJobsList(jobsRes.data.data || []);
      setCompaniesList(compRes.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load admin management data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-status`);
      showToast('User activation status updated.', 'success');
      setUsersList((prev) => prev.map((u) => (u.id === userId ? { ...u, active: res.data.data.active } : u)));
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot update user status.', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) {
      return;
    }
    try {
      await api.delete(`/admin/users/${userId}`);
      showToast('User deleted from platform.', 'success');
      setUsersList((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Cannot delete user.', 'error');
    }
  };

  const handleJobStatusChange = async (jobId, newStatus) => {
    try {
      await api.patch(`/admin/jobs/${jobId}/status?status=${newStatus}`);
      showToast(`Job status changed to ${newStatus}.`, 'success');
      setJobsList((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
    } catch (err) {
      showToast('Failed to update job status.', 'error');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Delete this job listing permanently?')) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      showToast('Job listing deleted.', 'success');
      setJobsList((prev) => prev.filter((j) => j.id !== jobId));
      setStats((prev) => ({ ...prev, totalJobs: prev.totalJobs - 1 }));
    } catch (err) {
      showToast('Failed to delete job.', 'error');
    }
  };

  const handleToggleCompanyVerify = async (companyId) => {
    try {
      const res = await api.patch(`/admin/companies/${companyId}/toggle-verify`);
      showToast('Company verification updated.', 'success');
      setCompaniesList((prev) => prev.map((c) => (c.id === companyId ? { ...c, verified: res.data.data.verified } : c)));
    } catch (err) {
      showToast('Failed to update company verification.', 'error');
    }
  };

  const filteredUsers = usersList.filter((u) => {
    if (userRoleFilter === 'ALL') return true;
    return u.role === userRoleFilter;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading platform administration...</div>;
  }

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Admin Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Platform Administration</h1>
            <span className="badge" style={{ background: '#F3E8FF', color: '#7E22CE', fontWeight: 700 }}>
              <ShieldCheck size={14} style={{ marginRight: 4 }} /> Super Admin
            </span>
          </div>
          <p style={{ color: '#64748B' }}>Complete control over users, job postings, companies, and platform analytics.</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#EFF6FF', color: '#3B82F6' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Candidates</div>
            <div className="stat-value">{stats?.totalCandidates || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>
            <UserCheck size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Recruiters</div>
            <div className="stat-value">{stats?.totalRecruiters || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F0F9FF', color: '#0EA5E9' }}>
            <Briefcase size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Companies</div>
            <div className="stat-value">{stats?.totalCompanies || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#FFFBEB', color: '#F59E0B' }}>
            <Building2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Jobs</div>
            <div className="stat-value">{stats?.totalJobs || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ECFDF5', color: '#10B981' }}>
            <Briefcase size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Applications</div>
            <div className="stat-value" style={{ color: '#4F46E5' }}>{stats?.totalApplications || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
            <FileText size={24} />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '2rem'
      }}>
        {[
          { id: 'overview', label: 'Platform Overview' },
          { id: 'users', label: `User Management (${usersList.length})` },
          { id: 'jobs', label: `Job Moderation (${jobsList.length})` },
          { id: 'companies', label: `Company Verification (${companiesList.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: 'transparent',
              fontWeight: 700,
              fontSize: '0.925rem',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--primary)' : '#64748B',
              borderBottom: activeTab === tab.id ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Recent Users */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Registrations</h3>
              <button onClick={() => setActiveTab('users')} className="btn btn-ghost btn-sm">View All &rarr;</button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.slice(0, 5).map((u) => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.fullName || u.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'CANDIDATE' ? 'badge-applied' : u.role === 'RECRUITER' ? 'badge-shortlist' : 'badge-tag'}`} style={{ fontSize: '0.7rem' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.active ? 'badge-active' : 'badge-closed'}`} style={{ fontSize: '0.7rem' }}>
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Job Postings</h3>
              <button onClick={() => setActiveTab('jobs')} className="btn btn-ghost btn-sm">View All &rarr;</button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobsList.slice(0, 5).map((j) => (
                    <tr key={j.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{j.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{j.location}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#4F46E5', fontSize: '0.85rem' }}>{j.companyName}</span>
                      </td>
                      <td>
                        <span className={`badge ${j.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}`} style={{ fontSize: '0.7rem' }}>
                          {j.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '2rem' }}>
          
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Registered Users</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Activate, deactivate, or delete user accounts across all roles.</p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['ALL', 'CANDIDATE', 'RECRUITER', 'ADMIN'].map((r) => (
                <button
                  key={r}
                  onClick={() => setUserRoleFilter(r)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid ' + (userRoleFilter === r ? 'var(--primary)' : 'var(--border-light)'),
                    background: userRoleFilter === r ? 'var(--primary-light)' : '#FFFFFF',
                    color: userRoleFilter === r ? 'var(--primary)' : '#475569',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{u.fullName || 'User'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{u.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${u.role === 'CANDIDATE' ? 'badge-applied' : u.role === 'RECRUITER' ? 'badge-shortlist' : 'badge-tag'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.active ? 'badge-active' : 'badge-closed'}`}>
                        {u.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748B' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {u.id !== user.id && (
                          <>
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                              title={u.active ? 'Deactivate User' : 'Activate User'}
                            >
                              {u.active ? <UserX size={14} color="#EF4444" /> : <UserCheck size={14} color="#10B981" />}
                              {u.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#EF4444', padding: '0.35rem 0.5rem' }}
                              title="Delete Account"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: JOB MODERATION */}
      {activeTab === 'jobs' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Platform Job Postings</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Review, close, or remove job listings across all organizations.</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Type / Level</th>
                  <th>Status</th>
                  <th>Applicants</th>
                  <th style={{ textAlign: 'right' }}>Moderation</th>
                </tr>
              </thead>
              <tbody>
                {jobsList.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <Link to={`/jobs/${job.id}`} style={{ fontWeight: 700, color: '#0F172A' }}>
                        {job.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{job.location}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#4F46E5' }}>{job.companyName}</span>
                    </td>
                    <td>
                      <span className="badge badge-tag" style={{ fontSize: '0.7rem', marginRight: 4 }}>
                        {job.jobType.replace('_', ' ')}
                      </span>
                      <span className="badge badge-tag" style={{ fontSize: '0.7rem' }}>
                        {job.experienceLevel}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', width: 'auto' }}
                        value={job.status}
                        onChange={(e) => handleJobStatusChange(job.id, e.target.value)}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#0F172A' }}>{job.applicantCount}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" target="_blank" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}>
                          <ExternalLink size={13} />
                        </Link>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#EF4444', padding: '0.3rem 0.5rem' }}
                          title="Delete Job"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COMPANY VERIFICATION */}
      {activeTab === 'companies' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Registered Organizations</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Grant or revoke verified employer status badges.</p>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Company Name</th>
                  <th>Location</th>
                  <th>Website</th>
                  <th>Verification Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {companiesList.map((comp) => (
                  <tr key={comp.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{comp.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {comp.description}
                      </div>
                    </td>
                    <td>{comp.location || 'N/A'}</td>
                    <td>
                      {comp.website ? (
                        <a href={comp.website} target="_blank" rel="noreferrer" style={{ color: '#4F46E5', fontSize: '0.85rem' }}>
                          {comp.website}
                        </a>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${comp.verified ? 'badge-selected' : 'badge-closed'}`}>
                        {comp.verified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleToggleCompanyVerify(comp.id)}
                          className={`btn ${comp.verified ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                          style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                        >
                          {comp.verified ? 'Revoke Verification' : 'Verify Company'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
