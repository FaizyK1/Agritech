import Farm from '../models/Farm.js';
import Crop from '../models/Crop.js';
import SoilTest from '../models/SoilTest.js';

// @desc    Get all farms for the logged in user (or all if admin)
// @route   GET /api/farms
// @access  Private
export const getFarms = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const farms = await Farm.find(query).sort({ createdAt: -1 });

    // Attach count of active crops per farm
    const farmsWithStats = await Promise.all(
      farms.map(async (farm) => {
        const cropCount = await Crop.countDocuments({ farm: farm._id });
        const soilTestCount = await SoilTest.countDocuments({ farm: farm._id });
        return {
          ...farm.toObject(),
          cropCount,
          soilTestCount
        };
      })
    );

    res.json({ success: true, count: farms.length, data: farmsWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm
// @route   GET /api/farms/:id
// @access  Private
export const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id).populate('user', 'name email phone');
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    // Ensure user owns farm or is expert/admin
    if (farm.user._id.toString() !== req.user._id.toString() && !['admin', 'expert'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this farm' });
    }

    const crops = await Crop.find({ farm: farm._id }).sort({ createdAt: -1 });
    const soilTests = await SoilTest.find({ farm: farm._id }).sort({ testDate: -1 });

    res.json({
      success: true,
      data: {
        ...farm.toObject(),
        crops,
        soilTests
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new farm
// @route   POST /api/farms
// @access  Private
export const createFarm = async (req, res, next) => {
  try {
    const { name, totalArea, areaUnit, soilType, irrigationType, status, waterSource, description, location } = req.body;

    const farm = await Farm.create({
      user: req.user._id,
      name,
      totalArea,
      areaUnit: areaUnit || 'Acres',
      soilType: soilType || 'Loamy',
      irrigationType: irrigationType || 'Drip Irrigation',
      status: status || 'Active',
      waterSource: waterSource || 'Borewell & Canal',
      description: description || '',
      location: location || {
        address: 'Main Agricultural Belt',
        district: 'Ludhiana',
        state: 'Punjab',
        country: 'India',
        latitude: 30.9010,
        longitude: 75.8573
      }
    });

    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a farm
// @route   PUT /api/farms/:id
// @access  Private
export const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    if (farm.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this farm' });
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: farm });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a farm
// @route   DELETE /api/farms/:id
// @access  Private
export const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    if (farm.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this farm' });
    }

    // Clean up associated crops and soil tests
    await Crop.deleteMany({ farm: farm._id });
    await SoilTest.deleteMany({ farm: farm._id });
    await farm.deleteOne();

    res.json({ success: true, message: 'Farm and associated crop records removed successfully' });
  } catch (error) {
    next(error);
  }
};
