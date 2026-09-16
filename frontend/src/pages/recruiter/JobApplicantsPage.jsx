import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  ArrowLeft, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare,
  Calendar,
  X,
  Mail,
  Phone,
  MapPin,
  GraduationCap
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STATUS_OPTIONS = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'];

const JobApplicantsPage = () => {
  const { jobId } = useParams();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Candidate review drawer/modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [recruiterNotes, setRecruiterNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplicants = async () => {
    setLoading(true);
    try {
      if (jobId) {
        const [jobRes, appsRes] = await Promise.all([
          api.get(`/jobs/${jobId}`),
          api.get(`/recruiters/jobs/${jobId}/applications`)
        ]);
        setJob(jobRes.data.data);
        setApplicants(appsRes.data.data || []);
      } else {
        const appsRes = await api.get('/recruiters/applications');
        setApplicants(appsRes.data.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading job applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const openReviewModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setRecruiterNotes(app.recruiterNotes || '');
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdatingStatus(true);
    try {
      const res = await api.put(`/applications/${selectedApp.id}/status`, {
        status: newStatus,
        notes: recruiterNotes
      });

      showToast(`Application updated to ${newStatus}.`, 'success');
      const updatedApp = res.data.data;
      setApplicants((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
      setSelectedApp(updatedApp);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application status.', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  const filteredApplicants = applicants.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Back button */}
      <Link to="/recruiter/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to My Jobs
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
            {job ? `${job.title} Applicants` : 'Candidate Hiring Pipeline'}
          </h1>
          <p style={{ color: '#64748B' }}>
            {job ? `${job.companyName} • ${job.location} • ${applicants.length} Total Applicants` : 'Review submissions across all active job postings.'}
          </p>
        </div>

        {job && (
          <Link to={`/jobs/${job.id}`} className="btn btn-secondary btn-sm" target="_blank">
            <ExternalLink size={14} /> Public Posting
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {[
          { label: 'All Applicants', value: 'ALL', count: applicants.length },
          { label: 'Applied', value: 'APPLIED', count: applicants.filter(a => a.status === 'APPLIED').length },
          { label: 'Under Review', value: 'UNDER_REVIEW', count: applicants.filter(a => a.status === 'UNDER_REVIEW').length },
          { label: 'Shortlisted', value: 'SHORTLISTED', count: applicants.filter(a => a.status === 'SHORTLISTED').length },
          { label: 'Interview', value: 'INTERVIEW', count: applicants.filter(a => a.status === 'INTERVIEW').length },
          { label: 'Selected', value: 'SELECTED', count: applicants.filter(a => a.status === 'SELECTED').length },
          { label: 'Rejected', value: 'REJECTED', count: applicants.filter(a => a.status === 'REJECTED').length }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilterStatus(tab.value)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: 'var(--radius-full)',
              background: filterStatus === tab.value ? 'var(--primary)' : '#FFFFFF',
              color: filterStatus === tab.value ? '#FFFFFF' : '#475569',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: filterStatus === tab.value ? '0 2px 8px var(--primary-glow)' : 'var(--shadow-sm)',
              border: '1px solid ' + (filterStatus === tab.value ? 'var(--primary)' : 'var(--border-light)')
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading applicants...</div>
      ) : filteredApplicants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={44} color="#CBD5E1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No applicants in this stage</h3>
          <p style={{ color: '#64748B', maxWidth: 420, margin: '0 auto', fontSize: '0.9rem' }}>
            Switch to another filter tab to view candidates in other stages of evaluation.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Candidate Profile</th>
                <th>Applied Role</th>
                <th>Experience</th>
                <th>Resume</th>
                <th>Status</th>
                <th>Recruiter Notes</th>
                <th style={{ textAlign: 'right' }}>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                      {app.candidateName || 'Anonymous Candidate'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{app.candidateEmail}</div>
                    {app.candidatePhone && <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{app.candidatePhone}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#4F46E5', fontSize: '0.9rem' }}>{app.jobTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {app.candidateExperienceYears != null ? `${app.candidateExperienceYears} yrs` : 'Fresher'}
                    </span>
                  </td>
                  <td>
                    {app.resumeFileName ? (
                      <a
                        href={`/api/files/resume/${app.resumeFileName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                      >
                        <FileText size={13} /> PDF Resume
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>No File</span>
                    )}
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.8rem', color: app.recruiterNotes ? '#334155' : '#94A3B8' }}>
                      {app.recruiterNotes || 'No notes yet'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openReviewModal(app)}
                        className="btn btn-primary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                      >
                        Review &amp; Status
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Evaluation Modal */}
      {selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 700 }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Candidate Evaluation</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {selectedApp.candidateName} &bull; {selectedApp.jobTitle}
                </p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            {/* Candidate Quick Profile Overview */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              border: '1px solid #E2E8F0',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} color="#64748B" /> {selectedApp.candidateEmail}
                </div>
                {selectedApp.candidatePhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Phone size={14} color="#64748B" /> {selectedApp.candidatePhone}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCap size={14} color="#64748B" /> {selectedApp.candidateEducation || 'Education not specified'}
                </div>
              </div>

              {selectedApp.candidateHeadline && (
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  Headline: {selectedApp.candidateHeadline}
                </div>
              )}

              {selectedApp.candidateSkills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.5rem' }}>
                  {selectedApp.candidateSkills.split(',').map((s, idx) => (
                    <span key={idx} className="badge badge-tag" style={{ fontSize: '0.75rem' }}>{s.trim()}</span>
                  ))}
                </div>
              )}

              {selectedApp.resumeFileName && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #E2E8F0', paddingTop: '0.75rem' }}>
                  <a
                    href={`/api/files/resume/${selectedApp.resumeFileName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ gap: 6 }}
                  >
                    <Download size={14} /> Open Candidate Resume (PDF)
                  </a>
                </div>
              )}
            </div>

            {/* Candidate Cover Letter */}
            {selectedApp.coverLetter && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.35rem' }}>Candidate Cover Letter</label>
                <div style={{
                  background: '#FFFFFF',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.875rem',
                  color: '#334155',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  maxHeight: 160,
                  overflowY: 'auto'
                }}>
                  {selectedApp.coverLetter}
                </div>
              </div>
            )}

            {/* Form: Update Application Stage */}
            <form onSubmit={handleStatusUpdate}>
              <div className="form-group">
                <label className="form-label">Update Application Stage *</label>
                <select
                  className="form-select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="APPLIED">Applied (Initial Submission)</option>
                  <option value="UNDER_REVIEW">Under Review (Screening Resume)</option>
                  <option value="SHORTLISTED">Shortlisted (Selected for Rounds)</option>
                  <option value="INTERVIEW">Interview Scheduled</option>
                  <option value="SELECTED">Selected / Offer Extended</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Recruiter Notes / Feedback</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Cleared coding round with score 95. Technical interview scheduled for Thursday 2 PM EST..."
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="btn btn-secondary"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="btn btn-primary"
                >
                  {updatingStatus ? 'Updating Stage...' : 'Save Decision'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default JobApplicantsPage;
