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
  AlertCircle,
  ExternalLink,
  X
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

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive Compensation';
    if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k / year`;
    return min ? `From $${(min / 1000).toFixed(0)}k` : `Up to $${(max / 1000).toFixed(0)}k`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: '#64748B' }}>
        Loading job posting details...
      </div>
    );
  }

  if (!job) return null;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Back button */}
      <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Search
      </Link>

      {/* Top Job Hero Card */}
      <div className="card" style={{ padding: '2.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '2rem', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minWidth: '280px' }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 'var(--radius-lg)',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '1px solid #E2E8F0',
              flexShrink: 0
            }}>
              {job.companyLogoUrl ? (
                <img src={job.companyLogoUrl} alt={job.companyName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Building2 size={36} color="#64748B" />
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#4F46E5' }}>{job.companyName}</span>
                <span className="badge badge-active">{job.status}</span>
                <span className="badge badge-applied">{job.jobType.replace('_', ' ')}</span>
                <span className="badge badge-tag">{job.experienceLevel}</span>
              </div>

              <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem', color: '#0F172A' }}>
                {job.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem', color: '#64748B', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={16} /> {job.location}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700, color: '#0F172A' }}>
                  <DollarSign size={16} color="#10B981" /> {formatSalary(job.salaryMin, job.salaryMax)}
                </span>
                {job.deadline && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={16} /> Deadline: {job.deadline}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handleToggleSave}
              className="btn btn-secondary"
              style={{
                color: job.savedByCurrentUser ? '#4F46E5' : '#64748B',
                borderColor: job.savedByCurrentUser ? '#C7D2FE' : '#E2E8F0',
                background: job.savedByCurrentUser ? '#EEF2FF' : '#FFFFFF'
              }}
              title={job.savedByCurrentUser ? 'Remove bookmark' : 'Bookmark job'}
            >
              <Bookmark size={18} fill={job.savedByCurrentUser ? '#4F46E5' : 'none'} />
              {job.savedByCurrentUser ? 'Saved' : 'Save'}
            </button>

            {job.appliedByCurrentUser ? (
              <div className="badge badge-selected" style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)' }}>
                <CheckCircle size={18} style={{ marginRight: 6 }} /> Applied
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
                className="btn btn-primary btn-lg"
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Overview */}
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              About the Role
            </h3>
            <p style={{ lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line', fontSize: '0.975rem' }}>
              {job.description}
            </p>
          </div>

          {/* Key Responsibilities */}
          {job.responsibilities && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                Key Responsibilities
              </h3>
              <p style={{ lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line', fontSize: '0.975rem' }}>
                {job.responsibilities}
              </p>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                Qualifications & Requirements
              </h3>
              <p style={{ lineHeight: 1.7, color: '#334155', whiteSpace: 'pre-line', fontSize: '0.975rem' }}>
                {job.requirements}
              </p>
            </div>
          )}

          {/* Required Skills */}
          {job.skills && (
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                Required Technologies & Skills
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {job.skills.split(',').map((skill, idx) => (
                  <span key={idx} className="badge badge-tag" style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem' }}>
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Company & Recruiter Profile */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              About the Company
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: 48,
                height: 48,
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
                  <Building2 size={24} color="#64748B" />
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: '#0F172A' }}>{job.companyName}</div>
                <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <ShieldCheck size={14} /> Verified Employer
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              We build scalable modern engineering solutions with collaborative teams and exceptional technology stacks.
            </p>

            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', gap: '0.4rem' }}
              >
                Visit Website <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Job Overview Metadata */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
              Job Summary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Employment Type:</span>
                <span style={{ fontWeight: 600 }}>{job.jobType.replace('_', ' ')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Experience Level:</span>
                <span style={{ fontWeight: 600 }}>{job.experienceLevel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Location:</span>
                <span style={{ fontWeight: 600 }}>{job.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Total Applicants:</span>
                <span style={{ fontWeight: 600 }}>{job.applicantCount} candidates</span>
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* Application Modal */}
      {applyModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Apply for Position</h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>{job.title} at {job.companyName}</p>
              </div>
              <button onClick={() => setApplyModalOpen(false)} className="modal-close">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleApplySubmit}>
              {/* Candidate Resume Section */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Resume Document (PDF)</label>
                
                {candidateProfile?.resumeFileName ? (
                  <div style={{
                    padding: '1rem',
                    background: '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={20} color="#4F46E5" />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A' }}>
                          {candidateProfile.resumeOriginalName || candidateProfile.resumeFileName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#10B981' }}>Attached from your candidate profile</div>
                      </div>
                    </div>
                    <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                      Change PDF
                      <input type="file" accept=".pdf" onChange={handleResumeFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <div style={{
                    padding: '1.5rem',
                    border: '2px dashed #CBD5E1',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    background: '#F8FAFC',
                    marginBottom: '0.75rem'
                  }}>
                    <Upload size={28} color="#64748B" style={{ margin: '0 auto 0.5rem' }} />
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0F172A', marginBottom: '0.25rem' }}>
                      Upload your PDF resume
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginBottom: '1rem' }}>
                      Supports PDF files up to 10MB
                    </div>
                    <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                      {uploadingResume ? 'Uploading...' : 'Browse Computer'}
                      <input type="file" accept=".pdf" onChange={handleResumeFileUpload} style={{ display: 'none' }} />
                    </label>
                  </div>
                )}
              </div>

              {/* Cover Letter */}
              <div className="form-group">
                <label className="form-label">Cover Letter / Note to Recruiter</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain why you are an ideal fit for this engineering position, highlighting your key project achievements..."
                  rows={5}
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingResume}
                  className="btn btn-primary"
                >
                  {submitting ? 'Submitting Application...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default JobDetailPage;
