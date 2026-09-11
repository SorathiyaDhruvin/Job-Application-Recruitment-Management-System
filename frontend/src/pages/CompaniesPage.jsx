import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Globe, ShieldCheck, Briefcase, ExternalLink } from 'lucide-react';
import api from '../services/api';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/companies')
      .then((res) => setCompanies(res.data.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>Top Hiring Companies</h1>
        <p style={{ color: '#64748B', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>
          Connect with trusted technology leaders actively growing their engineering, devops, and cloud departments.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading organizations...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {companies.map((company) => (
            <div key={company.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 60,
                    height: 60,
                    borderRadius: 'var(--radius-lg)',
                    background: '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0'
                  }}>
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Building2 size={30} color="#64748B" />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.2rem' }}>{company.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                      <ShieldCheck size={14} /> Verified Organization
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', color: '#64748B', marginBottom: '1rem' }}>
                  <MapPin size={15} /> {company.location || 'Global / Remote'}
                </div>

                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {company.description}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                <Link to={`/jobs?keyword=${company.name}`} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Briefcase size={14} /> Open Roles
                </Link>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    title="Visit website"
                  >
                    <Globe size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompaniesPage;
