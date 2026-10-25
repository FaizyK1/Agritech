import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'expert', 'admin'], default: 'farmer' },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const consultationSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    topic: {
      type: String,
      required: [true, 'Please provide consultation topic / title'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Crop Health & Disease',
        'Soil Fertility & Nutrients',
        'Precision Irrigation',
        'Pest Management',
        'Organic Farming Certification',
        'Post-Harvest & Storage'
      ],
      default: 'Crop Health & Disease'
    },
    priority: {
      type: String,
      enum: ['Normal', 'High Priority', 'Urgent / Outbreak'],
      default: 'Normal'
    },
    question: {
      type: String,
      required: [true, 'Please describe your query in detail']
    },
    cropMentioned: {
      type: String,
      default: 'General Farming'
    },
    status: {
      type: String,
      enum: ['Open', 'Expert Assigned', 'In Discussion', 'Advisory Provided', 'Closed'],
      default: 'Open'
    },
    replies: [replySchema]
  },
  {
    timestamps: true
  }
);

const Consultation = mongoose.model('Consultation', consultationSchema);
export default Consultation;
