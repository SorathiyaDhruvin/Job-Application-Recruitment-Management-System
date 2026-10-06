import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Briefcase, ArrowLeft, Globe, MapPin, Building2, Banknote, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CreateEditJobPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // Initializing state directly matching backend fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    responsibilities: '',
    requirements: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    salaryPeriod: 'YEAR',
    salaryText: '',
    salaryDisclosed: false,
    deadline: '',
    status: 'ACTIVE',
    skills: '',
    // Structured Location
    country: 'India',
    state: '',
    city: '',
    workMode: 'ONSITE',
    // External Source
    sourceUrl: '',
    sourceName: '',
    sourceType: ''
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
            jobType: j.jobType || 'FULL_TIME',
            experienceLevel: j.experienceLevel || 'MID',
            salaryMin: j.salaryMin || '',
            salaryMax: j.salaryMax || '',
            salaryCurrency: 'INR', // Force INR
            salaryPeriod: j.salaryPeriod || 'YEAR',
            salaryText: j.salaryText || '',
            salaryDisclosed: !!j.salaryDisclosed,
            deadline: j.deadline || '',
            status: j.status || 'ACTIVE',
            skills: j.skills || '',
            country: 'India',
            state: j.state || '',
            city: j.city || '',
            workMode: j.workMode || 'ONSITE',
            sourceUrl: j.sourceUrl || '',
            sourceName: j.sourceName || '',
            sourceType: j.sourceType || ''
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
    if (!formData.title || !formData.description) {
      showToast('Please fill in title and description.', 'error');
      return;
    }

    if (formData.salaryMin && formData.salaryMax && Number(formData.salaryMin) > Number(formData.salaryMax)) {
      showToast('Minimum salary cannot exceed maximum salary.', 'error');
      return;
    }

    if (formData.workMode !== 'REMOTE' && !formData.state && !formData.city) {
      showToast('For non-remote roles, please provide at least a City or State.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        salaryMin: formData.salaryMin ? Number(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? Number(formData.salaryMax) : null,
        salaryCurrency: 'INR',
        salaryPeriod: formData.salaryPeriod || 'YEAR',
        salaryText: formData.salaryText || null,
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
    return <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>Loading job information...</div>;
  }

  // Preview Salary String
  const getSalaryPreview = () => {
    if (!formData.salaryDisclosed) return 'Salary not disclosed';
    if (formData.salaryText) return formData.salaryText;
    const cur = '₹';
    let suffix = formData.salaryPeriod === 'MONTH' ? ' / Month' : ' LPA';
    
    // Quick format for preview
    const fmt = (val) => {
      if (formData.salaryPeriod === 'YEAR') {
        return (val / 100000).toFixed(1).replace('.0', '');
      } else {
        return (val / 1000).toFixed(1).replace('.0', '') + 'K';
      }
    };

    if (formData.salaryMin && formData.salaryMax) return `${cur}${fmt(formData.salaryMin)} - ${cur}${fmt(formData.salaryMax)}${suffix}`;
    if (formData.salaryMin) return `From ${cur}${fmt(formData.salaryMin)}${suffix}`;
    if (formData.salaryMax) return `Up to ${cur}${fmt(formData.salaryMax)}${suffix}`;
    return 'Salary disclosed, details missing';
  };

  return (
    <div style={{ maxWidth: 940, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      <Link to="/recruiter/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem', transition: 'color 0.2s' }} className="hover-text-primary">
        <ArrowLeft size={16} /> Back to Job List
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
          {isEditMode ? 'Edit Job Opening' : 'Post a New Job'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Provide accurate, structured details to help candidates find this role.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Core Attributes */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} color="var(--primary)" /> Job Overview
          </h3>

          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              name="title"
              className="form-input"
              placeholder="e.g. Senior Full Stack Engineer"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Employment Type *</label>
              <select name="jobType" className="form-select" value={formData.jobType} onChange={handleChange}>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Experience Level *</label>
              <select name="experienceLevel" className="form-select" value={formData.experienceLevel} onChange={handleChange}>
                <option value="FRESHER">Fresher (0 yrs)</option>
                <option value="ENTRY">Entry Level (0-2 yrs)</option>
                <option value="MID">Mid Level (2-5 yrs)</option>
                <option value="SENIOR">Senior Level (5-8 yrs)</option>
                <option value="LEAD">Lead / Architect (8+ yrs)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Posting Status</label>
              <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">Active (Accepting Applications)</option>
                <option value="CLOSED">Closed (Archived)</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
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
        </div>

        {/* Location Section */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={18} color="var(--primary)" /> Workplace & Location
          </h3>
          
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <HelpCircle size={14} /> The location will be automatically formatted for candidates.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Work Mode *</label>
              <select name="workMode" className="form-select" value={formData.workMode} onChange={handleChange}>
                <option value="ONSITE">In Office</option>
                <option value="HYBRID">Hybrid</option>
                <option value="REMOTE">Remote (Work From Home)</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Country</label>
              <input
                type="text"
                name="country"
                className="form-input"
                value="India"
                disabled
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">State (India)</label>
              <select name="state" className="form-select" value={formData.state} onChange={handleChange} disabled={formData.workMode === 'REMOTE'}>
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                className="form-input"
                placeholder="e.g. Bengaluru"
                value={formData.city}
                onChange={handleChange}
                disabled={formData.workMode === 'REMOTE'}
              />
            </div>
          </div>
        </div>

        {/* Compensation */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Banknote size={18} color="var(--primary)" /> Compensation
          </h3>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600, color: 'var(--text-main)', background: 'var(--bg-main)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <input
                type="checkbox"
                name="salaryDisclosed"
                checked={formData.salaryDisclosed}
                onChange={handleChange}
                style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
              />
              Disclose Salary to Candidates
            </label>
          </div>

          {formData.salaryDisclosed && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', background: '#F8FAFC', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Salary Format</label>
                <select name="salaryPeriod" className="form-select" value={formData.salaryPeriod} onChange={handleChange}>
                  <option value="YEAR">Annual (LPA)</option>
                  <option value="MONTH">Monthly</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Exact Text (Overrides Min/Max)</label>
                <input
                  type="text"
                  name="salaryText"
                  className="form-input"
                  placeholder="e.g. ₹8 LPA - ₹12 LPA"
                  value={formData.salaryText}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Minimum Annual Salary</label>
                <input
                  type="number"
                  name="salaryMin"
                  className="form-input"
                  placeholder="e.g. 800000"
                  value={formData.salaryMin}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Maximum Annual Salary</label>
                <input
                  type="number"
                  name="salaryMax"
                  className="form-input"
                  placeholder="e.g. 1200000"
                  value={formData.salaryMax}
                  onChange={handleChange}
                />
              </div>
              
              <div style={{ gridColumn: '1 / -1', fontSize: '0.85rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.5rem' }}>
                Preview: {getSalaryPreview()}
              </div>
            </div>
          )}
        </div>

        {/* Source & Description */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={18} color="var(--primary)" /> Source & Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">External Source Name (Optional)</label>
              <input
                type="text"
                name="sourceName"
                className="form-input"
                placeholder="e.g. Google Careers, Workday"
                value={formData.sourceName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">External Job / Apply URL (Optional)</label>
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

          <div className="form-group">
            <label className="form-label">Target Technical Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              className="form-input"
              placeholder="Java, Spring Boot, React, PostgreSQL"
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
              placeholder="- Architect and implement APIs&#10;- Optimize database queries..."
              value={formData.responsibilities}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Requirements & Qualifications</label>
            <textarea
              name="requirements"
              className="form-textarea"
              rows={4}
              placeholder="- Bachelor's degree in CS&#10;- 2+ years of experience..."
              value={formData.requirements}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
          <Link to="/recruiter/jobs" className="btn btn-secondary btn-lg">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary btn-lg"
            style={{ minWidth: 200 }}
          >
            {saving ? 'Saving...' : isEditMode ? 'Update Job Position' : 'Publish Job'}
          </button>
        </div>

      </form>
      <style>{`
        .hover-text-primary:hover { color: var(--primary) !important; }
      `}</style>
    </div>
  );
};

export default CreateEditJobPage;
