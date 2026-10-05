import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  FileText, Github, Linkedin, Globe, Upload, CheckCircle, 
  ExternalLink, Download, Plus, Trash2 
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
  
  // Projects state
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: '', description: '', projectUrl: '', githubUrl: '' });
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    location: '',
    headline: '',
    bio: '',
    skills: '',
    softSkills: '',
    education: '',
    cgpa: '',
    graduationYear: '',
    experienceYears: 0,
    workExperienceDetails: '',
    internships: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeFileName: '',
    resumeOriginalName: '',
    profileCompletionPercentage: 0
  });

  const fetchProfile = async () => {
    try {
      const res = await api.get('/candidates/profile');
      if (res.data.data) {
        const d = res.data.data;
        setFormData({
          fullName: d.fullName || '',
          phone: d.phone || '',
          location: d.location || '',
          headline: d.headline || '',
          bio: d.bio || '',
          skills: d.skills || '',
          softSkills: d.softSkills || '',
          education: d.education || '',
          cgpa: d.cgpa || '',
          graduationYear: d.graduationYear || '',
          experienceYears: d.experienceYears || 0,
          workExperienceDetails: d.workExperienceDetails || '',
          internships: d.internships || '',
          githubUrl: d.githubUrl || '',
          linkedinUrl: d.linkedinUrl || '',
          portfolioUrl: d.portfolioUrl || '',
          resumeFileName: d.resumeFileName || '',
          resumeOriginalName: d.resumeOriginalName || '',
          profileCompletionPercentage: d.profileCompletionPercentage || 0
        });
        setProjects(d.projects || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
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
      // Refetch profile to update completion percentage
      fetchProfile();
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
      fetchProfile(); // refresh completion %
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProject.title) {
      showToast('Project title is required', 'warning');
      return;
    }
    try {
      await api.post('/candidates/projects', newProject);
      showToast('Project added successfully', 'success');
      setNewProject({ title: '', description: '', projectUrl: '', githubUrl: '' });
      setShowProjectForm(false);
      fetchProfile();
    } catch (error) {
      showToast('Failed to add project', 'error');
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`/candidates/projects/${id}`);
      showToast('Project deleted', 'success');
      fetchProfile();
    } catch (error) {
      showToast('Failed to delete project', 'error');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Candidate Profile</h1>
          <p style={{ color: '#64748B' }}>Keep your skills, experience, and resume updated for prospective recruiters.</p>
        </div>
        
        {/* Profile Completion Badge */}
        <div style={{ 
          background: 'white', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', 
          border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '150px'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600, marginBottom: '0.5rem' }}>Profile Completion</div>
          <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div style={{ 
              height: '100%', 
              background: formData.profileCompletionPercentage === 100 ? '#10B981' : '#4F46E5', 
              width: `${formData.profileCompletionPercentage}%`,
              transition: 'width 0.5s ease-in-out'
            }}></div>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{formData.profileCompletionPercentage}%</div>
        </div>
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
              <input type="text" name="fullName" className="form-input" value={formData.fullName} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Account Login)</label>
              <input type="email" className="form-input" value={user?.email || ''} disabled style={{ background: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="text" name="phone" className="form-input" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Current Location</label>
              <input type="text" name="location" className="form-input" placeholder="e.g. San Francisco, CA / Bengaluru, India" value={formData.location} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label">Professional Headline</label>
            <input type="text" name="headline" className="form-input" placeholder="e.g. Full Stack Java & React Engineer | Spring Boot & Microservices" value={formData.headline} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Bio / Summary</label>
            <textarea name="bio" className="form-textarea" rows={4} placeholder="Brief summary of your technical background, software passion, and core strengths..." value={formData.bio} onChange={handleChange} />
          </div>
        </div>

        {/* Skills & Experience */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Skills & Expertise
          </h3>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <input type="text" name="skills" className="form-input" placeholder="Java, Spring Boot, React, PostgreSQL, Docker" value={formData.skills} onChange={handleChange} />
            {formData.skills && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.75rem' }}>
                {formData.skills.split(',').filter(Boolean).map((s, idx) => (
                  <span key={idx} className="badge badge-tag">{s.trim()}</span>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Soft Skills (comma-separated)</label>
            <input type="text" name="softSkills" className="form-input" placeholder="Leadership, Communication, Agile, Problem Solving" value={formData.softSkills} onChange={handleChange} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Years of Experience</label>
              <input type="number" min="0" max="50" name="experienceYears" className="form-input" value={formData.experienceYears} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Work Experience Details</label>
            <textarea name="workExperienceDetails" className="form-textarea" rows={3} placeholder="Describe your past roles, companies, and achievements..." value={formData.workExperienceDetails} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label className="form-label">Internships</label>
            <textarea name="internships" className="form-textarea" rows={2} placeholder="List any internships completed..." value={formData.internships} onChange={handleChange} />
          </div>
        </div>
        
        {/* Education */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Education
          </h3>
          
          <div className="form-group">
            <label className="form-label">Highest Education</label>
            <input type="text" name="education" className="form-input" placeholder="e.g. B.Tech in Computer Science" value={formData.education} onChange={handleChange} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
             <div className="form-group">
              <label className="form-label">CGPA / Percentage</label>
              <input type="number" step="0.01" name="cgpa" className="form-input" placeholder="e.g. 8.5" value={formData.cgpa} onChange={handleChange} />
            </div>
             <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input type="number" name="graduationYear" className="form-input" placeholder="e.g. 2024" value={formData.graduationYear} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <button type="submit" disabled={saving} className="btn btn-primary btn-lg">
            {saving ? 'Saving Changes...' : 'Save Profile Details'}
          </button>
        </div>

      </form>
      
      {/* Projects Section (Independent of the form) */}
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            Projects
          </h3>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProjectForm(!showProjectForm)} style={{ gap: 4 }}>
            <Plus size={16} /> Add Project
          </button>
        </div>

        {showProjectForm && (
          <div style={{ background: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>New Project Details</h4>
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input type="text" className="form-input" value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={2} value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}></textarea>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Live Project URL</label>
                <input type="url" className="form-input" value={newProject.projectUrl} onChange={e => setNewProject({...newProject, projectUrl: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">GitHub Source URL</label>
                <input type="url" className="form-input" value={newProject.githubUrl} onChange={e => setNewProject({...newProject, githubUrl: e.target.value})} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowProjectForm(false)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleAddProject}>Save Project</button>
            </div>
          </div>
        )}

        {projects.length === 0 ? (
          <p style={{ color: '#64748B', textAlign: 'center', padding: '2rem 0' }}>No projects added yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{ padding: '1.25rem', border: '1px solid #E2E8F0', borderRadius: 'var(--radius-md)', background: '#fff', position: 'relative' }}>
                <button 
                  onClick={() => handleDeleteProject(proj.id)}
                  style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                  title="Delete Project"
                >
                  <Trash2 size={18} />
                </button>
                <h4 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem', paddingRight: '2rem' }}>{proj.title}</h4>
                {proj.description && <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>{proj.description}</p>}
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {proj.projectUrl && (
                    <a href={proj.projectUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: '#4F46E5', fontWeight: 600 }}>
                      <Globe size={14} /> Live Demo
                    </a>
                  )}
                  {proj.githubUrl && (
                    <a href={proj.githubUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', color: '#0F172A', fontWeight: 600 }}>
                      <Github size={14} /> Source Code
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Professional Links */}
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
          Portfolio & Social Profiles
        </h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">GitHub Profile URL</label>
              <input type="url" name="githubUrl" className="form-input" placeholder="https://github.com/username" value={formData.githubUrl} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input type="url" name="linkedinUrl" className="form-input" placeholder="https://linkedin.com/in/username" value={formData.linkedinUrl} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Personal Portfolio / Website</label>
              <input type="url" name="portfolioUrl" className="form-input" placeholder="https://myportfolio.dev" value={formData.portfolioUrl} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={saving} className="btn btn-primary">Save Links</button>
          </div>
        </form>
      </div>

      {/* PDF Resume Section */}
      <div className="card" style={{ padding: '2rem', marginTop: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
          Resume Document (PDF)
        </h3>

        {formData.resumeFileName ? (
          <div style={{
            padding: '1.25rem', background: '#F8FAFC', borderRadius: 'var(--radius-md)',
            border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem'
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
              <a href={`/api/files/resume/${formData.resumeFileName}`} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ gap: 4 }}>
                <Download size={14} /> Download / View PDF
              </a>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                Upload New PDF
                <input type="file" accept=".pdf" onChange={handleResumeUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2.5rem', border: '2px dashed #CBD5E1', borderRadius: 'var(--radius-lg)', textAlign: 'center', background: '#F8FAFC' }}>
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

    </div>
  );
};

export default CandidateProfilePage;
