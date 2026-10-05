import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Save, Sparkles, Building2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CreateEditJobPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    salaryText: '',
    salaryDisclosed: false,
    deadline: '',
    status: 'ACTIVE',
    skills: '',
    country: '',
    state: '',
    city: '',
    workMode: 'ONSITE',
    sourceUrl: '',
    sourceName: ''
  });

  useEffect(() => {
    if (isEditMode) {
      api.get(`/jobs/${id}`)
        .then((res) => {
          const j = res.data.data;
          setFormData({
            title: j.title || '',
            description: j.description || '',
            responsibilities: j.responsibilities || '',
            requirements: j.requirements || '',
            location: j.location || '',
            jobType: j.jobType || 'FULL_TIME',
            experienceLevel: j.experienceLevel || 'MID',
            salaryMin: j.salaryMin || '',
            salaryMax: j.salaryMax || '',
            salaryCurrency: j.salaryCurrency || 'USD',
            salaryText: j.salaryText || '',
            salaryDisclosed: !!j.salaryDisclosed,
            deadline: j.deadline || '',
            status: j.status || 'ACTIVE',
            skills: j.skills || '',
            country: j.country || '',
            state: j.state || '',
            city: j.city || '',
            workMode: j.workMode || 'ONSITE',
            sourceUrl: j.sourceUrl || '',
            sourceName: j.sourceName || ''
          });
        })
        .catch((err) => {
          console.error(err);
          showToast('Failed to load job details.', 'error');
          navigate('/recruiter/jobs');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.location) {
      showToast('Please fill in title, description, and location.', 'error');
      return;
    }

    if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
      showToast('Minimum salary cannot exceed maximum salary.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        salaryCurrency: formData.salaryCurrency || 'USD',
        salaryText: formData.salaryText || null,
        salaryDisclosed: formData.salaryDisclosed,
        deadline: formData.deadline ? formData.deadline : null
      };

      if (isEditMode) {
        await api.put(`/jobs/${id}`, payload);
        showToast('Job listing updated successfully!', 'success');
      } else {
        await api.post('/jobs', payload);
        showToast('New job position posted successfully!', 'success');
      }
      navigate('/recruiter/jobs');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving job posting.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading job information...</div>;
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      <Link to="/recruiter/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748B', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back to Job List
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          {isEditMode ? 'Edit Job Opening' : 'Post a New Engineering Job'}
        </h1>
        <p style={{ color: '#64748B' }}>Define job responsibilities, skills, salary bands, and qualifications.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Core Attributes */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Job Overview
          </h3>

          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Senior Full Stack Java & React Developer"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Job Type *</label>
              <select name="jobType" className="form-select" value={formData.jobType} onChange={handleChange}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Work Mode *</label>
              <select name="workMode" className="form-select" value={formData.workMode} onChange={handleChange}>
                <option value="ONSITE">In Office</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote (Work From Home)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level *</label>
              <select name="experienceLevel" className="form-select" value={formData.experienceLevel} onChange={handleChange}>
                <option value="ENTRY">Entry Level (Fresher / 0-2 yrs)</option>
                <option value="MID">Mid Level (2-5 yrs)</option>
                <option value="SENIOR">Senior Level (5-8 yrs)</option>
                <option value="LEAD">Lead / Architect (8+ yrs)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Country *</label>
              <input
                type="text"
                name="country"
                className="form-input"
                placeholder="e.g. India"
                value={formData.country}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">State / Province</label>
              <input
                type="text"
                name="state"
                className="form-input"
                placeholder="e.g. Gujarat"
                value={formData.state}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                placeholder="e.g. Vadodara"
                value={formData.city}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location (Raw / Fallback) *</label>
              <input
                type="text"
                name="location"
                className="form-input"
                placeholder="e.g. San Francisco, CA / Remote"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Posting Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Active (Accepting Applications)</option>
                <option value="CLOSED">Closed (Archived)</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Timeline */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Compensation &amp; Timeline
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#0F172A' }}>
                <input
                  type="checkbox"
                  name="salaryDisclosed"
                  checked={formData.salaryDisclosed}
                  onChange={handleChange}
                  style={{ width: 16, height: 16 }}
                />
                Disclose Salary to Candidates
              </label>
            </div>

            {formData.salaryDisclosed && (
              <>
                <div className="form-group">
                  <label className="form-label">Currency (e.g. USD, INR, GBP)</label>
                  <input
                    type="text"
                    name="salaryCurrency"
                    className="form-input"
                    placeholder="USD"
                    value={formData.salaryCurrency}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Exact Text (Overrides Min/Max)</label>
                  <input
                    type="text"
                    name="salaryText"
                    className="form-input"
                    placeholder="e.g. $120,000 - $180,000 per year"
                    value={formData.salaryText}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Minimum Annual Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    className="form-input"
                    placeholder="e.g. 100000"
                    value={formData.salaryMin}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Maximum Annual Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    className="form-input"
                    placeholder="e.g. 140000"
                    value={formData.salaryMax}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Application Deadline</label>
              <input
                type="date"
                name="deadline"
                className="form-input"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-subtle)' }}>
            <div className="form-group">
              <label className="form-label">External Source Name (Optional)</label>
              <input
                type="text"
                name="sourceName"
                className="form-input"
                placeholder="e.g. LinkedIn, Workday"
                value={formData.sourceName}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">External Source URL (Optional)</label>
              <input
                type="url"
                name="sourceUrl"
                className="form-input"
                placeholder="https://..."
                value={formData.sourceUrl}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Required Skills & Description */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.6rem' }}>
            Skills &amp; Detailed Description
          </h3>

          <div className="form-group">
            <label className="form-label">Target Technical Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              className="form-input"
              placeholder="Java, Spring Boot, React, PostgreSQL, Docker, AWS, REST APIs"
              value={formData.skills}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Description *</label>
            <textarea
              name="description"
              className="form-textarea"
              rows={4}
              placeholder="Describe the mission, team culture, and problem domain..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Responsibilities</label>
            <textarea
              name="responsibilities"
              className="form-textarea"
              rows={4}
              placeholder="- Architect and implement REST APIs in Spring Boot&#10;- Optimize database schema on PostgreSQL&#10;- Lead code reviews..."
              value={formData.responsibilities}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements &amp; Qualifications</label>
            <textarea
              name="requirements"
              className="form-textarea"
              rows={4}
              placeholder="- Bachelor's degree in Computer Science or equivalent&#10;- 2+ years of professional backend experience&#10;- Strong problem solving abilities..."
              value={formData.requirements}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Link to="/recruiter/jobs" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
          >
            {saving ? 'Publishing...' : isEditMode ? 'Update Job Position' : 'Publish Job Listing'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateEditJobPage;
