import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, ShieldCheck, Image, Save } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CompanyProfilePage = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    location: '',
    logoUrl: ''
  });

  useEffect(() => {
    api.get('/recruiters/profile')
      .then((res) => {
        const p = res.data.data;
        if (p.companyId) {
          return api.get(`/companies/${p.companyId}`);
        }
      })
      .then((res) => {
        if (res && res.data.data) {
          const c = res.data.data;
          setFormData({
            name: c.name || '',
            description: c.description || '',
            website: c.website || '',
            location: c.location || '',
            logoUrl: c.logoUrl || ''
          });
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading company profile.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/recruiters/company', formData);
      showToast('Company profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update company.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading company profile...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Company Organization Profile</h1>
        <p style={{ color: '#64748B' }}>Manage the public presence, branding, and details of your hiring entity.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Form Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. TechCorp Global"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Headquarters / Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. San Francisco, CA / Hybrid"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Website URL</label>
              <input
                type="url"
                name="website"
                className="form-input"
                placeholder="https://company.com"
                value={formData.website}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company Logo Image URL</label>
              <input
                type="url"
                name="logoUrl"
                className="form-input"
                placeholder="https://example.com/logo.png"
                value={formData.logoUrl}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                Paste a direct image link (PNG, JPG, or SVG).
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Company Description &amp; Mission</label>
              <textarea
                name="description"
                className="form-textarea"
                rows={5}
                placeholder="Tell candidates about your mission, product vision, engineering culture, and benefits..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary btn-lg"
              >
                {saving ? 'Saving...' : 'Save Company Details'}
              </button>
            </div>
          </form>
        </div>

        {/* Live Card Preview */}
        <aside>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', marginBottom: '0.75rem' }}>
            Live Candidate Preview
          </div>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-lg)',
              margin: '0 auto 1rem',
              overflow: 'hidden',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #E2E8F0'
            }}>
              {formData.logoUrl ? (
                <img src={formData.logoUrl} alt="Logo preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <Building2 size={36} color="#64748B" />
              )}
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              {formData.name || 'Company Name'}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: '#10B981', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> Verified Employer
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: '0.85rem', color: '#64748B', marginBottom: '1.25rem' }}>
              <MapPin size={13} /> {formData.location || 'Location'}
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {formData.description || 'Company description will appear here for candidates searching jobs.'}
            </p>

            {formData.website && (
              <a
                href={formData.website}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: 6 }}
              >
                <Globe size={14} /> Visit Website
              </a>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
};

export default CompanyProfilePage;
