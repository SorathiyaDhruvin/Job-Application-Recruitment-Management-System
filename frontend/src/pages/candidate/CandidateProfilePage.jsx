import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Github, 
  Linkedin, 
  Globe, 
  Upload, 
  CheckCircle, 
  ExternalLink,
  Download
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const CandidateProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
    skills: '',
    education: '',
    experienceYears: 0,
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeFileName: '',
    resumeOriginalName: ''
  });

  useEffect(() => {
    api.get('/candidates/profile')
      .then((res) => {
        if (res.data.data) {
          const d = res.data.data;
          setFormData({
            fullName: d.fullName || '',
            phone: d.phone || '',
            location: d.location || '',
            headline: d.headline || '',
            bio: d.bio || '',
            skills: d.skills || '',
            education: d.education || '',
            experienceYears: d.experienceYears || 0,
            githubUrl: d.githubUrl || '',
            linkedinUrl: d.linkedinUrl || '',
            portfolioUrl: d.portfolioUrl || '',
            resumeFileName: d.resumeFileName || '',
            resumeOriginalName: d.resumeOriginalName || ''
          });
        }
      })
      .catch((err) => {
        console.error(err);
        showToast('Error loading profile.', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please upload a valid PDF document.', 'error');
      return;
    }

    const data = new FormData();
    data.append('file', file);

    setUploadingResume(true);
    try {
      const res = await api.post('/files/upload-resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Resume uploaded and attached to your profile!', 'success');
      setFormData((prev) => ({
        ...prev,
        resumeFileName: res.data.data.fileName,
        resumeOriginalName: res.data.data.originalName
      }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Resume upload failed.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/candidates/profile', formData);
      showToast('Profile updated successfully!', 'success');
      updateUserProfile({ fullName: formData.fullName });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Candidate Profile</h1>
        <p style={{ color: '#64748B' }}>Keep your skills, experience, and resume updated for prospective recruiters.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Basic Information */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Basic Information
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="fullName"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Account Login)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ background: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Location</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. San Francisco, CA / Bengaluru, India"
                value={formData.location}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Professional Headline</label>
            <input
              type="text"
              name="headline"
              className="form-input"
              placeholder="e.g. Full Stack Java & React Engineer | Spring Boot & Microservices"
              value={formData.headline}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Summary</label>
            <textarea
              name="bio"
              className="form-textarea"
              rows={4}
              placeholder="Brief summary of your technical background, software passion, and core strengths..."
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Skills & Experience */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Skills & Experience
          </h3>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <input
              type="text"
              name="skills"
              className="form-input"
              placeholder="Java, Spring Boot, React, PostgreSQL, Docker, AWS, REST APIs"
              value={formData.skills}
              onChange={handleChange}
            />
            {formData.skills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                {formData.skills.split(',').filter(Boolean).map((s, idx) => (
                  <span key={idx} className="badge badge-tag">{s.trim()}</span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                name="experienceYears"
                className="form-input"
                value={formData.experienceYears}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Highest Education</label>
              <input
                type="text"
                name="education"
                className="form-input"
                placeholder="e.g. B.Tech in Computer Science, GPA 8.8/10"
                value={formData.education}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Professional Links */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Portfolio & Social Profiles
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub Profile URL</label>
              <input
                type="url"
                name="githubUrl"
                className="form-input"
                placeholder="https://github.com/username"
                value={formData.githubUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                name="linkedinUrl"
                className="form-input"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Portfolio / Website</label>
              <input
                type="url"
                name="portfolioUrl"
                className="form-input"
                placeholder="https://myportfolio.dev"
                value={formData.portfolioUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* PDF Resume Section */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Resume Document (PDF)
          </h3>

          {formData.resumeFileName ? (
            <div style={{
              padding: '1.25rem',
              background: '#F8FAFC',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={22} color="#4F46E5" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0F172A' }}>
                    {formData.resumeOriginalName || formData.resumeFileName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={13} /> Active resume for job applications
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <a
                  href={`/api/files/resume/${formData.resumeFileName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 4 }}
                >
                  <Download size={14} /> Download / View PDF
                </a>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  Upload New PDF
                  <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '2.5rem',
              border: '2px dashed #CBD5E1',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              background: '#F8FAFC'
            }}>
              <Upload size={36} color="#64748B" style={{ margin: '0 auto 0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.35rem' }}>Upload your resume in PDF format</h4>
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Max file size: 10MB. Used by default when submitting 1-click applications.
              </p>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                {uploadingResume ? 'Uploading Resume...' : 'Select PDF File'}
                <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
              </label>
            </div>
          )}
        </div>

        {/* Save Changes Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CandidateProfilePage;
