import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  Bookmark, 
  Clock, 
  CheckCircle,
  SlidersHorizontal,
  ChevronRight,
  X,
  Navigation,
  Globe,
  Calendar,
  TrendingUp,
  Banknote
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, isCandidate } = useAuth();
  const { showToast } = useToast();

  // Search inputs
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  // Structured filters
  const [country, setCountry] = useState(searchParams.get('country') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [workModes, setWorkModes] = useState(() => {
    const wm = searchParams.get('workMode');
    return wm ? [wm] : [];
  });
  const [jobTypes, setJobTypes] = useState(() => {
    const jt = searchParams.get('jobType');
    return jt ? [jt] : [];
  });
  const [experienceLevels, setExperienceLevels] = useState(() => {
    const el = searchParams.get('experienceLevel');
    return el ? [el] : [];
  });
  const [salaryDisclosed, setSalaryDisclosed] = useState(searchParams.get('salaryDisclosed') || '');
  const [sortBy, setSortBy] = useState('newest');

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (location) params.append('location', location);
      if (country) params.append('country', country);
      if (state) params.append('state', state);
      if (city) params.append('city', city);
      // Send first selected work mode (API takes single value)
      if (workModes.length === 1) params.append('workMode', workModes[0]);
      if (jobTypes.length === 1) params.append('jobType', jobTypes[0]);
      if (experienceLevels.length === 1) params.append('experienceLevel', experienceLevels[0]);
      if (salaryDisclosed) params.append('salaryDisclosed', salaryDisclosed);
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/jobs?${params.toString()}`);
      let jobData = res.data.data || [];

      // Client-side multi-filter if multiple checkboxes selected
      if (workModes.length > 1) {
        jobData = jobData.filter(j => workModes.includes(j.workMode));
      }
      if (jobTypes.length > 1) {
        jobData = jobData.filter(j => jobTypes.includes(j.jobType));
      }
      if (experienceLevels.length > 1) {
        jobData = jobData.filter(j => experienceLevels.includes(j.experienceLevel));
      }

      setJobs(jobData);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      showToast('Error loading jobs. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [keyword, location, country, state, city, workModes, jobTypes, experienceLevels, salaryDisclosed, sortBy]);

  useEffect(() => {
    fetchJobs();
  }, [workModes, jobTypes, experienceLevels, salaryDisclosed, sortBy]);

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
    setWorkModes([]);
    setJobTypes([]);
    setExperienceLevels([]);
    setSalaryDisclosed('');
    setSortBy('newest');
    setSearchParams({});
    setTimeout(() => fetchJobs(), 100);
  };

  const toggleCheckbox = (arr, setArr, value) => {
    setArr(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const activeFilterCount = [
    country, state, city,
    workModes.length > 0 ? 'y' : '',
    jobTypes.length > 0 ? 'y' : '',
    experienceLevels.length > 0 ? 'y' : '',
    salaryDisclosed,
  ].filter(Boolean).length;

  // Display helpers — use server-computed fields when available
  const formatSalary = (job) => {
    if (job.formattedSalary) return job.formattedSalary;
    if (job.salaryDisclosed === false) return 'Salary not disclosed';
    if (job.salaryText) return job.salaryText;
    return 'Salary not disclosed';
  };

  const formatLocation = (job) => {
    if (job.formattedLocation) return job.formattedLocation;
    if (job.workMode === 'REMOTE') return 'Work From Home / Remote';
    const parts = [job.city, job.state, job.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : (job.location || 'Location not specified');
  };

  const getJobTypeDisplay = (type) => {
    if (!type) return '';
    const map = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', INTERNSHIP: 'Internship', CONTRACT: 'Contract' };
    return map[type] || type.replace('_', ' ');
  };

  const getWorkModeDisplay = (mode) => {
    if (!mode) return '';
    const map = { ONSITE: 'In Office', HYBRID: 'Hybrid', REMOTE: 'Work From Home' };
    return map[mode] || mode;
  };

  const getExperienceDisplay = (level) => {
    if (!level) return '';
    const map = { FRESHER: 'Fresher', ENTRY: 'Entry Level', MID: 'Mid Level', SENIOR: 'Senior', LEAD: 'Lead' };
    return map[level] || level;
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get location name
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || '';
          const state = data.address?.state || '';
          if (city) setLocation(city);
          else if (state) setLocation(state);
          showToast(`Location detected: ${city || state || 'Unknown'}`, 'success');
        } catch {
          showToast('Could not detect your location.', 'error');
        }
      },
      () => showToast('Location access was denied.', 'error')
    );
  };

  // --- Filter Sidebar Content ---
  const filterContent = (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
          <SlidersHorizontal size={18} color="var(--primary)" /> Filters
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.7rem', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>{activeFilterCount}</span>
          )}
        </div>
        <button
          onClick={clearFilters}
          style={{ background: 'none', border: 'none', color: 'var(--status-rejected)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}
        >
          Reset All
        </button>
      </div>

      {/* Location Filters */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={14} color="var(--text-muted)" /> Location
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input 
            type="text" className="form-input" placeholder="Country (e.g. India)" 
            value={country} onChange={(e) => setCountry(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
          />
          <input 
            type="text" className="form-input" placeholder="State (e.g. Gujarat)" 
            value={state} onChange={(e) => setState(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
          />
          <input 
            type="text" className="form-input" placeholder="City (e.g. Vadodara)" 
            value={city} onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
          />
          <button onClick={() => { fetchJobs(); }} className="btn btn-sm btn-secondary" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Apply Location
          </button>
        </div>
      </div>

      {/* Work Mode Filter */}
      <FilterSection title="Workplace" icon={<Globe size={14} color="var(--text-muted)" />}>
        {[
          { label: 'Work From Home', value: 'REMOTE' },
          { label: 'Hybrid', value: 'HYBRID' },
          { label: 'In Office', value: 'ONSITE' }
        ].map((item) => (
          <FilterCheckbox key={item.value} label={item.label} checked={workModes.includes(item.value)}
            onChange={() => toggleCheckbox(workModes, setWorkModes, item.value)} />
        ))}
      </FilterSection>

      {/* Employment Type Filter */}
      <FilterSection title="Employment Type" icon={<Briefcase size={14} color="var(--text-muted)" />}>
        {[
          { label: 'Full Time', value: 'FULL_TIME' },
          { label: 'Part Time', value: 'PART_TIME' },
          { label: 'Internship', value: 'INTERNSHIP' },
          { label: 'Contract', value: 'CONTRACT' }
        ].map((item) => (
          <FilterCheckbox key={item.value} label={item.label} checked={jobTypes.includes(item.value)}
            onChange={() => toggleCheckbox(jobTypes, setJobTypes, item.value)} />
        ))}
      </FilterSection>

      {/* Experience Level Filter */}
      <FilterSection title="Experience Level" icon={<TrendingUp size={14} color="var(--text-muted)" />}>
        {[
          { label: 'Fresher (0 yrs)', value: 'FRESHER' },
          { label: 'Entry Level (0-2 yrs)', value: 'ENTRY' },
          { label: 'Mid Level (2-5 yrs)', value: 'MID' },
          { label: 'Senior (5+ yrs)', value: 'SENIOR' },
          { label: 'Lead / Architect', value: 'LEAD' }
        ].map((item) => (
          <FilterCheckbox key={item.value} label={item.label} checked={experienceLevels.includes(item.value)}
            onChange={() => toggleCheckbox(experienceLevels, setExperienceLevels, item.value)} />
        ))}
      </FilterSection>

      {/* Salary Filter */}
      <FilterSection title="Salary" icon={<Banknote size={14} color="var(--text-muted)" />}>
        {[
          { label: 'Any', value: '' },
          { label: 'Salary Disclosed', value: 'true' },
          { label: 'Salary Not Disclosed', value: 'false' }
        ].map((item) => (
          <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-main)', padding: '0.2rem 0' }}>
            <input type="radio" name="salaryDisclosed" checked={salaryDisclosed === item.value}
              onChange={() => setSalaryDisclosed(item.value)}
              style={{ width: 15, height: 15, accentColor: 'var(--primary)' }}
            />
            {item.label}
          </label>
        ))}
      </FilterSection>
    </>
  );

  return (
    <div style={{ maxWidth: 1340, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem', fontWeight: 800, color: 'var(--text-main)' }}>Explore Job Opportunities</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Find your next role with verified details from real companies.</p>

        <form onSubmit={handleSearchSubmit} className="hero-search-bar" style={{ margin: '1.25rem 0 0', maxWidth: '100%' }}>
          <div className="search-input-group">
            <Search size={18} color="var(--primary)" />
            <input
              type="text"
              placeholder="Job title, skill, or company..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              id="search-keyword-input"
            />
          </div>

          <div className="search-divider" />

          <div className="search-input-group">
            <MapPin size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Country, state, city, or 'Remote'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              id="search-location-input"
            />
            <button type="button" onClick={handleUseMyLocation} title="Use my current location"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
              <Navigation size={16} />
            </button>
          </div>

          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', padding: '0 2rem' }}>
            Search
          </button>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Job Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', alignItems: 'start' }}>
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="card" style={{ padding: '1.25rem', position: 'sticky', top: '90px', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
          id="filter-sidebar">
          {filterContent}
        </aside>

        {/* Results Column */}
        <main>
          {/* Header count and Sort */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ color: 'var(--text-main)', fontWeight: 800 }}>{jobs.length}</span> jobs found
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Sort by:</span>
              <select
                className="form-select"
                style={{ padding: '0.38rem 2rem 0.38rem 0.7rem', fontSize: '0.85rem', width: 'auto', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                id="sort-select"
              >
                <option value="newest">Most Recent</option>
                <option value="deadline">Deadline (Soonest)</option>
                <option value="salary_desc">Salary: High to Low</option>
                <option value="salary_asc">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: 32, height: 32, border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Loading job postings...
            </div>
          ) : jobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Briefcase size={48} color="var(--border-light)" style={{ margin: '0 auto 1.25rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>No matching jobs found</h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '0.925rem' }}>
                Try adjusting your search criteria or clearing some filters to see more results.
              </p>
              <button onClick={clearFilters} className="btn btn-secondary">
                Clear All Filters
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <div key={job.id} className="card card-hover" style={{ padding: '1.35rem 1.5rem', border: '1px solid var(--border-light)', position: 'relative' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    
                    {/* Left details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Company row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden', border: '1px solid var(--border-light)', flexShrink: 0
                        }}>
                          {job.companyLogoUrl ? (
                            <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} />
                          ) : (
                            <Building2 size={22} color="var(--text-light)" />
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{job.companyName}</span>
                          {job.sourceName && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>via {job.sourceName}</span>
                          )}
                        </div>
                      </div>

                      {/* Job Title */}
                      <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 800, lineHeight: 1.3 }}>
                        <Link to={`/jobs/${job.id}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }} className="hover-underline">
                          {job.title}
                        </Link>
                      </h2>

                      {/* Badges row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        <span className="badge" style={{ fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                          {getJobTypeDisplay(job.jobType)}
                        </span>
                        {job.workMode && (
                          <span className="badge" style={{ fontSize: '0.7rem', background: job.workMode === 'REMOTE' ? '#F0FDF4' : 'var(--bg-main)', color: job.workMode === 'REMOTE' ? '#16A34A' : 'var(--text-muted)', border: `1px solid ${job.workMode === 'REMOTE' ? '#DCFCE7' : 'var(--border-light)'}`, fontWeight: 600 }}>
                            {job.workModeDisplay || getWorkModeDisplay(job.workMode)}
                          </span>
                        )}
                        {job.experienceLevel && (
                          <span className="badge" style={{ fontSize: '0.7rem', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 600 }}>
                            {getExperienceDisplay(job.experienceLevel)}
                          </span>
                        )}
                      </div>

                      {/* Info row */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          {job.workMode === 'REMOTE' ? <Globe size={15} color="var(--text-light)" /> : <MapPin size={15} color="var(--text-light)" />}
                          {formatLocation(job)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: job.salaryDisclosed ? 600 : 400, color: job.salaryDisclosed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          <Banknote size={15} color={job.salaryDisclosed ? '#059669' : 'var(--text-light)'} />
                          {formatSalary(job)}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem' }}>
                          <Clock size={14} color="var(--text-light)" />
                          {getTimeAgo(job.createdAt) ? `Posted ${getTimeAgo(job.createdAt)}` : 'Recently posted'}
                          {job.deadline && (
                            <span style={{ marginLeft: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Calendar size={13} color="var(--text-light)" />
                              <span>Apply by {job.deadline}</span>
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Skills */}
                      {job.skills && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {job.skills.split(',').slice(0, 5).map((skill, idx) => (
                            <span key={idx} style={{ padding: '0.18rem 0.55rem', background: 'var(--bg-main)', color: 'var(--text-muted)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 500, border: '1px solid var(--border-subtle)' }}>
                              {skill.trim()}
                            </span>
                          ))}
                          {job.skills.split(',').length > 5 && (
                            <span style={{ padding: '0.18rem 0.55rem', background: 'var(--bg-main)', color: 'var(--text-light)', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 500 }}>
                              +{job.skills.split(',').length - 5}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right action column */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', alignSelf: 'stretch', flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggleSave(job.id, job.savedByCurrentUser)}
                        style={{
                          background: 'transparent', border: 'none', padding: '0.4rem', cursor: 'pointer',
                          color: job.savedByCurrentUser ? 'var(--primary)' : 'var(--text-light)',
                          transition: 'color 0.2s'
                        }}
                        title={job.savedByCurrentUser ? 'Remove from saved' : 'Save job'}
                      >
                        <Bookmark size={20} fill={job.savedByCurrentUser ? 'var(--primary)' : 'none'} />
                      </button>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', marginTop: 'auto' }}>
                        {job.appliedByCurrentUser && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--status-selected)', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Applied
                          </span>
                        )}
                        <Link to={`/jobs/${job.id}`} className="btn btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          View & Apply <ChevronRight size={15} />
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
          text-decoration-color: var(--primary);
          text-underline-offset: 3px;
        }
        @media (max-width: 768px) {
          #filter-sidebar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

// ---- Reusable Filter Components ----

const FilterSection = ({ title, icon, children }) => (
  <div style={{ marginBottom: '1.5rem' }}>
    <label className="form-label" style={{ marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {icon} {title}
    </label>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {children}
    </div>
  </div>
);

const FilterCheckbox = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-main)', padding: '0.2rem 0' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ width: 15, height: 15, accentColor: 'var(--primary)', borderRadius: '3px' }}
    />
    {label}
  </label>
);

export default JobSearchPage;
