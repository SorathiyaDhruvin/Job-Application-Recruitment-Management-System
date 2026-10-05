import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Users,
  Zap,
  Globe,
  DollarSign
} from 'lucide-react';
import api from '../services/api';

const HomePage = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, companiesRes] = await Promise.all([
          api.get('/jobs'),
          api.get('/companies')
        ]);
        setFeaturedJobs(jobsRes.data.data ? jobsRes.data.data.slice(0, 6) : []);
        setCompanies(companiesRes.data.data ? companiesRes.data.data.slice(0, 4) : []);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    navigate(`/jobs?${params.toString()}`);
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
    <div>
      {/* ── Hero Section ── */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="section-label">
            <ShieldCheck size={15} /> Enterprise Recruitment &amp; Candidate Management Platform
          </div>

          <h1 className="hero-title">
            Find Your Next <span>Dream Tech Role</span><br />or Build Elite Engineering Teams
          </h1>

          <p className="hero-subtitle">
            Browse live job openings, explore verified companies, and manage your full recruitment journey — all in one platform. No sign-in required to explore.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hero-search-bar">
            <div className="search-input-group">
              <Search size={20} color="#4F46E5" />
              <input
                type="text"
                placeholder="Job title, skill (e.g. Java, Spring Boot, React)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="search-divider" />

            <div className="search-input-group">
              <MapPin size={20} color="#64748B" />
              <input
                type="text"
                placeholder="City, state, or 'Remote'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', minWidth: 130 }}>
              Search Jobs
            </button>
          </form>

          {/* Quick CTAs for guests */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '1.75rem', flexWrap: 'wrap' }}>
            <Link to="/jobs" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem', fontSize: '0.88rem' }}>
              <Briefcase size={15} /> Browse All Jobs
            </Link>
            <Link to="/companies" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', gap: '0.4rem', fontSize: '0.88rem' }}>
              <Building2 size={15} /> Explore Companies
            </Link>
            <span style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>No account required</span>
          </div>

          {/* Popular Tags */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>Popular:</span>
            {['Java', 'Spring Boot', 'React', 'Full Stack', 'PostgreSQL', 'DevOps'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/jobs?keyword=${tag}`)}
                className="badge badge-tag"
                style={{ cursor: 'pointer' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Metrics Banner ── */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-light)', padding: '2.25rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>12+</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>Active Tech Roles</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent)', fontFamily: 'Plus Jakarta Sans' }}>100%</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>Verified Companies</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--gold)', fontFamily: 'Plus Jakarta Sans' }}>6-Stage</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>Recruitment Workflow</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'Plus Jakarta Sans' }}>Role-Based</div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.25rem' }}>JWT Spring Security</div>
          </div>
        </div>
      </section>

      {/* ── Featured Jobs Section ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}><Briefcase size={14} /> Latest Openings</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Featured Engineering Roles</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Hand-picked high-impact opportunities across top engineering organizations.</p>
          </div>
          <Link to="/jobs" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            View All Jobs <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>Loading featured roles...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {featuredJobs.map((job) => (
              <div key={job.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.5rem', border: '1px solid #E2E8F0', position: 'relative' }}>
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
                      {job.skills.split(',').length > 3 && (
                        <span style={{ padding: '0.15rem 0.5rem', background: '#F1F5F9', color: '#94A3B8', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 500 }}>
                          +{job.skills.split(',').length - 3}
                        </span>
                      )}
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
      </section>

      {/* ── How It Works / Dual Persona ── */}
      <section style={{ background: '#FFFFFF', padding: '5rem 2rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="section-label" style={{ margin: '0 auto 1rem' }}><Zap size={14} /> For Everyone</div>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Built for the Complete Recruitment Lifecycle</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 620, margin: '0 auto' }}>
              Whether you're a software engineer searching for your next role, or a tech recruiter building high-performing teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* Candidate Card */}
            <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
              }}>
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>For Candidates &amp; Students</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={17} color="var(--status-selected)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Comprehensive Profile:</strong> Add skills, education, GPA, GitHub, LinkedIn, and PDF resume.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={17} color="var(--status-selected)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Smart Job Search:</strong> Filter by keyword, location, employment type, and experience level.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={17} color="var(--status-selected)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Live Application Tracker:</strong> Trace stage transitions — Applied → Shortlisted → Interview → Selected.</span>
                </li>
              </ul>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/jobs" className="btn btn-secondary" style={{ flex: 1, minWidth: 120 }}>Browse Jobs</Link>
                <Link to="/register" className="btn btn-primary" style={{ flex: 1, minWidth: 120 }}>Create Account</Link>
              </div>
            </div>

            {/* Recruiter Card */}
            <div className="card" style={{ padding: '2.5rem', border: '1px solid var(--border-light)' }}>
              <div style={{
                width: 52, height: 52, borderRadius: 'var(--radius-lg)',
                background: 'var(--gold-light)', color: 'var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'
              }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>For Technical Recruiters</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={17} color="var(--status-selected)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Company &amp; Job Management:</strong> Create verified profiles and post targeted tech roles.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={17} color="var(--status-selected)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Pipeline Management:</strong> View applicant profiles, inspect resumes, and record interview notes.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={17} color="var(--status-selected)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Instant Status Workflows:</strong> Advance candidates through shortlist, interview, selection, or rejection.</span>
                </li>
              </ul>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/companies" className="btn btn-secondary" style={{ flex: 1, minWidth: 120 }}>View Companies</Link>
                <Link to="/register" className="btn btn-gold" style={{ flex: 1, minWidth: 120 }}>Register as Recruiter</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Top Companies Section ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="section-label" style={{ marginBottom: '0.75rem' }}><Globe size={14} /> Companies Hiring Now</div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Top Verified Companies</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Explore verified enterprise leaders and high-growth technology companies.</p>
          </div>
          <Link to="/companies" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            All Companies <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {companies.map((company) => (
            <div key={company.id} className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: 68, height: 68, borderRadius: 'var(--radius-lg)',
                margin: '0 auto 1.25rem', overflow: 'hidden',
                background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border-light)'
              }}>
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Building2 size={32} color="var(--primary)" />
                )}
              </div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>{company.name}</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--status-selected)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontWeight: 600 }}>
                <ShieldCheck size={13} /> Verified
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <MapPin size={12} /> {company.location}
              </div>
              <p style={{
                fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5,
                marginBottom: '1.25rem', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {company.description}
              </p>
              <Link to={`/jobs?keyword=${company.name}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                View Open Positions
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA Banner ── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        padding: '4rem 2rem', textAlign: 'center'
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', color: '#FFFFFF', marginBottom: '0.75rem' }}>Ready to Take the Next Step?</h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '1.05rem', marginBottom: '2rem', lineHeight: 1.6 }}>
            Create a free account to apply for jobs, track applications, or post open roles. Full access with no fees.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold btn-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn" style={{
              background: 'rgba(255,255,255,0.15)', color: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.3)', borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1.75rem', fontSize: '1.05rem', fontWeight: 600
            }}>
              Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
