import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const STAGES = ['Germination', 'Vegetative', 'Flowering', 'Grain Filling / Fruiting', 'Maturity', 'Harvested'];

const CropsPage = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCropId, setCurrentCropId] = useState(null);

  const initialForm = {
    farm: '',
    cropName: '',
    variety: '',
    category: 'Cereals & Grains',
    plantedArea: '',
    sowingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    stage: 'Vegetative',
    healthStatus: 'Good',
    estimatedYield: '',
    yieldUnit: 'Quintals',
    fertilizerApplied: 'Standard NPK',
    irrigationSchedule: 'Weekly',
    notes: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cropsRes, farmsRes] = await Promise.all([
        api.get('/crops'),
        api.get('/farms')
      ]);
      setCrops(cropsRes.data.data || []);
      setFarms(farmsRes.data.data || []);
      if (farmsRes.data.data?.length > 0 && !formData.farm) {
        setFormData((prev) => ({ ...prev, farm: farmsRes.data.data[0]._id }));
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to retrieve crops or farms.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentCropId(null);
    setFormData({
      ...initialForm,
      farm: farms[0]?._id || ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (crop) => {
    setIsEditing(true);
    setCurrentCropId(crop._id);
    setFormData({
      farm: crop.farm?._id || crop.farm || '',
      cropName: crop.cropName || '',
      variety: crop.variety || '',
      category: crop.category || 'Cereals & Grains',
      plantedArea: crop.plantedArea || '',
      sowingDate: crop.sowingDate ? crop.sowingDate.split('T')[0] : '',
      expectedHarvestDate: crop.expectedHarvestDate ? crop.expectedHarvestDate.split('T')[0] : '',
      stage: crop.stage || 'Vegetative',
      healthStatus: crop.healthStatus || 'Good',
      estimatedYield: crop.estimatedYield || '',
      yieldUnit: crop.yieldUnit || 'Quintals',
      fertilizerApplied: crop.fertilizerApplied || '',
      irrigationSchedule: crop.irrigationSchedule || '',
      notes: crop.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        plantedArea: Number(formData.plantedArea),
        estimatedYield: Number(formData.estimatedYield) || 0
      };

      if (isEditing) {
        await api.put(`/crops/${currentCropId}`, payload);
        setAlert({ type: 'success', message: 'Crop details updated successfully!' });
      } else {
        await api.post('/crops', payload);
        setAlert({ type: 'success', message: 'New crop registered successfully!' });
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error saving crop record.'
      });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await api.delete(`/crops/${id}`);
        setAlert({ type: 'success', message: `Crop ${name} removed.` });
        fetchData();
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to delete crop record.' });
      }
    }
  };

  const getStageIndex = (stage) => STAGES.indexOf(stage);

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title & Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Crop Management & Lifecycles</h3>
          <p className="text-muted small mb-0">
            Track phenological vegetative stages, health status, and harvest yield forecasts
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-agri" disabled={farms.length === 0}>
          <i className="bi bi-plus-lg"></i> Record Sown Crop
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {farms.length === 0 && !loading && (
        <div className="alert alert-warning d-flex align-items-center mb-4">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>
            You need to register at least one <strong>Farm Land Parcel</strong> before planting crops.
            <a href="/farms" className="alert-link ms-2">Go to Farms Page →</a>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner message="Loading crop lifecycle records..." />
      ) : crops.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-flower1 text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Crops Currently Tracked</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            Register your planted crops to track germination, flowering, maturation stages, and yield forecasts.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-agri mt-2" disabled={farms.length === 0}>
            <i className="bi bi-plus-lg"></i> Record Your First Crop
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {crops.map((crop) => {
            const currentStageIdx = getStageIndex(crop.stage);

            return (
              <div key={crop._id} className="col-12 col-lg-6">
                <div className="agri-card h-100 p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <span className="badge bg-light text-success border border-success border-opacity-25 me-2">
                        {crop.category}
                      </span>
                      <span className={`badge ${
                        crop.healthStatus === 'Excellent' ? 'bg-success' : crop.healthStatus === 'Good' ? 'bg-info' : 'bg-warning'
                      } text-white`}>
                        {crop.healthStatus} Health
                      </span>
                    </div>

                    <div className="dropdown">
                      <button className="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li>
                          <button className="dropdown-item" onClick={() => handleOpenEdit(crop)}>
                            <i className="bi bi-pencil me-2 text-primary"></i> Edit / Update Stage
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={() => handleDelete(crop._id, crop.cropName)}>
                            <i className="bi bi-trash me-2"></i> Remove Crop
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{crop.cropName}</h5>
                  <p className="text-muted small mb-3">
                    Variety: <strong>{crop.variety}</strong> • Farm: <strong>{crop.farm?.name || 'Assigned Farm'}</strong> ({crop.plantedArea} Acres)
                  </p>

                  {/* Stage Progress Tracker */}
                  <div className="my-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small fw-bold text-dark">Stage Progression</span>
                      <span className="small text-success fw-bold">{crop.stage}</span>
                    </div>

                    <div className="progress" style={{ height: '8px' }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%` }}
                        aria-valuenow={((currentStageIdx + 1) / STAGES.length) * 100}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>

                    <div className="d-flex justify-content-between mt-1 text-muted" style={{ fontSize: '0.68rem' }}>
                      <span>Sown</span>
                      <span>Vegetative</span>
                      <span>Flowering</span>
                      <span>Maturity</span>
                      <span>Harvest</span>
                    </div>
                  </div>

                  {/* Yield & Schedule Stats */}
                  <div className="p-3 bg-light rounded-3 mt-auto mb-3">
                    <div className="row g-2 text-center">
                      <div className="col-4 border-end border-light">
                        <small className="text-muted d-block">Sown On</small>
                        <strong className="text-dark small">
                          {new Date(crop.sowingDate).toLocaleDateString()}
                        </strong>
                      </div>
                      <div className="col-4 border-end border-light">
                        <small className="text-muted d-block">Est. Harvest</small>
                        <strong className="text-dark small">
                          {new Date(crop.expectedHarvestDate).toLocaleDateString()}
                        </strong>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Est. Yield</small>
                        <strong className="text-success small">
                          {crop.estimatedYield} {crop.yieldUnit}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center pt-2 border-top border-light">
                    <span className="small text-muted">
                      <i className="bi bi-clock-history me-1"></i> Irrigation: {crop.irrigationSchedule || 'Weekly'}
                    </span>
                    <button onClick={() => handleOpenEdit(crop)} className="btn btn-sm btn-agri-soft">
                      Update Stage & Yield
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Record Sown Crop */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Update Crop Record & Stage' : 'Record Sown Crop'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropFarmSelect">Select Farm Land Parcel</label>
                      <select
                        id="cropFarmSelect"
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
                      <label className="form-label" htmlFor="cropCategorySelect">Crop Category</label>
                      <select
                        id="cropCategorySelect"
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Cereals & Grains">Cereals & Grains (Wheat, Rice, Maize)</option>
                        <option value="Pulses & Legumes">Pulses & Legumes (Gram, Lentil, Moong)</option>
                        <option value="Oilseeds">Oilseeds (Mustard, Groundnut, Soybean)</option>
                        <option value="Vegetables">Vegetables</option>
                        <option value="Fruits">Fruits & Orchards</option>
                        <option value="Cash Crops">Cash Crops (Cotton, Sugarcane)</option>
                        <option value="Spices">Spices</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropNameInput">Crop Name</label>
                      <input
                        id="cropNameInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sharbati Wheat"
                        value={formData.cropName}
                        onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropVarietyInput">Variety / Hybrid Identifier</label>
                      <input
                        id="cropVarietyInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. PBW 824 High Yield"
                        value={formData.variety}
                        onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="cropAreaInput">Planted Area (Acres)</label>
                      <input
                        id="cropAreaInput"
                        type="number"
                        step="0.1"
                        className="form-control"
                        placeholder="e.g. 15"
                        value={formData.plantedArea}
                        onChange={(e) => setFormData({ ...formData, plantedArea: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="cropSowDate">Sowing Date</label>
                      <input
                        id="cropSowDate"
                        type="date"
                        className="form-control"
                        value={formData.sowingDate}
                        onChange={(e) => setFormData({ ...formData, sowingDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="cropHarvestDate">Expected Harvest Date</label>
                      <input
                        id="cropHarvestDate"
                        type="date"
                        className="form-control"
                        value={formData.expectedHarvestDate}
                        onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropStageSelect">Current Phenological Stage</label>
                      <select
                        id="cropStageSelect"
                        className="form-select"
                        value={formData.stage}
                        onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropHealthSelect">Health Status Assessment</label>
                      <select
                        id="cropHealthSelect"
                        className="form-select"
                        value={formData.healthStatus}
                        onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
                      >
                        <option value="Excellent">Excellent (Thriving Canopy)</option>
                        <option value="Good">Good (Healthy Growth)</option>
                        <option value="Moderate">Moderate (Minor Symptoms)</option>
                        <option value="Needs Attention">Needs Attention (Nutrient Stress)</option>
                        <option value="Pest Affected">Pest Affected</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropYieldInput">Estimated Yield</label>
                      <div className="input-group">
                        <input
                          id="cropYieldInput"
                          type="number"
                          className="form-control"
                          placeholder="e.g. 350"
                          value={formData.estimatedYield}
                          onChange={(e) => setFormData({ ...formData, estimatedYield: e.target.value })}
                        />
                        <select
                          className="form-select"
                          value={formData.yieldUnit}
                          onChange={(e) => setFormData({ ...formData, yieldUnit: e.target.value })}
                        >
                          <option value="Quintals">Quintals</option>
                          <option value="Tons">Tons</option>
                          <option value="Kilograms">Kilograms</option>
                          <option value="Bags">Bags</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="cropScheduleInput">Irrigation Schedule</label>
                      <input
                        id="cropScheduleInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Critical crown root & flowering"
                        value={formData.irrigationSchedule}
                        onChange={(e) => setFormData({ ...formData, irrigationSchedule: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="cropNotesInput">Agronomic Notes</label>
                      <textarea
                        id="cropNotesInput"
                        rows="2"
                        className="form-control"
                        placeholder="Fertilizer dosages, canopy observations, or leaf color notes..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri">
                    {isEditing ? 'Save Changes' : 'Record Crop'}
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

export default CropsPage;
