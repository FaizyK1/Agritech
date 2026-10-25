import Crop from '../models/Crop.js';
import Farm from '../models/Farm.js';

// @desc    Get crops (filter by farm or get all for user)
// @route   GET /api/crops
// @access  Private
export const getCrops = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (req.query.farmId) {
      query.farm = req.query.farmId;
    }

    if (req.query.stage) {
      query.stage = req.query.stage;
    }

    const crops = await Crop.find(query)
      .populate('farm', 'name location totalArea areaUnit')
      .sort({ sowingDate: -1 });

    res.json({ success: true, count: crops.length, data: crops });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Private
export const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farm', 'name location totalArea soilType irrigationType');
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.user.toString() !== req.user._id.toString() && !['admin', 'expert'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this crop' });
    }

    res.json({ success: true, data: crop });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a crop
// @route   POST /api/crops
// @access  Private
export const createCrop = async (req, res, next) => {
  try {
    const {
      farm,
      cropName,
      variety,
      category,
      plantedArea,
      sowingDate,
      expectedHarvestDate,
      stage,
      healthStatus,
      estimatedYield,
      yieldUnit,
      fertilizerApplied,
      irrigationSchedule,
      notes
    } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({ success: false, message: 'Associated farm does not exist' });
    }

    if (farmDoc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to add crop to this farm' });
    }

    const crop = await Crop.create({
      user: req.user._id,
      farm,
      cropName,
      variety: variety || 'Standard High-Yield Hybrid',
      category: category || 'Cereals & Grains',
      plantedArea,
      sowingDate: sowingDate || Date.now(),
      expectedHarvestDate,
      stage: stage || 'Vegetative',
      healthStatus: healthStatus || 'Good',
      estimatedYield: estimatedYield || 0,
      yieldUnit: yieldUnit || 'Quintals',
      fertilizerApplied: fertilizerApplied || 'Standard NPK',
      irrigationSchedule: irrigationSchedule || 'Weekly',
      notes: notes || ''
    });

    const populatedCrop = await Crop.findById(crop._id).populate('farm', 'name location');

    res.status(201).json({ success: true, data: populatedCrop });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a crop
// @route   PUT /api/crops/:id
// @access  Private
export const updateCrop = async (req, res, next) => {
  try {
    let crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.user.toString() !== req.user._id.toString() && !['admin', 'expert'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this crop' });
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('farm', 'name location');

    res.json({ success: true, data: crop });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a crop
// @route   DELETE /api/crops/:id
// @access  Private
export const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    if (crop.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this crop' });
    }

    await crop.deleteOne();
    res.json({ success: true, message: 'Crop record deleted successfully' });
  } catch (error) {
    next(error);
  }
};
