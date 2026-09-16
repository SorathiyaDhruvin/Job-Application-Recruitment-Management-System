import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  Building2, 
  Bookmark, 
  DollarSign, 
  Clock, 
  X, 
  CheckCircle,
  SlidersHorizontal
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isCandidate } = useAuth();
  const { showToast } = useToast();

  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');
  const [sortBy, setSortBy] = useState('newest');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (jobType) params.append('jobType', jobType);
      if (experienceLevel) params.append('experienceLevel', experienceLevel);

      const res = await api.get(`/jobs?${params.toString()}`);
      let list = res.data.data || [];

      // Client-side sort
      if (sortBy === 'salaryHigh') {
        list.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
      } else if (sortBy === 'title') {
        list.sort((a, b) => a.title.localeCompare(b.title));
      }

      setJobs(list);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      showToast('Error loading jobs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType, experienceLevel, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleToggleSave = async (jobId, isCurrentlySaved) => {
    if (!isAuthenticated) {
      showToast('Please sign in as a candidate to save jobs.', 'info');
      return;
    }
    if (!isCandidate) {
      showToast('Only candidates can save jobs.', 'info');
      return;
    }

    try {
      if (isCurrentlySaved) {
        await api.delete(`/candidates/saved-jobs/${jobId}`);
        showToast('Job removed from saved list.', 'info');
      } else {
        await api.post(`/candidates/saved-jobs/${jobId}`);
        showToast('Job saved to your bookmarks!', 'success');
      }
      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, savedByCurrentUser: !isCurrentlySaved } : j))
      );
    } catch (err) {
      showToast('Failed to update bookmark.', 'error');
    }
  };

  const clearFilters = () => {
    setKeyword('');
    setLocation('');
    setJobType('');
    setExperienceLevel('');
    setSortBy('newest');
    setSearchParams({});
  };

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive Salary';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k / yr`;
    return min ? `From $${(min / 1000).toFixed(0)}k` : `Up to $${(max / 1000).toFixed(0)}k`;
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Explore Engineering Jobs</h1>
        <p style={{ color: '#64748B' }}>Discover verified full-stack, backend, frontend, and cloud roles.</p>

        <form onSubmit={handleSearchSubmit} className="hero-search-bar" style={{ margin: '1.5rem 0 0', maxWidth: '100%' }}>
          <div className="search-input-group">
            <Search size={18} color="#4F46E5" />
            <input
              type="text"
              placeholder="Search by title, technology, or company name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="search-divider" />

          <div className="search-input-group">
            <MapPin size={18} color="#64748B" />
            <input
              type="text"
              placeholder="Location or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Job Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Filter Sidebar */}
        <aside className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem' }}>
              <SlidersHorizontal size={18} color="#4F46E5" /> Filters
            </div>
            {(keyword || location || jobType || experienceLevel) && (
              <button
                onClick={clearFilters}
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Reset All
              </button>
            )}
          </div>

          {/* Job Type Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem' }}>Employment Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { label: 'All Types', value: '' },
                { label: 'Full Time', value: 'FULL_TIME' },
                { label: 'Part Time', value: 'PART_TIME' },
                { label: 'Remote', value: 'REMOTE' },
                { label: 'Internship', value: 'INTERNSHIP' },
                { label: 'Contract', value: 'CONTRACT' }
              ].map((item) => (
                <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer', color: '#334155' }}>
                  <input
                    type="radio"
                    name="jobType"
                    checked={jobType === item.value}
                    onChange={() => setJobType(item.value)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Experience Level Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem' }}>Experience Level</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { label: 'All Levels', value: '' },
                { label: 'Entry Level (Fresher)', value: 'ENTRY' },
                { label: 'Mid Level (2-4 yrs)', value: 'MID' },
                { label: 'Senior Level (5+ yrs)', value: 'SENIOR' },
                { label: 'Lead / Architect', value: 'LEAD' }
              ].map((item) => (
                <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.875rem', cursor: 'pointer', color: '#334155' }}>
                  <input
                    type="radio"
                    name="experienceLevel"
                    checked={experienceLevel === item.value}
                    onChange={() => setExperienceLevel(item.value)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <label className="form-label" style={{ marginBottom: '0.4rem' }}>Sort Openings</label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="salaryHigh">Salary (High to Low)</option>
              <option value="title">Job Title (A-Z)</option>
            </select>
          </div>
        </aside>

        {/* Results Column */}
        <main>
          {/* Header count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#475569', fontSize: '0.95rem' }}>
              Showing <span style={{ color: '#0F172A', fontWeight: 700 }}>{jobs.length}</span> positions
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
              Loading job postings...
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Briefcase size={48} color="#94A3B8" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No matching jobs found</h3>
              <p style={{ color: '#64748B', maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
                We couldn't find any job openings matching your search criteria. Try adjusting your keyword or clearing some filters.
              </p>
              <button onClick={clearFilters} className="btn btn-secondary btn-sm">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <div key={job.id} className="card card-hover" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
                    
                    {/* Left details */}
                    <div style={{ display: 'flex', gap: '1.25rem' }}>
                      <div style={{
                        width: 54,
                        height: 54,
                        borderRadius: 'var(--radius-md)',
                        background: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        flexShrink: 0
                      }}>
                        {job.companyLogoUrl ? (
                          <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <Building2 size={26} color="#64748B" />
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#4F46E5' }}>{job.companyName}</span>
                          <span className="badge badge-tag" style={{ fontSize: '0.75rem' }}>{job.experienceLevel}</span>
                          <span className="badge badge-applied" style={{ fontSize: '0.75rem' }}>{job.jobType.replace('_', ' ')}</span>
                          {job.appliedByCurrentUser && (
                            <span className="badge badge-selected" style={{ fontSize: '0.75rem' }}>
                              <CheckCircle size={10} style={{ marginRight: 3 }} /> Applied
                            </span>
                          )}
                        </div>

                        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.4rem', fontWeight: 700 }}>
                          <Link to={`/jobs/${job.id}`} style={{ color: '#0F172A' }}>
                            {job.title}
                          </Link>
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#64748B', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={14} /> {job.location}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: '#0F172A' }}>
                            <DollarSign size={14} color="#10B981" /> {formatSalary(job.salaryMin, job.salaryMax)}
                          </span>
                          {job.deadline && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Clock size={14} /> Deadline: {job.deadline}
                            </span>
                          )}
                        </div>

                        {job.skills && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {job.skills.split(',').map((skill, idx) => (
                              <span key={idx} className="badge badge-tag">{skill.trim()}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                      <button
                        onClick={() => handleToggleSave(job.id, job.savedByCurrentUser)}
                        style={{
                          background: job.savedByCurrentUser ? '#EEF2FF' : 'transparent',
                          border: '1px solid ' + (job.savedByCurrentUser ? '#C7D2FE' : '#E2E8F0'),
                          borderRadius: 'var(--radius-md)',
                          width: 36,
                          height: 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: job.savedByCurrentUser ? '#4F46E5' : '#64748B',
                          transition: 'var(--transition-fast)'
                        }}
                        title={job.savedByCurrentUser ? 'Remove from saved' : 'Save job'}
                      >
                        <Bookmark size={16} fill={job.savedByCurrentUser ? '#4F46E5' : 'none'} />
                      </button>

                      <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>
                        View & Apply
                      </Link>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default JobSearchPage;
