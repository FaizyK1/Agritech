import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const SoilPage = () => {
  const [tests, setTests] = useState([]);
  const [farms, setFarms] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm: '',
    laboratoryName: 'AgriTech Central Soil Testing Laboratory',
    sampleDepth: '0 - 15 cm (Tillage layer)',
    nitrogen: 280,
    phosphorus: 25,
    potassium: 190,
    pH: 6.8,
    organicCarbon: 0.65,
    electricalConductivity: 0.35,
    moisturePercent: 28
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testsRes, farmsRes] = await Promise.all([
        api.get('/soil'),
        api.get('/farms')
      ]);

      const testList = testsRes.data.data || [];
      const farmList = farmsRes.data.data || [];

      setTests(testList);
      setFarms(farmList);
      if (testList.length > 0) {
        setSelectedTest(testList[0]);
      }
      if (farmList.length > 0) {
        setFormData((prev) => ({ ...prev, farm: farmList[0]._id }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to retrieve soil test data.' });
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
      const payload = {
        farm: formData.farm,
        laboratoryName: formData.laboratoryName,
        sampleDepth: formData.sampleDepth,
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium),
        pH: Number(formData.pH),
        organicCarbon: Number(formData.organicCarbon),
        electricalConductivity: Number(formData.electricalConductivity),
        moisturePercent: Number(formData.moisturePercent)
      };

      const res = await api.post('/soil', payload);
      setAlert({ type: 'success', message: 'Soil test record logged and agronomic advice calculated!' });
      setShowModal(false);
      fetchData();
      if (res.data.data) {
        setSelectedTest(res.data.data);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error recording soil test.'
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this soil test record?')) {
      try {
        await api.delete(`/soil/${id}`);
        setAlert({ type: 'success', message: 'Soil test record deleted.' });
        fetchData();
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to delete record.' });
      }
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title & Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Soil Health Intelligence & N-P-K Telemetry</h3>
          <p className="text-muted small mb-0">
            Automated macro-nutrient analysis, pH correction advisories, and fertilizer dosage calculators
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-agri"
          disabled={farms.length === 0}
        >
          <i className="bi bi-plus-lg"></i> Log Laboratory Soil Sample
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Analyzing soil chemistry diagnostics..." />
      ) : tests.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-moisture text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Soil Health Records Found</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            Record your laboratory soil test results (Nitrogen, Phosphorus, Potassium, pH) to receive scientific fertilizer dose recommendations.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-agri mt-2"
            disabled={farms.length === 0}
          >
            <i className="bi bi-plus-lg"></i> Enter First Soil Test
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Column: List of Tests */}
          <div className="col-lg-4">
            <div className="agri-card p-3 h-100">
              <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                Test Reports History ({tests.length})
              </h6>
              <div className="d-flex flex-column gap-2">
                {tests.map((test) => (
                  <div
                    key={test._id}
                    onClick={() => setSelectedTest(test)}
                    className={`p-3 rounded-3 agri-card-interactive border ${
                      selectedTest?._id === test._id ? 'border-success bg-success bg-opacity-10' : 'border-light bg-light'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong className="text-dark small">{test.farm?.name || 'Selected Farm'}</strong>
                      <span className={`badge ${
                        test.healthRating === 'Optimal' ? 'bg-success' : test.healthRating === 'Good Fertility' ? 'bg-info' : 'bg-warning'
                      } text-white`} style={{ fontSize: '0.68rem' }}>
                        {test.healthRating}
                      </span>
                    </div>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                      Sample Date: {new Date(test.testDate).toLocaleDateString()}
                    </small>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                      N: {test.nitrogen} • P: {test.phosphorus} • K: {test.potassium} • pH: {test.pH}
                    </small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Soil Health & Fertilizer Calculator Card */}
          {selectedTest && (
            <div className="col-lg-8">
              <div className="agri-card p-4 mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center pb-3 mb-3 border-bottom border-light">
                  <div>
                    <span className="badge bg-success text-white mb-1">
                      {selectedTest.farm?.name}
                    </span>
                    <h4 className="fw-bold text-dark mb-0">Soil Fertility & Nutrient Profile</h4>
                    <small className="text-muted">
                      Tested by {selectedTest.laboratoryName} • Depth: {selectedTest.sampleDepth}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedTest._id)}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="bi bi-trash"></i> Delete Report
                  </button>
                </div>

                {/* Macro Nutrients Progress Bars */}
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 text-center border border-light">
                      <span className="small text-muted d-block">Nitrogen (N)</span>
                      <h3 className="fw-bold text-success mb-1">{selectedTest.nitrogen}</h3>
                      <small className="text-muted d-block">kg / ha</small>
                      <span className="badge bg-success bg-opacity-10 text-success mt-1" style={{ fontSize: '0.7rem' }}>
                        {selectedTest.nitrogen < 280 ? 'Low' : selectedTest.nitrogen > 560 ? 'High' : 'Medium (Optimal)'}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 text-center border border-light">
                      <span className="small text-muted d-block">Phosphorus (P)</span>
                      <h3 className="fw-bold text-info mb-1">{selectedTest.phosphorus}</h3>
                      <small className="text-muted d-block">kg / ha</small>
                      <span className="badge bg-info bg-opacity-10 text-info mt-1" style={{ fontSize: '0.7rem' }}>
                        {selectedTest.phosphorus < 23 ? 'Deficient' : 'Adequate'}
                      </span>
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="p-3 bg-light rounded-3 text-center border border-light">
                      <span className="small text-muted d-block">Potassium (K)</span>
                      <h3 className="fw-bold text-primary mb-1">{selectedTest.potassium}</h3>
                      <small className="text-muted d-block">kg / ha</small>
                      <span className="badge bg-primary bg-opacity-10 text-primary mt-1" style={{ fontSize: '0.7rem' }}>
                        {selectedTest.potassium < 140 ? 'Low' : 'Satisfactory'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Secondary Indicators */}
                <div className="row g-3 mb-4">
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <small className="text-muted d-block">Soil pH</small>
                      <strong className="fs-5 text-dark">{selectedTest.pH}</strong>
                      <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                        {selectedTest.pH < 6.0 ? 'Acidic' : selectedTest.pH > 7.5 ? 'Alkaline' : 'Neutral/Ideal'}
                      </small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <small className="text-muted d-block">Organic Carbon</small>
                      <strong className="fs-5 text-dark">{selectedTest.organicCarbon}%</strong>
                      <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>
                        {selectedTest.organicCarbon < 0.5 ? 'Low Humus' : 'Good Humus'}
                      </small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <small className="text-muted d-block">Conductivity (EC)</small>
                      <strong className="fs-5 text-dark">{selectedTest.electricalConductivity}</strong>
                      <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>dS/m (Salinity)</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="p-3 bg-light rounded-3 text-center">
                      <small className="text-muted d-block">Moisture</small>
                      <strong className="fs-5 text-dark">{selectedTest.moisturePercent}%</strong>
                      <small className="d-block text-muted" style={{ fontSize: '0.7rem' }}>Water Content</small>
                    </div>
                  </div>
                </div>

                {/* Automated Fertilizer Calculator Advice */}
                <div className="p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-25 mb-4">
                  <h6 className="fw-bold text-success mb-2">
                    <i className="bi bi-calculator me-1"></i> Automated Fertilizer Dosage Calculator (Per Acre)
                  </h6>
                  <div className="row g-2 text-center">
                    <div className="col-3">
                      <small className="text-muted d-block">Neem Urea</small>
                      <strong className="fs-6 text-dark">
                        {selectedTest.fertilizerDoseAdvice?.ureaKg || 45} kg
                      </strong>
                    </div>
                    <div className="col-3">
                      <small className="text-muted d-block">DAP</small>
                      <strong className="fs-6 text-dark">
                        {selectedTest.fertilizerDoseAdvice?.dapKg || 35} kg
                      </strong>
                    </div>
                    <div className="col-3">
                      <small className="text-muted d-block">Potash (MOP)</small>
                      <strong className="fs-6 text-dark">
                        {selectedTest.fertilizerDoseAdvice?.potashMOPKg || 20} kg
                      </strong>
                    </div>
                    <div className="col-3">
                      <small className="text-muted d-block">Zinc (21%)</small>
                      <strong className="fs-6 text-dark">
                        {selectedTest.fertilizerDoseAdvice?.zincKg || 5} kg
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Agronomic Recommendations */}
                <h6 className="fw-bold text-dark mb-2">Agronomic Advisory & Soil Remediation Steps</h6>
                <ul className="list-group list-group-flush rounded-3 border border-light">
                  {selectedTest.recommendations?.map((rec, i) => (
                    <li key={i} className="list-group-item small text-muted d-flex align-items-start gap-2">
                      <i className="bi bi-check-circle-fill text-success mt-1"></i>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Enter Soil Lab Test */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Log Soil Laboratory Test Sample</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="soilFarmSelect">Farm Land Parcel</label>
                      <select
                        id="soilFarmSelect"
                        className="form-select"
                        value={formData.farm}
                        onChange={(e) => setFormData({ ...formData, farm: e.target.value })}
                        required
                      >
                        {farms.map((f) => (
                          <option key={f._id} value={f._id}>
                            {f.name} ({f.totalArea} {f.areaUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="soilLabInput">Laboratory Name</label>
                      <input
                        id="soilLabInput"
                        type="text"
                        className="form-control"
                        value={formData.laboratoryName}
                        onChange={(e) => setFormData({ ...formData, laboratoryName: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="soilNitrogenInput">Nitrogen (N in kg/ha)</label>
                      <input
                        id="soilNitrogenInput"
                        type="number"
                        className="form-control"
                        placeholder="e.g. 280"
                        value={formData.nitrogen}
                        onChange={(e) => setFormData({ ...formData, nitrogen: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="soilPhosphorusInput">Phosphorus (P in kg/ha)</label>
                      <input
                        id="soilPhosphorusInput"
                        type="number"
                        className="form-control"
                        placeholder="e.g. 25"
                        value={formData.phosphorus}
                        onChange={(e) => setFormData({ ...formData, phosphorus: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="soilPotassiumInput">Potassium (K in kg/ha)</label>
                      <input
                        id="soilPotassiumInput"
                        type="number"
                        className="form-control"
                        placeholder="e.g. 190"
                        value={formData.potassium}
                        onChange={(e) => setFormData({ ...formData, potassium: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label" htmlFor="soilPhInput">Soil pH Level</label>
                      <input
                        id="soilPhInput"
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="e.g. 6.8"
                        value={formData.pH}
                        onChange={(e) => setFormData({ ...formData, pH: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label" htmlFor="soilCarbonInput">Organic Carbon (%)</label>
                      <input
                        id="soilCarbonInput"
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="e.g. 0.65"
                        value={formData.organicCarbon}
                        onChange={(e) => setFormData({ ...formData, organicCarbon: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label" htmlFor="soilEcInput">Conductivity (EC dS/m)</label>
                      <input
                        id="soilEcInput"
                        type="number"
                        step="0.01"
                        className="form-control"
                        placeholder="e.g. 0.35"
                        value={formData.electricalConductivity}
                        onChange={(e) => setFormData({ ...formData, electricalConductivity: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label" htmlFor="soilMoistureInput">Moisture (%)</label>
                      <input
                        id="soilMoistureInput"
                        type="number"
                        className="form-control"
                        placeholder="e.g. 28"
                        value={formData.moisturePercent}
                        onChange={(e) => setFormData({ ...formData, moisturePercent: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri">
                    Compute Soil Analysis & Save
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

export default SoilPage;
