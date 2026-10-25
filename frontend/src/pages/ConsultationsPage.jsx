import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertBanner from '../components/AlertBanner';

const ConsultationsPage = () => {
  const { user } = useAuth();

  const [consultations, setConsultations] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    category: 'Crop Health & Disease',
    priority: 'Normal',
    cropMentioned: 'Wheat PBW 824',
    question: ''
  });

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations');
      const list = res.data.data || [];
      setConsultations(list);
      if (list.length > 0 && !selectedTicket) {
        setSelectedTicket(list[0]);
      } else if (selectedTicket) {
        const updated = list.find((t) => t._id === selectedTicket._id);
        if (updated) setSelectedTicket(updated);
      }
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to retrieve consultations.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/consultations', formData);
      setAlert({ type: 'success', message: 'Consultation query submitted to agronomists!' });
      setShowModal(false);
      setFormData({
        topic: '',
        category: 'Crop Health & Disease',
        priority: 'Normal',
        cropMentioned: 'Wheat PBW 824',
        question: ''
      });
      fetchConsultations();
      if (res.data.data) {
        setSelectedTicket(res.data.data);
      }
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error submitting query.'
      });
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      const res = await api.post(`/consultations/${selectedTicket._id}/reply`, {
        message: replyMessage
      });
      setReplyMessage('');
      setSelectedTicket(res.data.data);
      fetchConsultations();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to send reply.' });
    }
  };

  const handleCloseTicket = async (status) => {
    if (!selectedTicket) return;
    try {
      await api.put(`/consultations/${selectedTicket._id}/status`, { status });
      setAlert({ type: 'success', message: `Ticket marked as ${status}.` });
      fetchConsultations();
    } catch (err) {
      setAlert({ type: 'danger', message: 'Failed to update ticket status.' });
    }
  };

  return (
    <div className="container-fluid px-lg-4 py-4">
      {/* Title & Action */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-dark mb-1">Agronomist Consultation & Expert Advisory</h3>
          <p className="text-muted small mb-0">
            Direct communication with certified agricultural scientists, plant pathologists, and soil specialists
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-agri">
          <i className="bi bi-chat-plus me-1"></i> Ask an Agricultural Expert
        </button>
      </div>

      {alert && <AlertBanner type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {loading ? (
        <LoadingSpinner message="Connecting to agronomist consultation dispatch..." />
      ) : consultations.length === 0 ? (
        <div className="agri-card p-5 text-center my-4">
          <i className="bi bi-chat-dots-fill text-muted" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-3">No Consultations Started Yet</h4>
          <p className="text-muted mx-auto" style={{ maxWidth: '450px' }}>
            Have a question about pest damage, fertilizer application, irrigation scheduling, or crop wilting? Post your question directly to senior agronomists.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-agri mt-2">
            <i className="bi bi-chat-plus me-1"></i> Ask First Question
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Left Column: Tickets List */}
          <div className="col-lg-5">
            <div className="agri-card p-3 h-100">
              <h6 className="fw-bold text-muted text-uppercase mb-3" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                Consultation Threads ({consultations.length})
              </h6>
              <div className="d-flex flex-column gap-2 overflow-auto" style={{ maxHeight: '650px' }}>
                {consultations.map((ticket) => (
                  <div
                    key={ticket._id}
                    onClick={() => setSelectedTicket(ticket)}
                    className={`p-3 rounded-3 agri-card-interactive border ${
                      selectedTicket?._id === ticket._id ? 'border-success bg-success bg-opacity-10' : 'border-light bg-light'
                    }`}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className={`badge ${
                        ticket.priority === 'Urgent / Outbreak' ? 'bg-danger' : ticket.priority === 'High Priority' ? 'bg-warning text-dark' : 'bg-secondary'
                      }`} style={{ fontSize: '0.68rem' }}>
                        {ticket.priority}
                      </span>
                      <span className="badge bg-light text-success border" style={{ fontSize: '0.68rem' }}>
                        {ticket.status}
                      </span>
                    </div>

                    <strong className="d-block text-dark small mb-1">{ticket.topic}</strong>
                    <small className="text-muted d-block text-truncate">
                      Crop: {ticket.cropMentioned} • By: {ticket.farmer?.name || 'Farmer'}
                    </small>
                    <div className="d-flex justify-content-between align-items-center mt-2" style={{ fontSize: '0.72rem' }}>
                      <span className="text-muted">
                        <i className="bi bi-chat-left-text me-1"></i> {ticket.replies?.length || 1} messages
                      </span>
                      <span className="text-muted">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Discussion Thread & Replies */}
          {selectedTicket && (
            <div className="col-lg-7">
              <div className="agri-card p-4 d-flex flex-column" style={{ minHeight: '650px' }}>
                {/* Header */}
                <div className="pb-3 mb-3 border-bottom border-light">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                    <div>
                      <span className="badge bg-info text-white mb-1 me-1">{selectedTicket.category}</span>
                      <span className="badge bg-success text-white mb-1">{selectedTicket.status}</span>
                      <h5 className="fw-bold text-dark mb-1">{selectedTicket.topic}</h5>
                      <small className="text-muted">
                        Target Crop: <strong>{selectedTicket.cropMentioned}</strong> • Farmer: {selectedTicket.farmer?.name} ({selectedTicket.farmer?.location})
                      </small>
                    </div>

                    {selectedTicket.status !== 'Closed' && (
                      <button
                        onClick={() => handleCloseTicket('Closed')}
                        className="btn btn-sm btn-outline-secondary"
                      >
                        <i className="bi bi-check-all"></i> Mark Resolved
                      </button>
                    )}
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-grow-1 overflow-auto pe-2 mb-3 d-flex flex-column gap-3" style={{ maxHeight: '420px' }}>
                  {selectedTicket.replies?.map((reply, idx) => {
                    const isExpert = reply.role === 'expert';
                    const isCurrentUser = reply.sender?._id === user?._id || reply.sender === user?._id;

                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-3 ${
                          isExpert
                            ? 'bg-success bg-opacity-10 border border-success border-opacity-25 ms-3'
                            : 'bg-light border border-light me-3'
                        }`}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center gap-2">
                            <strong className="text-dark small">{reply.senderName}</strong>
                            <span className={`badge ${
                              isExpert ? 'bg-info text-white' : 'bg-success text-white'
                            }`} style={{ fontSize: '0.65rem' }}>
                              {isExpert ? '🔬 Agronomist' : '👨‍🌾 Farmer'}
                            </span>
                          </div>
                          <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                            {new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                        <p className="small text-dark mb-0 lh-base">{reply.message}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="mt-auto pt-3 border-top border-light">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={
                        user?.role === 'expert'
                          ? 'Provide agronomist guidance, dosage or remedies...'
                          : 'Type your message or follow-up question...'
                      }
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-agri">
                      <i className="bi bi-send-fill"></i> Reply
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Ask Question */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold">Ask an Agricultural Expert / Plant Pathologist</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleCreateConsultation}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label" htmlFor="consultTopicInput">Consultation Title / Topic</label>
                      <input
                        id="consultTopicInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Yellowing of lower wheat leaves after first irrigation"
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="consultCategorySelect">Advisory Category</label>
                      <select
                        id="consultCategorySelect"
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Crop Health & Disease">Crop Health & Disease</option>
                        <option value="Soil Fertility & Nutrients">Soil Fertility & Nutrients</option>
                        <option value="Precision Irrigation">Precision Irrigation</option>
                        <option value="Pest Management">Pest Management</option>
                        <option value="Organic Farming Certification">Organic Certification</option>
                        <option value="Post-Harvest & Storage">Post-Harvest & Storage</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="consultCropInput">Crop Name & Variety</label>
                      <input
                        id="consultCropInput"
                        type="text"
                        className="form-control"
                        placeholder="e.g. Wheat PBW 824"
                        value={formData.cropMentioned}
                        onChange={(e) => setFormData({ ...formData, cropMentioned: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label" htmlFor="consultPrioritySelect">Priority / Urgency</label>
                      <select
                        id="consultPrioritySelect"
                        className="form-select"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="Normal">Normal</option>
                        <option value="High Priority">High Priority</option>
                        <option value="Urgent / Outbreak">Urgent / Active Outbreak</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label" htmlFor="consultQuestionInput">Detailed Agronomic Question</label>
                      <textarea
                        id="consultQuestionInput"
                        rows="4"
                        className="form-control"
                        placeholder="Describe the leaf color, weather conditions, fertilizers already applied, and date of sowing..."
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-agri">
                    Submit Query to Expert Pool
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

export default ConsultationsPage;
