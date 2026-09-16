import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  PlusCircle, 
  Users, 
  Edit3, 
  Trash2, 
  Eye, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MyJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchMyJobs = async () => {
    try {
      const res = await api.get('/recruiters/jobs');
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
      showToast('Error fetching your job postings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/jobs/${jobId}`);
      showToast('Job posting deleted successfully.', 'success');
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      showToast('Failed to delete job.', 'error');
    }
  };

  const handleToggleStatus = async (job) => {
    const newStatus = job.status === 'ACTIVE' ? 'CLOSED' : 'ACTIVE';
    try {
      const res = await api.put(`/jobs/${job.id}`, {
        ...job,
        status: newStatus
      });
      showToast(`Job marked as ${newStatus}.`, 'success');
      setJobs((prev) => prev.map((j) => (j.id === job.id ? res.data.data : j)));
    } catch (err) {
      showToast('Failed to update job status.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '2.5rem 2rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.35rem' }}>Manage Job Postings</h1>
          <p style={{ color: '#64748B' }}>Create, update, monitor applicant volumes, and close postings.</p>
        </div>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">
          <PlusCircle size={16} /> Post New Job
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748B' }}>Loading your postings...</div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Briefcase size={44} color="#CBD5E1" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No job postings found</h3>
          <p style={{ color: '#64748B', maxWidth: 420, margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Get started by posting your first engineering role to begin receiving qualified candidate applications.
          </p>
          <Link to="/recruiter/jobs/new" className="btn btn-primary btn-sm">Create Job Listing</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Type &amp; Level</th>
                <th>Location</th>
                <th>Applicants</th>
                <th>Deadline</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td>
                    <Link to={`/jobs/${job.id}`} style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                      {job.title}
                    </Link>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Posted {new Date(job.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-applied" style={{ fontSize: '0.75rem' }}>
                        {job.jobType.replace('_', ' ')}
                      </span>
                      <span className="badge badge-tag" style={{ fontSize: '0.75rem' }}>
                        {job.experienceLevel}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem' }}>
                      <MapPin size={13} color="#64748B" /> {job.location}
                    </div>
                  </td>
                  <td>
                    <Link
                      to={`/recruiter/jobs/${job.id}/applicants`}
                      className="badge badge-shortlist"
                      style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                    >
                      <Users size={13} style={{ marginRight: 4 }} /> {job.applicantCount} Applicants
                    </Link>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    {job.deadline || 'Ongoing'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleStatus(job)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      title="Click to toggle Active / Closed"
                    >
                      <span className={`badge ${job.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}`}>
                        {job.status}
                      </span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <Link
                        to={`/recruiter/jobs/${job.id}/applicants`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
                      >
                        <Users size={13} /> Review
                      </Link>
                      <Link
                        to={`/recruiter/jobs/${job.id}/edit`}
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '0.35rem 0.6rem' }}
                        title="Edit Job"
                      >
                        <Edit3 size={15} />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#EF4444', padding: '0.35rem 0.6rem' }}
                        title="Delete Job"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default MyJobsPage;
