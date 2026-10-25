import mongoose from 'mongoose';

const pestAlertSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm'
    },
    pestOrDiseaseName: {
      type: String,
      required: [true, 'Please provide pest or disease name'],
      trim: true
    },
    cropAffected: {
      type: String,
      required: [true, 'Please specify the affected crop'],
      trim: true
    },
    pestType: {
      type: String,
      enum: ['Insect Pest', 'Fungal Disease', 'Bacterial Infection', 'Viral Infection', 'Weed Infestation', 'Nutrient Deficiency'],
      default: 'Fungal Disease'
    },
    severity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical Outbreak'],
      default: 'Moderate'
    },
    region: {
      type: String,
      required: [true, 'Please provide affected region or district'],
      default: 'Northern Plains'
    },
    symptoms: {
      type: String,
      required: [true, 'Please describe observed symptoms']
    },
    treatmentAdvice: {
      type: String,
      required: [true, 'Please describe chemical or biological control actions']
    },
    preventiveMeasures: {
      type: String,
      default: 'Practice crop rotation, clean field borders, and avoid excessive overhead sprinkling.'
    },
    status: {
      type: String,
      enum: ['Active Warning', 'Under Surveillance', 'Contained', 'Resolved'],
      default: 'Active Warning'
    },
    isVerifiedByExpert: {
      type: Boolean,
      default: true
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80'
    }
  },
  {
    timestamps: true
  }
);

const PestAlert = mongoose.model('PestAlert', pestAlertSchema);
export default PestAlert;
