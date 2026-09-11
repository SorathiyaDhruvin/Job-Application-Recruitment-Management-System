import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Building2, MapPin, DollarSign, Trash2, ArrowRight, Briefcase } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const SavedJobsPage = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSavedJobs = async () => {
    try {
      const res = await api.get('/candidates/saved-jobs');
      setSavedJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Failed to load saved jobs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await api.delete(`/candidates/saved-jobs/${jobId}`);
      setSavedJobs((prev) => prev.filter((j) => j.id !== jobId));
      showToast('Removed from saved bookmarks.', 'info');
    } catch (err) {
      showToast('Failed to remove bookmark.', 'error');
    }
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    return min ? `$${(min / 1000).toFixed(0)}k+` : `Up to $${(max / 1000).toFixed(0)}k`;
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Saved Job Bookmarks</h1>
          <p style={{ color: '#64748B' }}>Keep track of job openings you plan to review or apply to later.</p>
        </div>
        <Link to="/jobs" className="btn btn-secondary btn-sm">
          Browse Open Positions
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading bookmarks...</div>
      ) : savedJobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Bookmark size={44} color="#CBD5E1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No saved jobs yet</h3>
          <p style={{ color: '#64748B', maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Click the bookmark icon on any job card to save it here for quick access later.
          </p>
          <Link to="/jobs" className="btn btn-primary btn-sm">Explore Tech Openings</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {savedJobs.map((job) => (
            <div key={job.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 'var(--radius-md)',
                      background: '#F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      border: '1px solid #E2E8F0'
                    }}>
                      {job.companyLogoUrl ? (
                        <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <Building2 size={22} color="#64748B" />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#4F46E5' }}>{job.companyName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={12} /> {job.location}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(job.id)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}
                    title="Remove from saved"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <Link to={`/jobs/${job.id}`} style={{ color: '#0F172A' }}>
                    {job.title}
                  </Link>
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.825rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-applied">{job.jobType.replace('_', ' ')}</span>
                  <span className="badge badge-tag">{job.experienceLevel}</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  View & Apply <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedJobsPage;
