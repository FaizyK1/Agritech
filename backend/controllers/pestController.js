import PestAlert from '../models/PestAlert.js';

// @desc    Get all pest and disease alerts (public or authenticated)
// @route   GET /api/pests
// @access  Public / Private
export const getPestAlerts = async (req, res, next) => {
  try {
    const { crop, severity, status, region } = req.query;
    let query = {};

    if (crop) {
      query.cropAffected = new RegExp(crop, 'i');
    }
    if (severity) {
      query.severity = severity;
    }
    if (status) {
      query.status = status;
    }
    if (region) {
      query.region = new RegExp(region, 'i');
    }

    const alerts = await PestAlert.find(query)
      .populate('reporter', 'name role location')
      .populate('farm', 'name location')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pest alert
// @route   GET /api/pests/:id
// @access  Public
export const getPestAlertById = async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id)
      .populate('reporter', 'name role location')
      .populate('farm', 'name location');

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Pest alert not found' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a pest/disease alert
// @route   POST /api/pests
// @access  Private
export const createPestAlert = async (req, res, next) => {
  try {
    const {
      farm,
      pestOrDiseaseName,
      cropAffected,
      pestType,
      severity,
      region,
      symptoms,
      treatmentAdvice,
      preventiveMeasures,
      status,
      imageUrl
    } = req.body;

    const alert = await PestAlert.create({
      reporter: req.user._id,
      farm: farm || undefined,
      pestOrDiseaseName,
      cropAffected,
      pestType: pestType || 'Insect Pest',
      severity: severity || 'Moderate',
      region: region || req.user.location || 'Northern Agricultural Belt',
      symptoms,
      treatmentAdvice,
      preventiveMeasures: preventiveMeasures || 'Regular field sanitation, pheromone traps, and balanced irrigation.',
      status: status || 'Active Warning',
      isVerifiedByExpert: req.user.role === 'expert' || req.user.role === 'admin',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80'
    });

    const populatedAlert = await PestAlert.findById(alert._id)
      .populate('reporter', 'name role')
      .populate('farm', 'name');

    res.status(201).json({ success: true, data: populatedAlert });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pest alert status / verification
// @route   PUT /api/pests/:id
// @access  Private
export const updatePestAlert = async (req, res, next) => {
  try {
    let alert = await PestAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Pest alert not found' });
    }

    // Only reporter, expert, or admin can update
    const isOwner = alert.reporter.toString() === req.user._id.toString();
    const isStaff = ['expert', 'admin'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this alert' });
    }

    if (req.user.role === 'expert' || req.user.role === 'admin') {
      if (req.body.isVerifiedByExpert !== undefined) {
        alert.isVerifiedByExpert = req.body.isVerifiedByExpert;
      }
    }

    alert = await PestAlert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('reporter', 'name role');

    res.json({ success: true, data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pest alert
// @route   DELETE /api/pests/:id
// @access  Private
export const deletePestAlert = async (req, res, next) => {
  try {
    const alert = await PestAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Pest alert not found' });
    }

    if (alert.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this alert' });
    }

    await alert.deleteOne();
    res.json({ success: true, message: 'Pest alert removed' });
  } catch (error) {
    next(error);
  }
};
