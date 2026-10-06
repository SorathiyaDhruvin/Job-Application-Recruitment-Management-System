import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Clock, 
  Bookmark, 
  Share2, 
  CheckCircle, 
  FileText, 
  Upload, 
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
  X,
  Globe,
  Briefcase,
  Users
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCandidate } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  
  // Application form state
  const [coverLetter, setCoverLetter] = useState('');
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchJob = async () => {
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data.data);
    } catch (err) {
      console.error('Failed to load job:', err);
      showToast('Job not found or has been removed.', 'error');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && isCandidate) {
      api.get('/candidates/profile')
        .then((res) => setCandidateProfile(res.data.data))
        .catch((err) => console.error('Error fetching candidate profile:', err));
    }
  }, [isAuthenticated, isCandidate]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      showToast('Please sign in as a candidate to save jobs.', 'info');
      navigate('/login');
      return;
    }
    if (!isCandidate) {
      showToast('Only candidates can bookmark jobs.', 'info');
      return;
    }

    try {
      if (job.savedByCurrentUser) {
        await api.delete(`/candidates/saved-jobs/${job.id}`);
        setJob({ ...job, savedByCurrentUser: false });
        showToast('Job removed from saved list.', 'info');
      } else {
        await api.post(`/candidates/saved-jobs/${job.id}`);
        setJob({ ...job, savedByCurrentUser: true });
        showToast('Job saved to your bookmarks!', 'success');
      }
    } catch (err) {
      showToast('Could not update saved job.', 'error');
    }
  };

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      showToast('Please select a PDF document.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingResume(true);
    try {
      const res = await api.post('/files/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Resume uploaded successfully!', 'success');
      setCandidateProfile((prev) => ({
        ...prev,
        resumeFileName: res.data.data.fileName,
        resumeOriginalName: res.data.data.originalName
      }));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to upload resume.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!candidateProfile?.resumeFileName) {
      showToast('Please upload your resume PDF to apply.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/applications', {
        jobId: job.id,
        coverLetter: coverLetter,
        resumeFileName: candidateProfile.resumeFileName
      });

      showToast('Application submitted successfully! Track progress in your dashboard.', 'success');
      setJob({ ...job, appliedByCurrentUser: true });
      setApplyModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

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

  const getWorkModeDisplay = (mode) => {
    if (!mode) return '';
    const map = { ONSITE: 'In Office', HYBRID: 'Hybrid', REMOTE: 'Work From Home' };
    return map[mode] || mode;
  };
  
  const getJobTypeDisplay = (type) => {
    if (!type) return '';
    const map = { FULL_TIME: 'Full Time', PART_TIME: 'Part Time', INTERNSHIP: 'Internship', CONTRACT: 'Contract' };
    return map[type] || type.replace('_', ' ');
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
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
        <div className="spinner" style={{ margin: '0 auto 1rem', width: 36, height: 36, border: '3px solid var(--border-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        Loading job posting details...
      </div>
    );
  }

  if (!job) return null;

  return (
    <div style={{ maxWidth: 1240, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      
      {/* Back button */}
      <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: 600, transition: 'color 0.2s' }} className="hover-text-primary">
        <ArrowLeft size={16} /> Back to Search
      </Link>

      {/* Top Job Hero Card */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', gap: '1.25rem', flex: 1, minWidth: '280px' }}>
            <div style={{
              width: 68,
              height: 68,
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid var(--border-light)',
              flexShrink: 0
            }}>
              {job.companyLogoUrl ? (
                <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
              ) : (
                <Building2 size={32} color="var(--text-light)" />
              )}
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{job.companyName}</span>
                {job.sourceName && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', borderLeft: '1px solid var(--border-light)', paddingLeft: '0.6rem' }}>via {job.sourceName}</span>
                )}
                <span className="badge badge-active" style={{ marginLeft: '0.25rem', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>{job.status}</span>
              </div>

              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', lineHeight: 1.25 }}>
                {job.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
                <span className="badge" style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}>
                  {getJobTypeDisplay(job.jobType)}
                </span>
                {job.workMode && (
                  <span className="badge" style={{ fontSize: '0.75rem', background: job.workMode === 'REMOTE' ? '#F0FDF4' : 'var(--bg-main)', color: job.workMode === 'REMOTE' ? '#16A34A' : 'var(--text-muted)', border: `1px solid ${job.workMode === 'REMOTE' ? '#DCFCE7' : 'var(--border-light)'}`, fontWeight: 600 }}>
                    {job.workModeDisplay || getWorkModeDisplay(job.workMode)}
                  </span>
                )}
                <span className="badge" style={{ fontSize: '0.75rem', background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA', fontWeight: 600 }}>
                  {getExperienceDisplay(job.experienceLevel)}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {job.workMode === 'REMOTE' ? <Globe size={16} color="var(--text-light)" /> : <MapPin size={16} color="var(--text-light)" />}
                  {formatLocation(job)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontWeight: job.salaryDisclosed ? 600 : 400, color: job.salaryDisclosed ? 'var(--text-main)' : 'var(--text-muted)' }}>
                  <DollarSign size={16} color={job.salaryDisclosed ? '#059669' : 'var(--text-light)'} /> 
                  {formatSalary(job)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Clock size={15} color="var(--text-light)" /> 
                  Posted {getTimeAgo(job.createdAt) || 'Recently'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <button
              onClick={handleToggleSave}
              className="btn btn-secondary"
              style={{
                color: job.savedByCurrentUser ? 'var(--primary)' : 'var(--text-main)',
                borderColor: job.savedByCurrentUser ? 'var(--primary)' : 'var(--border-light)',
                background: job.savedByCurrentUser ? 'var(--primary-light)' : '#FFFFFF',
                padding: '0.65rem 1rem'
              }}
              title={job.savedByCurrentUser ? 'Remove bookmark' : 'Bookmark job'}
            >
              <Bookmark size={18} fill={job.savedByCurrentUser ? 'var(--primary)' : 'none'} />
              {job.savedByCurrentUser ? 'Saved' : 'Save'}
            </button>
            <button className="btn btn-secondary" style={{ padding: '0.65rem 1rem' }} title="Share">
              <Share2 size={18} />
            </button>

            {job.appliedByCurrentUser ? (
              <div className="badge badge-selected" style={{ padding: '0.7rem 1.25rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={18} style={{ marginRight: 6 }} /> Applied
              </div>
            ) : job.sourceUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
                >
                  Apply on Source <ExternalLink size={16} style={{ marginLeft: 6 }} />
                </a>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                  Applies on {job.sourceName || job.companyName}
                </span>
              </div>
            ) : (
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    showToast('Please sign in as a candidate to apply.', 'info');
                    navigate('/login');
                  } else if (!isCandidate) {
                    showToast('Only candidates can submit job applications.', 'info');
                  } else {
                    setApplyModalOpen(true);
                  }
                }}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
              >
                Apply Now
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Content Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        
        {/* Left Column: Job Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '2rem' }}>
            {/* Overview */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="var(--primary)" /> About the Role
              </h3>
              <p style={{ lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                {job.description}
              </p>
            </div>

            {/* Key Responsibilities */}
            {job.responsibilities && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase size={20} color="var(--primary)" /> Key Responsibilities
                </h3>
                <div style={{ lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line', fontSize: '0.95rem', paddingLeft: '1rem', borderLeft: '3px solid var(--border-light)' }}>
                  {job.responsibilities}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={20} color="var(--primary)" /> Qualifications & Requirements
                </h3>
                <div style={{ lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line', fontSize: '0.95rem', paddingLeft: '1rem', borderLeft: '3px solid var(--border-light)' }}>
                  {job.requirements}
                </div>
              </div>
            )}

            {/* Required Skills */}
            {job.skills && (
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
                  Technologies & Skills
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {job.skills.split(',').map((skill, idx) => (
                    <span key={idx} className="badge" style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)' }}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Company & Metadata */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Company Profile */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem', color: 'var(--text-main)' }}>
              About the Company
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-md)',
                background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', border: '1px solid var(--border-light)', flexShrink: 0
              }}>
                {job.companyLogoUrl ? (
                  <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                ) : (
                  <Building2 size={24} color="var(--text-light)" />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>{job.companyName}</div>
                <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 3, fontWeight: 600, marginTop: 2 }}>
                  <ShieldCheck size={14} /> Verified Employer
                </div>
              </div>
            </div>

            {/* Real company data instead of placeholder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {job.companyIndustry && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Building2 size={15} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{job.companyIndustry}</span>
                </div>
              )}
              {job.companyHeadquarters && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={15} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{job.companyHeadquarters}</span>
                </div>
              )}
              {job.companySize && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Users size={15} style={{ marginTop: 2, flexShrink: 0 }} />
                  <span>{job.companySize} employees</span>
                </div>
              )}
            </div>

            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: '0.4rem', justifyContent: 'center' }}
              >
                Visit Website <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Job Overview Metadata */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem', color: 'var(--text-main)' }}>
              Job Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '65%', color: 'var(--text-main)' }}>{formatLocation(job)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Work Mode:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{job.workModeDisplay || getWorkModeDisplay(job.workMode)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Job Type:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{getJobTypeDisplay(job.jobType)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Experience:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{getExperienceDisplay(job.experienceLevel)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Salary:</span>
                <span style={{ fontWeight: 600, color: job.salaryDisclosed ? '#059669' : 'var(--text-muted)' }}>{formatSalary(job)}</span>
              </div>
              
              {(job.sourceName || job.sourceType) && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border-light)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {job.sourceName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Source:</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{job.sourceName}</span>
                    </div>
                  )}
                  {job.lastVerifiedAt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Verified On:</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{new Date(job.lastVerifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Applicants:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{job.applicantCount}</span>
              </div>
              {job.deadline && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--status-rejected-bg)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--status-rejected)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={14}/> Deadline:</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-rejected)' }}>{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

        </aside>

      </div>

      {/* Internal Application Modal */}
      {applyModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(13, 31, 53, 0.4)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Apply for Position</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{job.title} at <span style={{ fontWeight: 600 }}>{job.companyName}</span></p>
              </div>
              <button onClick={() => setApplyModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: 'var(--text-light)' }} className="hover-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} style={{ padding: '1.5rem' }}>
              {/* Candidate Resume Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Resume Document (PDF) *</label>
                
                {candidateProfile?.resumeFileName ? (
                  <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ padding: '0.5rem', background: '#fff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                        <FileText size={20} color="var(--primary)" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {candidateProfile.resumeOriginalName || candidateProfile.resumeFileName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                          <CheckCircle size={12} /> Attached from profile
                        </div>
                      </div>
                    </div>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '0.4rem 0.75rem' }}>
                      Change PDF
                      <input type="file" accept=".pdf" onChange={handleResumeFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <div style={{ padding: '1.75rem 1.5rem', border: '2px dashed var(--border-light)', borderRadius: 'var(--radius-md)', textAlign: 'center', background: 'var(--bg-main)' }}>
                    <Upload size={28} color="var(--text-light)" style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                      Upload your PDF resume
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                      Supports PDF files up to 10MB
                    </div>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer', padding: '0.5rem 1rem' }}>
                      {uploadingResume ? 'Uploading...' : 'Browse Computer'}
                      <input type="file" accept=".pdf" onChange={handleResumeFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cover Letter / Note to Recruiter (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain why you are an ideal fit for this engineering position, highlighting your key project achievements..."
                  rows={4}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                <button type="button" onClick={() => setApplyModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || uploadingResume || !candidateProfile?.resumeFileName} className="btn btn-primary">
                  {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .hover-text-primary:hover { color: var(--primary) !important; }
      `}</style>
    </div>
  );
};

export default JobDetailPage;
