import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const FarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFarmId, setCurrentFarmId] = useState(null);

  const initialForm = {
    name: '',
    totalArea: '',
    areaUnit: 'Acres',
    soilType: 'Loamy',
    irrigationType: 'Drip Irrigation',
    waterSource: 'Canal + Borewell',
    status: 'Active',
    description: '',
    district: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.9010,
    longitude: 75.8573
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/farms');
      setFarms(res.data.data || []);
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to fetch farms.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentFarmId(null);
    setFormData(initialForm);
    setShowModal(true);
  };

  const handleOpenEdit = (farm) => {
    setIsEditing(true);
    setCurrentFarmId(farm._id);
    setFormData({
      name: farm.name || '',
      totalArea: farm.totalArea || '',
      areaUnit: farm.areaUnit || 'Acres',
      soilType: farm.soilType || 'Loamy',
      irrigationType: farm.irrigationType || 'Drip Irrigation',
      waterSource: farm.waterSource || 'Canal + Borewell',
      status: farm.status || 'Active',
      description: farm.description || '',
      district: farm.location?.district || 'Ludhiana',
      state: farm.location?.state || 'Punjab',
      latitude: farm.location?.latitude || 30.9010,
      longitude: farm.location?.longitude || 75.8573
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        totalArea: Number(formData.totalArea),
        areaUnit: formData.areaUnit,
        soilType: formData.soilType,
        irrigationType: formData.irrigationType,
        waterSource: formData.waterSource,
        status: formData.status,
        description: formData.description,
        location: {
          district: formData.district,
          state: formData.state,
          country: 'India',
          latitude: Number(formData.latitude),
          longitude: Number(formData.longitude)
        }
      };

      if (isEditing) {
        await api.put(`/farms/${currentFarmId}`, payload);
        setAlert({ type: 'success', message: 'Farm parcel updated successfully!' });
      } else {
        await api.post('/farms', payload);
        setAlert({ type: 'success', message: 'New farm parcel registered successfully!' });
      }

      setShowModal(false);
      fetchFarms();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error saving farm details.'
      });
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This will also delete associated crops and soil tests.`)) {
      try {
        await api.delete(`/farms/${id}`);
        setAlert({ type: 'success', message: `Farm ${name} deleted successfully.` });
        fetchFarms();
      } catch (err) {
        setAlert({ type: 'danger', message: 'Failed to delete farm.' });
      }
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Page Title & Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Farm Land Parcels</h3>
          <p className="text-muted small mb-0">
            Manage your registered agricultural land boundaries, soil properties, and irrigation networks
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-agri">
          <i className="bi bi-plus-lg"></i> Register New Farm Parcel
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Retrieving registered farm records..." />
      ) : farms.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-geo-alt-fill text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Farm Parcels Registered</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            Get started by registering your first land parcel. You can map its soil type, irrigation system, and crops.
          </p>
          <button onClick={handleOpenAdd} className="btn btn-agri mt-2">
            <i className="bi bi-plus-lg"></i> Register First Farm
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {farms.map((farm) => (
            <div key={farm._id} className="col-12 col-md-6 col-xl-4">
              <div className="agri-card h-100 d-flex flex-column">
                <div className="p-4 flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge-soft-success">
                      <i className="bi bi-check-circle-fill me-1"></i> {farm.status}
                    </span>
                    <div className="dropdown">
                      <button className="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li>
                          <button className="dropdown-item" onClick={() => handleOpenEdit(farm)}>
                            <i className="bi bi-pencil me-2 text-primary"></i> Edit Details
                          </button>
                        </li>
                        <li>
                          <button className="dropdown-item text-danger" onClick={() => handleDelete(farm._id, farm.name)}>
                            <i className="bi bi-trash me-2"></i> Delete Farm
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <h5 className="fw-bold text-dark mb-1">{farm.name}</h5>
                  <p className="small text-muted mb-3">
                    <i className="bi bi-geo-alt-fill text-success me-1"></i>
                    {farm.location?.district || 'Central District'}, {farm.location?.state || 'Punjab'}
                    {farm.location?.latitude && (
                      <span className="ms-1 text-muted">({farm.location.latitude.toFixed(2)}, {farm.location.longitude.toFixed(2)})</span>
                    )}
                  </p>

                  <div className="p-3 bg-light rounded-3 mb-3">
                    <div className="row g-2 text-center">
                      <div className="col-4 border-end border-light">
                        <small className="text-muted d-block">Area</small>
                        <strong className="text-dark">{farm.totalArea} {farm.areaUnit}</strong>
                      </div>
                      <div className="col-4 border-end border-light">
                        <small className="text-muted d-block">Soil Type</small>
                        <strong className="text-dark">{farm.soilType}</strong>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Crops</small>
                        <strong className="text-success">{farm.cropCount || 0} active</strong>
                      </div>
                    </div>
                  </div>

                  <div className="small text-muted mb-2">
                    <i className="bi bi-droplet-half text-info me-1"></i>
                    <strong>Irrigation:</strong> {farm.irrigationType}
                  </div>

                  <div className="small text-muted mb-2">
                    <i className="bi bi-water text-primary me-1"></i>
                    <strong>Water Source:</strong> {farm.waterSource}
                  </div>

                  {farm.description && (
                    <p className="small text-muted mt-2 mb-0 border-top pt-2">
                      {farm.description}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-light border-top border-light d-flex justify-content-between align-items-center">
                  <span className="small text-muted">
                    <i className="bi bi-clipboard-pulse me-1"></i> {farm.soilTestCount || 0} Soil Tests Logged
                  </span>
                  <button onClick={() => handleOpenEdit(farm)} className="btn btn-sm btn-outline-success">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add / Edit Farm */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">
                  {isEditing ? 'Edit Farm Parcel' : 'Register New Land Parcel'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label" htmlFor="farmNameInput">Farm Name / Parcel Title</label>
                      <input
                        id="farmNameInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Green Horizon Valley Farm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="farmStatusSelect">Operational Status</label>
                      <select
                        id="farmStatusSelect"
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Fallow">Fallow</option>
                        <option value="Prepared for Sowing">Prepared for Sowing</option>
                        <option value="Harvest Season">Harvest Season</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="farmAreaInput">Total Area</label>
                      <div className="input-group">
                        <input
                          id="farmAreaInput"
                          type="number"
                          step="0.1"
                          className="form-control"
                          placeholder="e.g. 25"
                          value={formData.totalArea}
                          onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                          required
                        />
                        <select
                          className="form-select"
                          value={formData.areaUnit}
                          onChange={(e) => setFormData({ ...formData, areaUnit: e.target.value })}
                        >
                          <option value="Acres">Acres</option>
                          <option value="Hectares">Hectares</option>
                          <option value="Bigha">Bigha</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="farmSoilSelect">Soil Type</label>
                      <select
                        id="farmSoilSelect"
                        className="form-select"
                        value={formData.soilType}
                        onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                      >
                        <option value="Loamy">Loamy (Balanced)</option>
                        <option value="Alluvial">Alluvial (High Nutrient)</option>
                        <option value="Black Cotton">Black Cotton (Deep Clay)</option>
                        <option value="Red Sandy">Red Sandy</option>
                        <option value="Clay">Clay</option>
                        <option value="Silt">Silt</option>
                        <option value="Peaty">Peaty / Organic</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="farmIrrigationSelect">Irrigation Method</label>
                      <select
                        id="farmIrrigationSelect"
                        className="form-select"
                        value={formData.irrigationType}
                        onChange={(e) => setFormData({ ...formData, irrigationType: e.target.value })}
                      >
                        <option value="Drip Irrigation">Drip Irrigation (Precision)</option>
                        <option value="Sprinkler">Micro Sprinkler</option>
                        <option value="Canal / Flood">Canal / Furrow Flood</option>
                        <option value="Tubewell / Borewell">Tubewell / Borewell</option>
                        <option value="Rainfed">Rainfed</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="farmWaterInput">Water Source</label>
                      <input
                        id="farmWaterInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Solar Tubewell + Canal"
                        value={formData.waterSource}
                        onChange={(e) => setFormData({ ...formData, waterSource: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="farmDistrictInput">District / Region</label>
                      <input
                        id="farmDistrictInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Ludhiana"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label" htmlFor="farmStateInput">State</label>
                      <input
                        id="farmStateInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Punjab"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="farmNotesInput">Parcel Description & Notes</label>
                      <textarea
                        id="farmNotesInput"
                        rows="2"
                        className="form-control"
                        placeholder="Optional details such as sensor IDs or field landmarks..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri">
                    {isEditing ? 'Save Changes' : 'Register Farm'}
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

export default FarmsPage;
