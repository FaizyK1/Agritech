import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const PestAlertsPage = () => {
  const { user } = useAuth();

  const [alerts, setAlerts] = useState([]);
  const [farms, setFarms] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm: '',
    pestOrDiseaseName: '',
    cropAffected: 'Wheat',
    pestType: 'Insect Pest',
    severity: 'Moderate',
    region: user?.location || 'Northern Agricultural Belt',
    symptoms: '',
    treatmentAdvice: '',
    preventiveMeasures: 'Regular field sanitation, pheromone traps, and clean borders.',
    status: 'Active Warning',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pestsRes, farmsRes] = await Promise.all([
        api.get('/pests'),
        api.get('/farms')
      ]);
      setAlerts(pestsRes.data.data || []);
      setFarms(farmsRes.data.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to retrieve pest alerts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/pests', formData);
      setAlert({ type: 'success', message: 'Outbreak alert submitted to regional surveillance network!' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error submitting pest alert.'
      });
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.put(`/pests/${id}`, { status: newStatus });
      setAlert({ type: 'success', message: `Alert updated to ${newStatus}.` });
      fetchData();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update alert status.' });
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'All') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Title & Actions */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Pest Surveillance & Disease Early Warning</h3>
          <p className="text-muted small mb-0">
            Regional IPM alerts, plant pathology diagnostics, and verified agrochemical & biological remedies
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select form-select-sm shadow-sm"
            style={{ width: '160px' }}
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Critical Outbreak">Critical Outbreak</option>
            <option value="High">High Severity</option>
            <option value="Moderate">Moderate</option>
            <option value="Low">Low</option>
          </select>

          <button onClick={() => setShowModal(true)} className="btn btn-danger btn-sm px-3">
            <i className="bi bi-exclamation-triangle-fill me-1"></i> Report Outbreak
          </button>
        </div>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Scanning regional pest monitoring feeds..." />
      ) : filteredAlerts.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-shield-check text-success" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Active Outbreaks Reported</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            No critical pests or plant pathogens match your filter. You can report observed leaf symptoms or insect infestations.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-agri mt-2">
            <i className="bi bi-plus-lg"></i> Report New Outbreak
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {filteredAlerts.map((item) => (
            <div key={item._id} className="col-12 col-lg-6">
              <div className="agri-card h-100 d-flex flex-column">
                <div className="row g-0 flex-grow-1">
                  <div className="col-md-5 position-relative">
                    <img
                      src={item.imageUrl}
                      alt={item.pestOrDiseaseName}
                      className="w-100 h-100 object-fit-cover rounded-start"
                      style={{ minHeight: '220px' }}
                    />
                    <span className={`position-absolute top-0 start-0 m-2 badge ${
                      item.severity === 'Critical Outbreak' || item.severity === 'High' ? 'bg-danger' : 'bg-warning text-dark'
                    }`}>
                      {item.severity}
                    </span>
                  </div>

                  <div className="col-md-7 p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-light text-success border">
                        {item.cropAffected} • {item.pestType}
                      </span>
                      {item.isVerifiedByExpert && (
                        <span className="badge bg-success bg-opacity-10 text-success small">
                          <i className="bi bi-patch-check-fill me-1"></i> Expert Verified
                        </span>
                      )}
                    </div>

                    <h5 className="fw-bold text-dark mb-1">{item.pestOrDiseaseName}</h5>
                    <small className="text-muted mb-2">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i> {item.region}
                    </small>

                    <div className="small text-muted mb-2">
                      <strong>Symptoms:</strong> {item.symptoms}
                    </div>

                    <div className="p-2 bg-light rounded-3 small text-dark mb-3 border border-light">
                      <strong className="text-success d-block mb-1">
                        <i className="bi bi-capsule"></i> Prescribed Treatment:
                      </strong>
                      {item.treatmentAdvice}
                    </div>

                    <div className="mt-auto pt-2 border-top border-light d-flex justify-content-between align-items-center">
                      <span className="small text-muted">
                        Status: <strong className="text-dark">{item.status}</strong>
                      </span>
                      {item.status === 'Active Warning' && (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'Contained')}
                          className="btn btn-sm btn-outline-success"
                        >
                          Mark Contained
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Report Outbreak */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">Report Pest / Crop Disease Outbreak</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="pestCropInput">Crop Affected</label>
                      <input
                        id="pestCropInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Wheat, Mustard, Paddy"
                        value={formData.cropAffected}
                        onChange={(e) => setFormData({ ...formData, cropAffected: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="pestNameInput">Pest or Pathogen Name</label>
                      <input
                        id="pestNameInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Yellow Rust or Fall Armyworm"
                        value={formData.pestOrDiseaseName}
                        onChange={(e) => setFormData({ ...formData, pestOrDiseaseName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="pestTypeSelect">Pest Classification</label>
                      <select
                        id="pestTypeSelect"
                        className="form-select"
                        value={formData.pestType}
                        onChange={(e) => setFormData({ ...formData, pestType: e.target.value })}
                      >
                        <option value="Insect Pest">Insect Pest</option>
                        <option value="Fungal Disease">Fungal Disease</option>
                        <option value="Bacterial Infection">Bacterial Infection</option>
                        <option value="Viral Infection">Viral Infection</option>
                        <option value="Weed Infestation">Weed Infestation</option>
                        <option value="Nutrient Deficiency">Nutrient Deficiency</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="pestSeveritySelect">Severity Level</label>
                      <select
                        id="pestSeveritySelect"
                        className="form-select"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      >
                        <option value="Critical Outbreak">Critical Outbreak (Spreading)</option>
                        <option value="High">High Severity</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="pestRegionInput">Affected Agro Region</label>
                      <input
                        id="pestRegionInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Punjab Plains"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="pestSymptomsInput">Observed Foliar / Stem Symptoms</label>
                      <textarea
                        id="pestSymptomsInput"
                        rows="2"
                        className="form-control"
                        placeholder="Describe leaf yellowing, pustules, wilting, or insect clustering..."
                        value={formData.symptoms}
                        onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="pestTreatmentInput">Prescribed Chemical or Biological Treatment</label>
                      <textarea
                        id="pestTreatmentInput"
                        rows="2"
                        className="form-control"
                        placeholder="e.g. Propiconazole 25% EC @ 1ml/liter water or Neem oil 5%..."
                        value={formData.treatmentAdvice}
                        onChange={(e) => setFormData({ ...formData, treatmentAdvice: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="pestImageInput">Reference Image URL</label>
                      <input
                        id="pestImageInput"
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Broadcast Pest Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestAlertsPage;
