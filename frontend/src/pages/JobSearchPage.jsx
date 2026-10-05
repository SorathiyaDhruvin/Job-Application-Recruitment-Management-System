import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Bookmark, 
  DollarSign, 
  Clock, 
  CheckCircle,
  SlidersHorizontal,
  ChevronRight
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
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || '');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || '');
  const [salaryDisclosed, setSalaryDisclosed] = useState(searchParams.get('salaryDisclosed') || '');
  const [sortBy, setSortBy] = useState('newest');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (country) params.append('country', country);
      if (state) params.append('state', state);
      if (city) params.append('city', city);
      if (workMode) params.append('workMode', workMode);
      if (jobType) params.append('jobType', jobType);
      if (experienceLevel) params.append('experienceLevel', experienceLevel);
      if (salaryDisclosed) params.append('salaryDisclosed', salaryDisclosed);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/jobs?${params.toString()}`);
      setJobs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      showToast('Error loading jobs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType, experienceLevel, workMode, salaryDisclosed, sortBy]);

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
    setCountry('');
    setState('');
    setCity('');
    setWorkMode('');
    setJobType('');
    setExperienceLevel('');
    setSalaryDisclosed('');
    setSortBy('newest');
    setSearchParams({});
    // fetchJobs will be called via useEffect or we can call it manually
    setTimeout(() => fetchJobs(), 100);
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
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 2rem' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', fontWeight: 800 }}>Explore Job Opportunities</h1>
        <p style={{ color: '#64748B', fontSize: '1.1rem' }}>Find your next role at top companies with verified details.</p>

        <form onSubmit={handleSearchSubmit} className="hero-search-bar" style={{ margin: '1.5rem 0 0', maxWidth: '100%' }}>
          <div className="search-input-group">
            <Search size={18} color="#4F46E5" />
            <input
              type="text"
              placeholder="Search by title, role, skills, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="search-divider" />

          <div className="search-input-group">
            <MapPin size={18} color="#64748B" />
            <input
              type="text"
              placeholder="Country, State, City, or 'Remote'..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0 2rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Job Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Filter Sidebar */}
        <aside className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
              <SlidersHorizontal size={18} color="#4F46E5" /> Filters
            </div>
            <button
              onClick={clearFilters}
              style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset All
            </button>
          </div>

          {/* Location Filters */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 600 }}>Location</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Country (e.g. India)" 
                value={country} 
                onChange={(e) => setCountry(e.target.value)} 
                onBlur={fetchJobs}
                style={{ padding: '0.5rem' }}
              />
              <input 
                type="text" 
                className="form-input" 
                placeholder="State (e.g. Gujarat)" 
                value={state} 
                onChange={(e) => setState(e.target.value)} 
                onBlur={fetchJobs}
                style={{ padding: '0.5rem' }}
              />
              <input 
                type="text" 
                className="form-input" 
                placeholder="City (e.g. Vadodara)" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                onBlur={fetchJobs}
                style={{ padding: '0.5rem' }}
              />
            </div>
          </div>

          {/* Work Mode Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 600 }}>Work Mode</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'All Modes', value: '' },
                { label: 'Work From Home', value: 'REMOTE' },
                { label: 'Hybrid', value: 'HYBRID' },
                { label: 'In Office', value: 'ONSITE' }
              ].map((item) => (
                <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', color: '#334155' }}>
                  <input
                    type="radio"
                    name="workMode"
                    checked={workMode === item.value}
                    onChange={() => setWorkMode(item.value)}
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {/* Job Type Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 600 }}>Employment Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'All Types', value: '' },
                { label: 'Full Time', value: 'FULL_TIME' },
                { label: 'Part Time', value: 'PART_TIME' },
                { label: 'Internship', value: 'INTERNSHIP' },
                { label: 'Contract', value: 'CONTRACT' }
              ].map((item) => (
                <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', color: '#334155' }}>
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
            <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 600 }}>Experience Level</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: 'All Levels', value: '' },
                { label: 'Fresher / Entry Level', value: 'ENTRY' },
                { label: 'Mid Level (2-4 yrs)', value: 'MID' },
                { label: 'Senior Level (5+ yrs)', value: 'SENIOR' },
                { label: 'Lead / Architect', value: 'LEAD' }
              ].map((item) => (
                <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', color: '#334155' }}>
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

          {/* Salary Disclosure Filter */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 600 }}>Salary</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', color: '#334155' }}>
                <input
                  type="radio"
                  name="salaryDisclosed"
                  checked={salaryDisclosed === ''}
                  onChange={() => setSalaryDisclosed('')}
                />
                Any
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.9rem', cursor: 'pointer', color: '#334155' }}>
                <input
                  type="radio"
                  name="salaryDisclosed"
                  checked={salaryDisclosed === 'true'}
                  onChange={() => setSalaryDisclosed('true')}
                />
                Salary disclosed
              </label>
            </div>
          </div>
        </aside>

        {/* Results Column */}
        <main>
          {/* Header count and Sort */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontWeight: 600, color: '#475569', fontSize: '1rem' }}>
              <span style={{ color: '#0F172A', fontWeight: 800 }}>{jobs.length}</span> jobs found
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>Sort by:</span>
              <select
                className="form-select"
                style={{ padding: '0.4rem 2rem 0.4rem 0.8rem', fontSize: '0.9rem', width: 'auto', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="deadline">Deadline</option>
                <option value="salary_desc">Salary: High to Low</option>
                <option value="salary_asc">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: 30, height: 30, border: '3px solid #E2E8F0', borderTopColor: '#4F46E5', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Loading job postings...
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
              <Briefcase size={54} color="#CBD5E1" style={{ margin: '0 auto 1.5rem' }} />
              <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 700, color: '#1E293B' }}>No matching jobs found</h3>
              <p style={{ color: '#64748B', maxWidth: 420, margin: '0 auto 2rem', fontSize: '0.95rem' }}>
                We couldn't find any job openings matching your search criteria. Try adjusting your keyword or clearing some filters to see more results.
              </p>
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {jobs.map((job) => (
                <div key={job.id} className="card card-hover" style={{ padding: '1.5rem', border: '1px solid #E2E8F0', transition: 'all 0.2s ease', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    
                    {/* Left details */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          width: 50,
                          height: 50,
                          borderRadius: 'var(--radius-md)',
                          background: '#F8FAFC',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          border: '1px solid #E2E8F0',
                          flexShrink: 0
                        }}>
                          {job.companyLogoUrl ? (
                            <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                          ) : (
                            <Building2 size={24} color="#94A3B8" />
                          )}
                        </div>
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#334155', display: 'block' }}>{job.companyName}</span>
                          {job.sourceName && (
                            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Via {job.sourceName}</span>
                          )}
                        </div>
                      </div>

                      <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 800, lineHeight: 1.3 }}>
                        <Link to={`/jobs/${job.id}`} style={{ color: '#0F172A', textDecoration: 'none' }} className="hover-underline">
                          {job.title}
                        </Link>
                      </h2>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                        <span className="badge" style={{ fontSize: '0.75rem', background: '#EEF2FF', color: '#4F46E5', fontWeight: 600 }}>
                          {getJobTypeDisplay(job.jobType)}
                        </span>
                        {job.workMode && (
                          <span className="badge" style={{ fontSize: '0.75rem', background: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', fontWeight: 600 }}>
                            {getWorkModeDisplay(job.workMode)}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="badge" style={{ fontSize: '0.75rem', background: '#F0FDF4', color: '#16A34A', border: '1px solid #DCFCE7', fontWeight: 600 }}>
                            {job.experienceLevel}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem', fontSize: '0.9rem', color: '#475569', marginBottom: '1.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={16} color="#94A3B8" /> {formatLocation(job)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: job.salaryDisclosed ? 600 : 400, color: job.salaryDisclosed ? '#0F172A' : '#64748B' }}>
                          <DollarSign size={16} color={job.salaryDisclosed ? '#10B981' : '#94A3B8'} /> {formatSalary(job)}
                        </span>
                        {job.deadline && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock size={16} color="#94A3B8" /> Apply by {job.deadline}
                          </span>
                        )}
                      </div>

                      {job.skills && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {job.skills.split(',').slice(0, 5).map((skill, idx) => (
                            <span key={idx} style={{ padding: '0.2rem 0.6rem', background: '#F1F5F9', color: '#475569', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>
                              {skill.trim()}
                            </span>
                          ))}
                          {job.skills.split(',').length > 5 && (
                            <span style={{ padding: '0.2rem 0.6rem', background: '#F1F5F9', color: '#94A3B8', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 500 }}>
                              +{job.skills.split(',').length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right action column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch' }}>
                      <button
                        onClick={() => handleToggleSave(job.id, job.savedByCurrentUser)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          color: job.savedByCurrentUser ? '#4F46E5' : '#94A3B8',
                          transition: 'color 0.2s'
                        }}
                        title={job.savedByCurrentUser ? 'Remove from saved' : 'Save job'}
                      >
                        <Bookmark size={22} fill={job.savedByCurrentUser ? '#4F46E5' : 'none'} />
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                        {job.appliedByCurrentUser && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Applied
                          </span>
                        )}
                        <Link to={`/jobs/${job.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          View & Apply <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .hover-underline:hover {
          text-decoration: underline;
          text-decoration-color: #4F46E5;
          text-underline-offset: 4px;
        }
      `}</style>
    </div>
  );
};

export default JobSearchPage;
