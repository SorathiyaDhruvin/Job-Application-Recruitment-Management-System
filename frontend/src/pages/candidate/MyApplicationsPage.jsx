import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  History, 
  FileText, 
  MessageSquare,
  X
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);
  const [historyModalApp, setHistoryModalApp] = useState(null);

  const { showToast } = useToast();

  useEffect(() => {
    api.get('/applications/my')
      .then((res) => setApplications(res.data.data || []))
      .catch((err) => {
        console.error(err);
        showToast('Failed to load applications.', 'error');
      })
      .finally(() => setLoading(false));
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

  const getStageIndex = (status) => {
    if (status === 'REJECTED') return -1;
    return STAGES.indexOf(status);
  };

  const filteredApps = applications.filter((app) => {
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>My Job Applications</h1>
          <p style={{ color: '#64748B' }}>Monitor stage progressions, recruiter notes, and interview status in real time.</p>
        </div>
        <Link to="/jobs" className="btn btn-primary btn-sm">
          Browse More Jobs
        </Link>
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
          { label: 'All Applications', value: 'ALL', count: applications.length },
          { label: 'Applied', value: 'APPLIED', count: applications.filter(a => a.status === 'APPLIED').length },
          { label: 'Under Review', value: 'UNDER_REVIEW', count: applications.filter(a => a.status === 'UNDER_REVIEW').length },
          { label: 'Shortlisted', value: 'SHORTLISTED', count: applications.filter(a => a.status === 'SHORTLISTED').length },
          { label: 'Interviews', value: 'INTERVIEW', count: applications.filter(a => a.status === 'INTERVIEW').length },
          { label: 'Selected / Offers', value: 'SELECTED', count: applications.filter(a => a.status === 'SELECTED').length },
          { label: 'Rejected', value: 'REJECTED', count: applications.filter(a => a.status === 'REJECTED').length }
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
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading application tracker...</div>
      ) : filteredApps.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={44} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No applications found in this category</h3>
          <p style={{ color: '#64748B', maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Check other status tabs or browse active engineering openings to apply.
          </p>
          <Link to="/jobs" className="btn btn-primary btn-sm">Find Jobs</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredApps.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'REJECTED';
            const isExpanded = expandedId === app.id;

            return (
              <div key={app.id} className="card" style={{ padding: '2rem' }}>
                
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: 'var(--radius-md)',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0',
                      flexShrink: 0
                    }}>
                      {app.companyLogoUrl ? (
                        <img src={app.companyLogoUrl} alt={app.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={24} color="#64748B" />
                      )}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#4F46E5', fontSize: '0.95rem' }}>{app.companyName}</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>&bull;</span>
                        <span style={{ fontSize: '0.825rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                          <MapPin size={12} /> {app.jobLocation}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
                        <Link to={`/jobs/${app.jobId}`} style={{ color: '#0F172A' }}>
                          {app.jobTitle}
                        </Link>
                      </h2>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getStatusBadge(app.status)}
                    <button
                      onClick={() => setHistoryModalApp(app)}
                      className="btn btn-secondary btn-sm"
                      title="View Timeline History"
                    >
                      <History size={15} /> History
                    </button>
                  </div>
                </div>

                {/* Tracking Progress Bar */}
                <div style={{ margin: '2rem 0', background: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748B', marginBottom: '1.25rem' }}>
                    Recruitment Stage Pipeline
                  </div>

                  {isRejected ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      color: '#EF4444'
                    }}>
                      <XCircle size={22} style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Application Closed / Not Selected</div>
                        <div style={{ fontSize: '0.825rem', color: '#7F1D1D' }}>
                          {app.recruiterNotes || 'Thank you for your interest. The company has decided to proceed with other candidates at this time.'}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="tracking-timeline">
                      {STAGES.map((st, idx) => {
                        const isCompleted = currentStageIdx > idx;
                        const isCurrent = currentStageIdx === idx;
                        const stageName = st.replace('_', ' ');

                        return (
                          <div
                            key={st}
                            className={`timeline-step ${isCompleted ? 'completed' : isCurrent ? 'active' : ''}`}
                          >
                            <div className="timeline-dot">
                              {isCompleted ? <CheckCircle2 size={18} /> : idx + 1}
                            </div>
                            <div className="timeline-label">{stageName}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recruiter notes callout if shortlisted/interview */}
                {app.recruiterNotes && !isRejected && (
                  <div style={{
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.6rem',
                    marginBottom: '1rem',
                    color: '#166534',
                    fontSize: '0.875rem'
                  }}>
                    <MessageSquare size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <strong>Recruiter Note:</strong> {app.recruiterNotes}
                    </div>
                  </div>
                )}

                {/* Expand / Collapse Details Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F1F5F9', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#64748B' }}>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <span>Applied on: <strong>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}</strong></span>
                    {app.resumeFileName && <span>Resume attached: <strong>PDF</strong></span>}
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : app.id)}
                    style={{ background: 'none', border: 'none', color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  >
                    {isExpanded ? <>Hide Cover Letter <ChevronUp size={14} /></> : <>View Cover Letter <ChevronDown size={14} /></>}
                  </button>
                </div>

                {/* Collapsible Cover letter */}
                {isExpanded && (
                  <div style={{ marginTop: '1rem', background: '#F8FAFC', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #E2E8F0', animation: 'fadeIn 0.2s ease-out' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.4rem' }}>
                      Your Cover Letter
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                      {app.coverLetter || 'No cover letter was submitted with this application.'}
                    </p>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Status History Modal */}
      {historyModalApp && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Application History</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>{historyModalApp.jobTitle} &bull; {historyModalApp.companyName}</p>
              </div>
              <button onClick={() => setHistoryModalApp(null)} className="modal-close">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              {historyModalApp.statusHistory && historyModalApp.statusHistory.length > 0 ? (
                historyModalApp.statusHistory.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      flexShrink: 0
                    }}>
                      {idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                          Status: {item.toStatus}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          {item.changedAt ? new Date(item.changedAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.825rem', color: '#475569', marginBottom: '0.25rem' }}>
                        {item.notes || 'Status updated'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Updated by: {item.changedByName}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem', color: '#64748B' }}>
                  No historical transition records found.
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button onClick={() => setHistoryModalApp(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyApplicationsPage;
