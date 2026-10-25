import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true
    },
    category: {
      type: String,
      enum: [
        'Fresh Produce',
        'Grains & Cereals',
        'Certified Seeds',
        'Bio Fertilizers & Soil Nutrients',
        'Eco-Friendly Pesticides',
        'Smart Farming Tools & Equipment'
      ],
      required: [true, 'Please select category']
    },
    description: {
      type: String,
      required: [true, 'Please provide product details']
    },
    price: {
      type: Number,
      required: [true, 'Please provide price per unit'],
      min: [1, 'Price must be greater than zero']
    },
    unit: {
      type: String,
      enum: ['kg', 'quintal', 'bag (50kg)', 'ton', 'box', 'piece', 'liter'],
      default: 'quintal'
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please provide quantity in stock'],
      default: 10
    },
    location: {
      type: String,
      default: 'Ludhiana, Punjab'
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=80'
    },
    status: {
      type: String,
      enum: ['Available', 'Low Stock', 'Out of Stock'],
      default: 'Available'
    },
    rating: {
      type: Number,
      default: 4.8
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
