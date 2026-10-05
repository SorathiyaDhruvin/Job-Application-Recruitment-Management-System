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

  const formatSalary = (job) => {
    if (job.salaryDisclosed === false) return 'Salary not disclosed';
    if (job.salaryText) return job.salaryText;
    const curr = job.salaryCurrency || '$';
    if (job.salaryMin && job.salaryMax) return `${curr}${job.salaryMin.toLocaleString()} - ${curr}${job.salaryMax.toLocaleString()}`;
    if (job.salaryMin) return `From ${curr}${job.salaryMin.toLocaleString()}`;
    if (job.salaryMax) return `Up to ${curr}${job.salaryMax.toLocaleString()}`;
    return 'Salary not disclosed';
  };

  const formatLocation = (job) => {
    if (job.workMode === 'REMOTE') return 'Work From Home';
    const locArr = [];
    if (job.city) locArr.push(job.city);
    if (job.state) locArr.push(job.state);
    if (job.country) locArr.push(job.country);
    
    let locString = locArr.length > 0 ? locArr.join(', ') : job.location;
    if (!locString) locString = 'Location not specified';

    const modeMap = { ONSITE: 'In Office', HYBRID: 'Hybrid', REMOTE: 'Work From Home' };
    const mode = job.workMode ? modeMap[job.workMode] : null;
    
    return mode ? `${mode} | ${locString}` : locString;
  };

  const getJobTypeDisplay = (type) => {
    if (!type) return '';
    return type.replace('_', ' ');
  };

  const getWorkModeDisplay = (mode) => {
    if (mode === 'ONSITE') return 'IN OFFICE';
    if (mode === 'HYBRID') return 'HYBRID';
    if (mode === 'REMOTE') return 'WORK FROM HOME';
    return mode;
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
              <div key={job.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid #E2E8F0', position: 'relative' }}>
                <button
                  onClick={() => handleRemove(job.id)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#FEE2E2', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Remove from saved"
                >
                  <Trash2 size={16} />
                </button>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <div style={{
                        width: 48, height: 48,
                        borderRadius: 'var(--radius-md)',
                        background: '#F8FAFC',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0
                      }}>
                        {job.companyLogoUrl ? (
                          <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                        ) : (
                          <Building2 size={24} color="#94A3B8" />
                        )}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#334155' }}>{job.companyName}</div>
                        {job.sourceName && (
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Via {job.sourceName}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 800, lineHeight: 1.3 }}>
                    <Link to={`/jobs/${job.id}`} style={{ color: '#0F172A', textDecoration: 'none' }}>
                      {job.title}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <span className="badge" style={{ fontSize: '0.7rem', background: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}>
                      {getJobTypeDisplay(job.jobType)}
                    </span>
                    {job.workMode && (
                      <span className="badge" style={{ fontSize: '0.7rem', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                        {getWorkModeDisplay(job.workMode)}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#475569', marginBottom: '1.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} color="#94A3B8" /> {formatLocation(job)}
                    </span>
                  </div>

                  {job.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                      {job.skills.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} style={{ padding: '0.15rem 0.5rem', background: '#F1F5F9', color: '#475569', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 500 }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{
                  borderTop: '1px solid #E2E8F0', paddingTop: '1rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div style={{ fontWeight: job.salaryDisclosed ? 600 : 400, color: job.salaryDisclosed ? '#0F172A' : '#64748B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <DollarSign size={14} color={job.salaryDisclosed ? '#10B981' : '#94A3B8'} />
                    {formatSalary(job)}
                  </div>
                  <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm" style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)' }}>
                    Apply
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
