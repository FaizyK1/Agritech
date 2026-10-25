import mongoose from 'mongoose';

const soilTestSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Please select the farm tested']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    testDate: {
      type: Date,
      default: Date.now
    },
    laboratoryName: {
      type: String,
      default: 'AgriTech Central Soil Testing Lab'
    },
    sampleDepth: {
      type: String,
      default: '0 - 15 cm'
    },
    nitrogen: {
      type: Number, // kg/ha or rating
      required: [true, 'Nitrogen value (N) is required'],
      default: 240
    },
    phosphorus: {
      type: Number, // kg/ha
      required: [true, 'Phosphorus value (P) is required'],
      default: 22
    },
    potassium: {
      type: Number, // kg/ha
      required: [true, 'Potassium value (K) is required'],
      default: 180
    },
    pH: {
      type: Number,
      required: [true, 'pH level is required'],
      default: 6.8
    },
    organicCarbon: {
      type: Number, // %
      default: 0.65
    },
    electricalConductivity: {
      type: Number, // dS/m
      default: 0.35
    },
    moisturePercent: {
      type: Number, // %
      default: 28
    },
    healthRating: {
      type: String,
      enum: ['Optimal', 'Good Fertility', 'Moderate Deficiencies', 'Degraded Soil', 'Alkaline', 'Acidic'],
      default: 'Good Fertility'
    },
    recommendations: {
      type: [String],
      default: [
        'Apply 50 kg/ha of Urea in two equal splits during vegetative stage.',
        'Incorporate well-decomposed FYM (Farm Yard Manure) to boost organic carbon.',
        'Soil pH is ideal for Wheat, Rice, Mustard, and Cotton.'
      ]
    },
    fertilizerDoseAdvice: {
      ureaKg: { type: Number, default: 45 },
      dapKg: { type: Number, default: 35 },
      potashMOPKg: { type: Number, default: 20 },
      zincKg: { type: Number, default: 5 }
    }
  },
  {
    timestamps: true
  }
);

const SoilTest = mongoose.model('SoilTest', soilTestSchema);
export default SoilTest;
