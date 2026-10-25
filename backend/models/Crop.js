import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: [true, 'Please select a farm']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    cropName: {
      type: String,
      required: [true, 'Please provide crop name'],
      trim: true
    },
    variety: {
      type: String,
      default: 'Standard Hybrid'
    },
    category: {
      type: String,
      enum: ['Cereals & Grains', 'Pulses & Legumes', 'Vegetables', 'Fruits', 'Cash Crops', 'Oilseeds', 'Spices'],
      default: 'Cereals & Grains'
    },
    plantedArea: {
      type: Number,
      required: [true, 'Please provide planted area in acres/units'],
      min: [0.1, 'Planted area must be positive']
    },
    sowingDate: {
      type: Date,
      required: [true, 'Please provide sowing date'],
      default: Date.now
    },
    expectedHarvestDate: {
      type: Date,
      required: [true, 'Please provide expected harvest date']
    },
    stage: {
      type: String,
      enum: ['Germination', 'Vegetative', 'Flowering', 'Grain Filling / Fruiting', 'Maturity', 'Harvested'],
      default: 'Vegetative'
    },
    healthStatus: {
      type: String,
      enum: ['Excellent', 'Good', 'Moderate', 'Needs Attention', 'Pest Affected'],
      default: 'Good'
    },
    estimatedYield: {
      type: Number,
      default: 0
    },
    actualYield: {
      type: Number,
      default: 0
    },
    yieldUnit: {
      type: String,
      enum: ['Quintals', 'Tons', 'Kilograms', 'Bags'],
      default: 'Quintals'
    },
    fertilizerApplied: {
      type: String,
      default: 'DAP & Urea (Split application)'
    },
    irrigationSchedule: {
      type: String,
      default: 'Every 7-10 days'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Crop = mongoose.model('Crop', cropSchema);
export default Crop;
