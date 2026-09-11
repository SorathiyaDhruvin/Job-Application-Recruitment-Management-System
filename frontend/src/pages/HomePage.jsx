import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Users, 
  Layers 
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

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive Salary';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k / yr`;
    return min ? `From $${(min / 1000).toFixed(0)}k` : `Up to $${(max / 1000).toFixed(0)}k`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '1.5rem'
          }}>
            <ShieldCheck size={16} /> Enterprise Recruitment & Candidate Management Platform
          </div>

          <h1 className="hero-title">
            Land Your Next <span>Dream Tech Job</span> Or Hire Proven Engineering Talent
          </h1>

          <p className="hero-subtitle">
            A comprehensive recruitment ecosystem featuring end-to-end candidate tracking, real-time application pipelines, verified company profiles, and role-based access.
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

            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)' }}>
              Search Jobs
            </button>
          </form>

          {/* Popular Tag Pills */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>Popular:</span>
            {['Java', 'Spring Boot', 'React', 'Full Stack', 'PostgreSQL', 'DevOps'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => navigate(`/jobs?keyword=${tag}`)}
                className="badge badge-tag"
                style={{ cursor: 'pointer', border: '1px solid #E2E8F0', background: '#FFFFFF' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Highlight Metrics Banner */}
      <section style={{ background: '#FFFFFF', borderBottom: '1px solid var(--border-light)', padding: '2.5rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)', fontFamily: 'Plus Jakarta Sans' }}>12+</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>Active Tech Roles</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0EA5E9', fontFamily: 'Plus Jakarta Sans' }}>100%</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>Verified Companies</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#10B981', fontFamily: 'Plus Jakarta Sans' }}>6-Stage</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>Recruitment Workflow</div>
          </div>
          <div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#8B5CF6', fontFamily: 'Plus Jakarta Sans' }}>Role-Based</div>
            <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 600 }}>JWT Spring Security</div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Featured Engineering Openings</h2>
            <p style={{ color: '#64748B', fontSize: '1rem' }}>Hand-picked high impact opportunities across top engineering organizations.</p>
          </div>
          <Link to="/jobs" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            View All Jobs <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: '#64748B' }}>Loading featured roles...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {featuredJobs.map((job) => (
              <div key={job.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  {/* Top Bar: Company logo + Type badge */}
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
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A' }}>{job.companyName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={12} /> {job.location}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-applied">{job.jobType.replace('_', ' ')}</span>
                  </div>

                  {/* Job Title */}
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', fontWeight: 700 }}>
                    <Link to={`/jobs/${job.id}`} style={{ color: '#0F172A', transition: 'color 0.15s' }}>
                      {job.title}
                    </Link>
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748B',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  {job.skills && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                      {job.skills.split(',').slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="badge badge-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer: Salary + Action */}
                <div style={{
                  borderTop: '1px solid #F1F5F9',
                  paddingTop: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </div>
                  <Link to={`/jobs/${job.id}`} className="btn btn-primary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dual Persona Showcase: How it Works */}
      <section style={{ background: '#FFFFFF', padding: '5rem 2rem', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>Built for the Complete Recruitment Lifecycle</h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: 640, margin: '0 auto' }}>
              Whether you are an aspiring software engineer preparing for placements or a tech recruiter building high-performing teams.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
            {/* Candidate Card */}
            <div className="card" style={{ padding: '2.5rem', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Users size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>For Candidates & Students</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', color: '#475569', fontSize: '0.925rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Comprehensive Profile:</strong> Add skills, education, GPA, GitHub, LinkedIn, and PDF resume.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Smart Job Search:</strong> Filter by keyword, location, employment type, and experience level.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Live Application Tracker:</strong> Trace stage transitions: Applied &rarr; Under Review &rarr; Shortlisted &rarr; Interview &rarr; Selected.</span>
                </li>
              </ul>
              <Link to="/register" className="btn btn-primary" style={{ width: '100%' }}>
                Create Candidate Account
              </Link>
            </div>

            {/* Recruiter Card */}
            <div className="card" style={{ padding: '2.5rem', background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)' }}>
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-lg)',
                background: 'var(--secondary-light)',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Briefcase size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>For Technical Recruiters</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', color: '#475569', fontSize: '0.925rem', marginBottom: '2rem' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Company & Job Management:</strong> Create verified organization profiles and post targeted tech roles.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Pipeline Management:</strong> View applicant profiles, inspect resumes, and record interview notes.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <CheckCircle size={18} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span><strong>Instant Status Workflows:</strong> Advance candidates through shortlist, interview, selection, or rejection.</span>
                </li>
              </ul>
              <Link to="/register" className="btn btn-secondary" style={{ width: '100%' }}>
                Register as Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Hiring Companies Section */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Top Verified Companies Hiring Now</h2>
          <p style={{ color: '#64748B', fontSize: '1rem' }}>Explore verified enterprise leaders and high-growth technology pioneers.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {companies.map((company) => (
            <div key={company.id} className="card card-hover" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
              <div style={{
                width: 68,
                height: 68,
                borderRadius: 'var(--radius-lg)',
                margin: '0 auto 1.25rem',
                overflow: 'hidden',
                background: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #E2E8F0'
              }}>
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Building2 size={32} color="#64748B" />
                )}
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>{company.name}</h4>
              <div style={{ fontSize: '0.825rem', color: '#64748B', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <MapPin size={13} /> {company.location}
              </div>
              <p style={{
                fontSize: '0.85rem',
                color: '#64748B',
                lineHeight: 1.5,
                marginBottom: '1.25rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
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
    </div>
  );
};

export default HomePage;
