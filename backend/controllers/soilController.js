import SoilTest from '../models/SoilTest.js';
import Farm from '../models/Farm.js';

// Helper function to generate scientific agronomic advice from NPK & pH
const analyzeSoilMetrics = (n, p, k, ph, oc) => {
  const recommendations = [];
  let healthRating = 'Good Fertility';
  let urea = 45;
  let dap = 35;
  let mop = 20;
  let zinc = 5;

  // pH interpretation
  if (ph < 6.0) {
    recommendations.push(`Acidic soil (pH ${ph}). Apply Agricultural Limestone (CaCO3) at 1.5 - 2 tons/acre to neutralize acidity.`);
    healthRating = 'Acidic';
  } else if (ph > 7.8) {
    recommendations.push(`Alkaline/Calcareous soil (pH ${ph}). Incorporate Gypsum (CaSO4) at 1 ton/acre and green manuring (Dhaincha/Sunhemp).`);
    healthRating = 'Alkaline';
  } else {
    recommendations.push(`Optimal pH range (${ph}). Soil reaction is ideal for microbial activity and macro-nutrient availability.`);
  }

  // Nitrogen (kg/ha)
  if (n < 280) {
    recommendations.push(`Nitrogen level is LOW (${n} kg/ha). Top-dress additional 25-30 kg Urea per acre in split doses during tillering.`);
    urea += 15;
    if (healthRating === 'Good Fertility') healthRating = 'Moderate Deficiencies';
  } else if (n > 560) {
    recommendations.push(`Nitrogen is HIGH (${n} kg/ha). Reduce synthetic nitrogen fertilizers to prevent vegetative lodging and pest susceptibility.`);
    urea = Math.max(15, urea - 20);
  } else {
    recommendations.push(`Nitrogen level is in balanced medium range (${n} kg/ha). Maintain standard basal + top-dress ratio.`);
  }

  // Phosphorus (kg/ha)
  if (p < 23) {
    recommendations.push(`Phosphorus is DEFICIENT (${p} kg/ha). Apply Single Super Phosphate (SSP) or DAP at root level during basal sowing.`);
    dap += 15;
    if (healthRating === 'Good Fertility') healthRating = 'Moderate Deficiencies';
  } else {
    recommendations.push(`Phosphorus level is SATISFACTORY (${p} kg/ha). Promotes strong root initiation and seed formation.`);
  }

  // Potassium (kg/ha)
  if (k < 140) {
    recommendations.push(`Potassium is LOW (${k} kg/ha). Apply Muriate of Potash (MOP) to improve crop drought tolerance and disease resistance.`);
    mop += 15;
  } else {
    recommendations.push(`Potassium level is ROBUST (${k} kg/ha). Good for grain quality and stem strength.`);
  }

  // Organic Carbon (%)
  if (oc < 0.5) {
    recommendations.push(`Organic carbon is CRITICAL (${oc}%). Add 5-8 tons of Farm Yard Manure (FYM) or vermicompost before land preparation.`);
  } else {
    recommendations.push(`Soil organic matter is healthy (${oc}%). Encourages high water holding capacity and beneficial rhizosphere.`);
  }

  if (n >= 280 && p >= 23 && k >= 140 && ph >= 6.2 && ph <= 7.5 && oc >= 0.6) {
    healthRating = 'Optimal';
  }

  return {
    recommendations,
    healthRating,
    fertilizerDoseAdvice: {
      ureaKg: urea,
      dapKg: dap,
      potashMOPKg: mop,
      zincKg: zinc
    }
  };
};

// @desc    Get all soil tests for user
// @route   GET /api/soil
// @access  Private
export const getSoilTests = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    if (req.query.farmId) {
      query.farm = req.query.farmId;
    }

    const tests = await SoilTest.find(query)
      .populate('farm', 'name location totalArea soilType')
      .sort({ testDate: -1 });

    res.json({ success: true, count: tests.length, data: tests });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single soil test
// @route   GET /api/soil/:id
// @access  Private
export const getSoilTestById = async (req, res, next) => {
  try {
    const test = await SoilTest.findById(req.params.id).populate('farm', 'name location totalArea');
    if (!test) {
      return res.status(404).json({ success: false, message: 'Soil test record not found' });
    }

    if (test.user.toString() !== req.user._id.toString() && !['admin', 'expert'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this record' });
    }

    res.json({ success: true, data: test });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new soil test record
// @route   POST /api/soil
// @access  Private
export const createSoilTest = async (req, res, next) => {
  try {
    const {
      farm,
      testDate,
      laboratoryName,
      sampleDepth,
      nitrogen,
      phosphorus,
      potassium,
      pH,
      organicCarbon,
      electricalConductivity,
      moisturePercent
    } = req.body;

    const farmDoc = await Farm.findById(farm);
    if (!farmDoc) {
      return res.status(404).json({ success: false, message: 'Farm not found' });
    }

    const n = Number(nitrogen) || 240;
    const p = Number(phosphorus) || 22;
    const k = Number(potassium) || 180;
    const ph = Number(pH) || 6.8;
    const oc = Number(organicCarbon) || 0.65;

    const analysis = analyzeSoilMetrics(n, p, k, ph, oc);

    const soilTest = await SoilTest.create({
      user: req.user._id,
      farm,
      testDate: testDate || Date.now(),
      laboratoryName: laboratoryName || 'AgriTech Central Soil Laboratory',
      sampleDepth: sampleDepth || '0 - 15 cm (Tillage zone)',
      nitrogen: n,
      phosphorus: p,
      potassium: k,
      pH: ph,
      organicCarbon: oc,
      electricalConductivity: Number(electricalConductivity) || 0.35,
      moisturePercent: Number(moisturePercent) || 28,
      healthRating: analysis.healthRating,
      recommendations: analysis.recommendations,
      fertilizerDoseAdvice: analysis.fertilizerDoseAdvice
    });

    const populatedTest = await SoilTest.findById(soilTest._id).populate('farm', 'name location');

    res.status(201).json({ success: true, data: populatedTest });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a soil test
// @route   DELETE /api/soil/:id
// @access  Private
export const deleteSoilTest = async (req, res, next) => {
  try {
    const test = await SoilTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Soil test record not found' });
    }

    if (test.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this record' });
    }

    await test.deleteOne();
    res.json({ success: true, message: 'Soil test record removed successfully' });
  } catch (error) {
    next(error);
  }
};
