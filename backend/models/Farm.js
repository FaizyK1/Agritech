import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Please provide farm name'],
      trim: true
    },
    location: {
      address: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      latitude: { type: Number, default: 30.7333 },
      longitude: { type: Number, default: 76.7794 }
    },
    totalArea: {
      type: Number,
      required: [true, 'Please provide total farm area'],
      min: [0.1, 'Farm area must be greater than 0']
    },
    areaUnit: {
      type: String,
      enum: ['Acres', 'Hectares', 'Bigha'],
      default: 'Acres'
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Loamy', 'Black Cotton', 'Red Sandy', 'Clay', 'Silt', 'Peaty'],
      default: 'Loamy'
    },
    irrigationType: {
      type: String,
      enum: ['Drip Irrigation', 'Sprinkler', 'Canal / Flood', 'Rainfed', 'Tubewell / Borewell'],
      default: 'Drip Irrigation'
    },
    status: {
      type: String,
      enum: ['Active', 'Fallow', 'Prepared for Sowing', 'Harvest Season'],
      default: 'Active'
    },
    waterSource: {
      type: String,
      default: 'Canal + Borewell'
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

const Farm = mongoose.model('Farm', farmSchema);
export default Farm;
