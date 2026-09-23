import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Code2, Database, Shield } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: '#0F172A',
      color: '#94A3B8',
      padding: '4rem 2rem 2rem',
      borderTop: '1px solid #1E293B',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* Brand info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#ffffff', fontFamily: 'Plus Jakarta Sans', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Briefcase size={18} color="#ffffff" />
            </div>
            Recruit<span style={{ color: 'var(--gold)' }}>Pro</span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '1.25rem' }}>
            Enterprise recruitment and talent acquisition management platform. Empowering ambitious software candidates and forward-thinking engineering recruiters.
          </p>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <span className="badge" style={{ background: '#1E293B', color: '#38BDF8', border: 'none' }}>
              <Database size={12} style={{ marginRight: 4 }} /> PostgreSQL
            </span>
            <span className="badge" style={{ background: '#1E293B', color: '#4ADE80', border: 'none' }}>
              <Code2 size={12} style={{ marginRight: 4 }} /> Spring Boot 3
            </span>
            <span className="badge" style={{ background: '#1E293B', color: '#A78BFA', border: 'none' }}>
              <Shield size={12} style={{ marginRight: 4 }} /> JWT & BCrypt
            </span>
          </div>
        </div>

        {/* Candidate links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>For Candidates</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li><Link to="/jobs" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Explore Open Jobs</Link></li>
            <li><Link to="/candidate/dashboard" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Candidate Dashboard</Link></li>
            <li><Link to="/candidate/applications" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Application Tracker</Link></li>
            <li><Link to="/candidate/profile" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Resume Profile</Link></li>
          </ul>
        </div>

        {/* Recruiter links */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>For Recruiters</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <li><Link to="/recruiter/jobs/new" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Post a Tech Job</Link></li>
            <li><Link to="/recruiter/dashboard" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Hiring Pipeline</Link></li>
            <li><Link to="/recruiter/jobs" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Manage Job Postings</Link></li>
            <li><Link to="/companies" style={{ color: '#94A3B8' }} onMouseEnter={e => e.target.style.color = '#ffffff'} onMouseLeave={e => e.target.style.color = '#94A3B8'}>Companies Directory</Link></li>
          </ul>
        </div>

        {/* System architecture */}
        <div>
          <h4 style={{ color: '#ffffff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>Placement Showcase</h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#94A3B8', marginBottom: '0.75rem' }}>
            Architected with Spring MVC, Data JPA repositories, Spring Security JWT filter chains, BCrypt hashing, and React SPA with responsive design.
          </p>
          <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
            Ideal for Software Engineer & Java Full Stack placement interviews.
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        paddingTop: '2rem',
        borderTop: '1px solid #1E293B',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.85rem'
      }}>
        <div>&copy; {new Date().getFullYear()} RecruitPro. Full Stack Placement Portfolio Project.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          Crafted with <Heart size={14} color="#EF4444" fill="#EF4444" /> for Engineering Excellence
        </div>
      </div>
    </footer>
  );
};

export default Footer;
