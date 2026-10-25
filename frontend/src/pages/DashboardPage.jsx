import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const DashboardPage = () => {
  const { user } = useAuth();

  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [soilTests, setSoilTests] = useState([]);
  const [pestAlerts, setPestAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [farmsRes, cropsRes, soilRes, pestsRes, weatherRes] = await Promise.all([
          api.get('/farms'),
          api.get('/crops'),
          api.get('/soil'),
          api.get('/pests'),
          api.get('/weather')
        ]);

        setFarms(farmsRes.data.data || []);
        setCrops(cropsRes.data.data || []);
        setSoilTests(soilRes.data.data || []);
        setPestAlerts(pestsRes.data.data || []);
        setWeather(weatherRes.data || null);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load some dashboard telemetry data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalAcreage = farms.reduce((sum, f) => sum + (f.totalArea || 0), 0);
  const healthyCropsCount = crops.filter((c) => ['Excellent', 'Good'].includes(c.healthStatus)).length;
  const activePestsCount = pestAlerts.filter((p) => p.status === 'Active Warning').length;

  if (loading) {
    return <LoadingSpinner message="Aggregating farm intelligence and weather telemetry..." />;
  }

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Top Welcome Header */}
      <div className="agri-card p-4 mb-4 border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: '#ffffff' }}>
        <div className="row align-items-center g-3">
          <div className="col-lg-8">
            <span className="badge bg-white bg-opacity-20 text-white mb-2 px-3 py-1">
              <i className="bi bi-geo-alt-fill"></i> {user?.location || 'Central Agro Zone'}
            </span>
            <h2 className="fw-bold mb-1">
              Namaste, {user?.name}! 🌾
            </h2>
            <p className="mb-0 text-white-50">
              Your farm telemetry is operational. <strong>{farms.length} parcels</strong> across <strong>{totalAcreage.toFixed(1)} acres</strong> are currently active.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-15 p-2 rounded-3 text-start">
              <span className="fs-2">⛅</span>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold fs-5 text-white">{weather?.current?.temperature ?? 26}°C</span>
                  <span className="badge bg-white text-dark small" style={{ fontSize: '0.65rem' }}>
                    {weather?.isLiveData ? 'Live Open-Meteo' : 'Demo Telemetry'}
                  </span>
                </div>
                <small className="text-white-50 d-block">
                  Humidity {weather?.current?.humidity ?? 55}% • Wind {weather?.current?.windSpeed ?? 8} km/h
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <AlertBanner type="warning" message={error} onClose={() => setError('')} />}

      {/* KPI Stats Grid */}
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Managed Acreage"
            value={totalAcreage.toFixed(1)}
            unit="Acres"
            icon="bi-bounding-box text-success"
            subtitle={`${farms.length} Registered Land Parcels`}
            color="success"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Active Crops"
            value={crops.length}
            unit="Varieties"
            icon="bi-flower1 text-info"
            subtitle={`${healthyCropsCount} in Optimal / Good Health`}
            color="info"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Soil Tests Logged"
            value={soilTests.length}
            unit="Reports"
            icon="bi-moisture text-primary"
            subtitle={soilTests[0] ? `Latest pH: ${soilTests[0].pH} (${soilTests[0].healthRating})` : 'Awaiting Soil Sample'}
            color="primary"
          />
        </div>
        <div className="col-12 col-sm-6 col-xl-3">
          <StatCard
            title="Regional Pest Alerts"
            value={activePestsCount}
            unit="Active"
            icon="bi-shield-exclamation text-danger"
            subtitle={activePestsCount > 0 ? 'High Surveillance Active' : 'No Critical Pathogens'}
            color={activePestsCount > 0 ? 'danger' : 'success'}
            isPositive={activePestsCount === 0}
          />
        </div>
      </div>

      {/* Middle Row: Quick Actions & Weather Advisory */}
      <div className="row g-4 mb-4">
        {/* Weather Agricultural Advisory Card */}
        <div className="col-lg-7">
          <div className="agri-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Agricultural Advisory Telemetry</h5>
                <small className="text-muted">Calculated from micro-climate & meteorological stations</small>
              </div>
              <Link to="/weather" className="btn btn-sm btn-agri-soft">
                Full 7-Day Forecast <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            <div className="row g-3">
              {weather?.advisories?.map((adv, idx) => (
                <div key={idx} className="col-12 col-md-4">
                  <div className="p-3 bg-light rounded-3 h-100 border border-light">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-bold text-dark">{adv.type}</span>
                      <span className={`badge bg-${adv.badgeClass} text-white`} style={{ fontSize: '0.68rem' }}>
                        {adv.status}
                      </span>
                    </div>
                    <p className="small text-muted mb-0 lh-sm">{adv.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-success bg-opacity-10 rounded-3 border border-success border-opacity-20 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-info-circle-fill text-success fs-5"></i>
                <span className="small text-dark fw-semibold">
                  Source: {weather?.dataSource || 'Open-Meteo Global Meteorological API'}
                </span>
              </div>
              <span className={`badge ${weather?.isLiveData ? 'bg-success' : 'bg-secondary'} text-white`}>
                {weather?.isLiveData ? 'LIVE FEED' : 'DEMO MODE'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="col-lg-5">
          <div className="agri-card p-4 h-100">
            <h5 className="fw-bold mb-3">Quick Operational Actions</h5>
            <div className="d-grid gap-2">
              <Link to="/farms" className="btn btn-agri-soft text-start d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-geo-alt-fill text-success fs-4"></i>
                  <div>
                    <strong className="d-block text-dark">Add New Land Parcel</strong>
                    <small className="text-muted">Register GPS coordinates, soil & irrigation</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>

              <Link to="/crops" className="btn btn-agri-soft text-start d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-flower1 text-info fs-4"></i>
                  <div>
                    <strong className="d-block text-dark">Record Sown Crop</strong>
                    <small className="text-muted">Log variety, sowing date & stage tracker</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>

              <Link to="/soil" className="btn btn-agri-soft text-start d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-moisture text-primary fs-4"></i>
                  <div>
                    <strong className="d-block text-dark">Enter Lab Soil Test</strong>
                    <small className="text-muted">Calculate N-P-K fertilizer recommendations</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>

              <Link to="/consultations" className="btn btn-agri-soft text-start d-flex align-items-center justify-content-between p-3">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-chat-dots-fill text-warning fs-4"></i>
                  <div>
                    <strong className="d-block text-dark">Consult Senior Agronomist</strong>
                    <small className="text-muted">Get expert diagnosis on crop disease</small>
                  </div>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Active Crops Stage Overview */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="agri-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0">Active Crops Lifecycle</h5>
                <small className="text-muted">Phenological stages and estimated harvest yields</small>
              </div>
              <Link to="/crops" className="btn btn-sm btn-agri-outline">
                Manage Crops
              </Link>
            </div>

            {crops.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-flower1 fs-1 text-muted"></i>
                <p className="text-muted mt-2">No crops registered yet.</p>
                <Link to="/crops" className="btn btn-sm btn-agri">
                  + Add Your First Crop
                </Link>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {crops.slice(0, 3).map((crop) => (
                  <div key={crop._id} className="p-3 bg-light rounded-3 border border-light">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-0 text-dark">{crop.cropName}</h6>
                        <small className="text-muted">
                          Variety: <strong>{crop.variety}</strong> • Farm: {crop.farm?.name || 'General Field'} • Area: {crop.plantedArea} Acres
                        </small>
                      </div>
                      <span className={`badge ${
                        crop.healthStatus === 'Excellent' ? 'bg-success' : crop.healthStatus === 'Good' ? 'bg-info' : 'bg-warning'
                      } text-white`}>
                        {crop.healthStatus} Health
                      </span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center small text-muted mt-2">
                      <span>Current Stage: <strong className="text-success">{crop.stage}</strong></span>
                      <span>Est. Yield: <strong>{crop.estimatedYield} {crop.yieldUnit}</strong></span>
                      <span>Harvest: <strong>{new Date(crop.expectedHarvestDate).toLocaleDateString()}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pest Warnings Widget */}
        <div className="col-lg-4">
          <div className="agri-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Pest Outbreak Alert</h5>
              <Link to="/pests" className="btn btn-sm btn-agri-soft">
                View All
              </Link>
            </div>

            {pestAlerts.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-shield-check text-success fs-1"></i>
                <p className="text-muted small mt-2">No active pest outbreaks reported in your region.</p>
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {pestAlerts.slice(0, 2).map((alert) => (
                  <div key={alert._id} className="p-3 rounded-3 border border-danger border-opacity-25 bg-danger bg-opacity-10">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-danger text-white">{alert.severity} Severity</span>
                      <small className="text-muted">{alert.cropAffected}</small>
                    </div>
                    <strong className="d-block text-dark small">{alert.pestOrDiseaseName}</strong>
                    <p className="text-muted small mb-0 lh-sm text-truncate">{alert.symptoms}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
