import Consultation from '../models/Consultation.js';

// @desc    Get consultations (farmers see theirs; experts and admins see all)
// @route   GET /api/consultations
// @access  Private
export const getConsultations = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'farmer') {
      query.farmer = req.user._id;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    const consultations = await Consultation.find(query)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name email location bio')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: consultations.length, data: consultations });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single consultation by id
// @route   GET /api/consultations/:id
// @access  Private
export const getConsultationById = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('farmer', 'name email phone location')
      .populate('expert', 'name email location bio');

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation ticket not found' });
    }

    // Authorization check
    if (
      consultation.farmer._id.toString() !== req.user._id.toString() &&
      !['expert', 'admin'].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this consultation' });
    }

    res.json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new consultation ticket
// @route   POST /api/consultations
// @access  Private
export const createConsultation = async (req, res, next) => {
  try {
    const { topic, category, priority, question, cropMentioned } = req.body;

    const consultation = await Consultation.create({
      farmer: req.user._id,
      topic,
      category: category || 'Crop Health & Disease',
      priority: priority || 'Normal',
      question,
      cropMentioned: cropMentioned || 'Wheat / General',
      status: 'Open',
      replies: [
        {
          sender: req.user._id,
          senderName: req.user.name,
          role: req.user.role,
          message: question,
          createdAt: new Date()
        }
      ]
    });

    const populated = await Consultation.findById(consultation._id).populate('farmer', 'name location');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a reply to consultation
// @route   POST /api/consultations/:id/reply
// @access  Private
export const replyConsultation = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'Reply message cannot be empty' });
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    // Add reply
    consultation.replies.push({
      sender: req.user._id,
      senderName: req.user.name,
      role: req.user.role,
      message,
      createdAt: new Date()
    });

    // If an expert responds, assign them and update status
    if (req.user.role === 'expert') {
      if (!consultation.expert) {
        consultation.expert = req.user._id;
      }
      consultation.status = 'Advisory Provided';
    } else if (consultation.status === 'Open') {
      consultation.status = 'In Discussion';
    }

    await consultation.save();

    const updated = await Consultation.findById(consultation._id)
      .populate('farmer', 'name email location')
      .populate('expert', 'name email bio');

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation status (e.g. Closed or Assigned)
// @route   PUT /api/consultations/:id/status
// @access  Private
export const updateConsultationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const consultation = await Consultation.findById(req.params.id);

    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation not found' });
    }

    if (status) {
      consultation.status = status;
    }

    await consultation.save();
    res.json({ success: true, data: consultation });
  } catch (error) {
    next(error);
  }
};
