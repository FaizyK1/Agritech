import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Crop from '../models/Crop.js';
import SoilTest from '../models/SoilTest.js';
import PestAlert from '../models/PestAlert.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Consultation from '../models/Consultation.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agritech';
    await mongoose.connect(mongoUri);
    console.log('[Seeder]: Connected to MongoDB...');

    // Clear existing data
    await User.deleteMany();
    await Farm.deleteMany();
    await Crop.deleteMany();
    await SoilTest.deleteMany();
    await PestAlert.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Consultation.deleteMany();

    console.log('[Seeder]: Previous database records cleared.');

    // 1. Create Seed Users
    // Users pre-hashed or relying on model pre-save hook
    const farmerUser = await User.create({
      name: 'Gurpreet Singh',
      email: 'farmer@agritech.com',
      password: 'farmer123',
      role: 'farmer',
      phone: '+91 98765 43210',
      location: 'Ludhiana, Punjab',
      avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
      bio: 'Progressive multigenerational farmer specializing in precision wheat, basmati paddy, and drip-irrigated mustard.'
    });

    const expertUser = await User.create({
      name: 'Dr. Anita Deshmukh',
      email: 'expert@agritech.com',
      password: 'expert123',
      role: 'expert',
      phone: '+91 98220 11223',
      location: 'Pune Agricultural Research Institute',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Senior Agronomist & Plant Pathologist with 14+ years experience in Integrated Pest Management and Organic Soil Restoration.'
    });

    const adminUser = await User.create({
      name: 'Dev Admin',
      email: 'admin@agritech.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 99000 88776',
      location: 'AgriTech HQ, Chandigarh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Platform System Administrator for AgriTech Smart Farming Ecosystem.'
    });

    console.log('[Seeder]: 3 Users created (Farmer, Expert, Admin).');

    // 2. Create Farms
    const farm1 = await Farm.create({
      user: farmerUser._id,
      name: 'Green Horizon Valley Farm',
      totalArea: 24.5,
      areaUnit: 'Acres',
      soilType: 'Loamy',
      irrigationType: 'Drip Irrigation',
      status: 'Active',
      waterSource: 'Solar Powered Tubewell + Canal',
      description: 'Primary fertile parcel equipped with automated soil tensiometers and drip lateral manifolds.',
      location: {
        address: 'Grand Trunk Agro Corridor, Samrala',
        district: 'Ludhiana',
        state: 'Punjab',
        country: 'India',
        latitude: 30.901,
        longitude: 75.8573
      }
    });

    const farm2 = await Farm.create({
      user: farmerUser._id,
      name: 'Sunrise Organic Orchard & Fields',
      totalArea: 12.0,
      areaUnit: 'Acres',
      soilType: 'Alluvial',
      irrigationType: 'Sprinkler',
      status: 'Active',
      waterSource: 'Borewell Rainwater Harvesting Pond',
      description: 'Certified organic parcel cultivating high-value Kinnow citrus and legumes.',
      location: {
        address: 'Village Jodhan, Sidhwan Canal Road',
        district: 'Ludhiana',
        state: 'Punjab',
        country: 'India',
        latitude: 30.824,
        longitude: 75.768
      }
    });

    console.log('[Seeder]: 2 Farms created.');

    // 3. Create Crops
    const crop1 = await Crop.create({
      user: farmerUser._id,
      farm: farm1._id,
      cropName: 'Golden Sharbati Wheat',
      variety: 'PBW 824 High Yielding',
      category: 'Cereals & Grains',
      plantedArea: 16.0,
      sowingDate: new Date('2026-11-10'),
      expectedHarvestDate: new Date('2027-04-15'),
      stage: 'Flowering',
      healthStatus: 'Excellent',
      estimatedYield: 340,
      yieldUnit: 'Quintals',
      fertilizerApplied: 'DAP Basal + 2 Splits Neem Coated Urea',
      irrigationSchedule: 'Critical stage scheduling (Crown Root & Flowering)',
      notes: 'Canopy density is dense and healthy. Lodging resistance index is high.'
    });

    const crop2 = await Crop.create({
      user: farmerUser._id,
      farm: farm1._id,
      cropName: 'Yellow Mustard',
      variety: 'Giriraj RH-749',
      category: 'Oilseeds',
      plantedArea: 8.5,
      sowingDate: new Date('2026-10-20'),
      expectedHarvestDate: new Date('2027-02-28'),
      stage: 'Grain Filling / Fruiting',
      healthStatus: 'Good',
      estimatedYield: 95,
      yieldUnit: 'Quintals',
      fertilizerApplied: 'Single Super Phosphate + Sulphur Granules',
      irrigationSchedule: 'Light drip every 12 days',
      notes: 'Siliqua pod filling progressing uniformly.'
    });

    const crop3 = await Crop.create({
      user: farmerUser._id,
      farm: farm2._id,
      cropName: 'Basmati Paddy',
      variety: 'Pusa 1121 Export Grade',
      category: 'Cereals & Grains',
      plantedArea: 10.0,
      sowingDate: new Date('2026-06-25'),
      expectedHarvestDate: new Date('2026-10-30'),
      stage: 'Maturity',
      healthStatus: 'Good',
      estimatedYield: 210,
      actualYield: 205,
      yieldUnit: 'Quintals',
      fertilizerApplied: 'Bio-NPK Consortium & Vermicompost',
      irrigationSchedule: 'Alternate Wetting and Drying (AWD)',
      notes: 'Grains golden; ready for direct combine harvesting.'
    });

    console.log('[Seeder]: 3 Crops created.');

    // 4. Create Soil Tests
    await SoilTest.create({
      user: farmerUser._id,
      farm: farm1._id,
      testDate: new Date('2026-10-05'),
      laboratoryName: 'Punjab Agricultural University Testing Cell',
      sampleDepth: '0 - 15 cm',
      nitrogen: 295,
      phosphorus: 28,
      potassium: 210,
      pH: 6.9,
      organicCarbon: 0.72,
      electricalConductivity: 0.28,
      moisturePercent: 32,
      healthRating: 'Optimal',
      recommendations: [
        'Soil fertility is in optimal balance across macro-nutrients.',
        'Nitrogen levels allow standard top dressing without risk of lodging.',
        'pH at 6.9 supports maximum bioavailability of micronutrients (Iron, Zinc).'
      ],
      fertilizerDoseAdvice: {
        ureaKg: 40,
        dapKg: 30,
        potashMOPKg: 15,
        zincKg: 5
      }
    });

    await SoilTest.create({
      user: farmerUser._id,
      farm: farm2._id,
      testDate: new Date('2026-09-18'),
      laboratoryName: 'AgriTech Central Soil Laboratory',
      sampleDepth: '0 - 15 cm',
      nitrogen: 210,
      phosphorus: 18,
      potassium: 160,
      pH: 7.9,
      organicCarbon: 0.48,
      electricalConductivity: 0.42,
      moisturePercent: 25,
      healthRating: 'Alkaline',
      recommendations: [
        'Slightly alkaline soil (pH 7.9). Incorporate Gypsum (CaSO4) at 500 kg/acre.',
        'Organic carbon is marginally low (0.48%). Apply 5 tons/acre of composted FYM.',
        'Supplement Zinc Sulphate (21%) to avoid interveinal chlorosis.'
      ],
      fertilizerDoseAdvice: {
        ureaKg: 55,
        dapKg: 45,
        potashMOPKg: 25,
        zincKg: 8
      }
    });

    console.log('[Seeder]: 2 Soil Tests created.');

    // 5. Create Pest Alerts
    await PestAlert.create({
      reporter: expertUser._id,
      farm: farm1._id,
      pestOrDiseaseName: 'Yellow Rust (Puccinia striiformis)',
      cropAffected: 'Wheat',
      pestType: 'Fungal Disease',
      severity: 'High',
      region: 'North-Western Plains (Punjab & Haryana)',
      symptoms: 'Bright yellow powdery stripes and pustules on upper leaf surface, reducing chlorophyll photosynthetic area.',
      treatmentAdvice: 'Spray Propiconazole 25% EC @ 1ml per liter of water (200 ml/acre in 200L water) or Tebuconazole 25.9% EC upon first appearance.',
      preventiveMeasures: 'Sow rust-resistant varieties like PBW 824 and avoid delayed sowing.',
      status: 'Active Warning',
      isVerifiedByExpert: true,
      imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop&q=80'
    });

    await PestAlert.create({
      reporter: farmerUser._id,
      farm: farm2._id,
      pestOrDiseaseName: 'Mustard Aphid (Lipaphis erysimi)',
      cropAffected: 'Mustard',
      pestType: 'Insect Pest',
      severity: 'Moderate',
      region: 'Central Punjab Agro-Climatic Zone',
      symptoms: 'Nymphs and adults suck sap from tender shoots, inflorescences, and pods, secreting honeydew.',
      treatmentAdvice: 'Spray Thiamethoxam 25% WG @ 80g/acre or spray 5% Neem Seed Kernel Extract (NSKE) in evening hours.',
      preventiveMeasures: 'Install yellow sticky traps @ 10 traps/acre; encourage natural predators like Ladybird beetles.',
      status: 'Under Surveillance',
      isVerifiedByExpert: true,
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80'
    });

    console.log('[Seeder]: 2 Pest Alerts created.');

    // 6. Create Marketplace Products
    const prod1 = await Product.create({
      seller: farmerUser._id,
      title: 'Premium Sharbati Wheat Grain (Grade A)',
      category: 'Grains & Cereals',
      description: 'Organically nourished, sun-dried, golden Sharbati wheat grains. Moisture content below 10%, zero pest infestation. Perfect for whole wheat flour.',
      price: 2850,
      unit: 'quintal',
      stockQuantity: 120,
      location: 'Samrala Mandi, Punjab',
      imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=80',
      status: 'Available',
      rating: 4.9
    });

    const prod2 = await Product.create({
      seller: farmerUser._id,
      title: 'Certified Pusa 1121 Basmati Paddy',
      category: 'Grains & Cereals',
      description: 'Long-grain aromatic export grade Basmati paddy harvested using combine machines, thoroughly cleaned and moisture-tested.',
      price: 4350,
      unit: 'quintal',
      stockQuantity: 80,
      location: 'Khanna Grain Market, Punjab',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=80',
      status: 'Available',
      rating: 4.8
    });

    const prod3 = await Product.create({
      seller: adminUser._id,
      title: 'Bio-Enriched Vermicompost (50kg Bag)',
      category: 'Bio Fertilizers & Soil Nutrients',
      description: '100% pure Eisenia fetida earthworm castings enriched with Trichoderma viride and Pseudomonas. Boosts soil microbial respiration.',
      price: 450,
      unit: 'bag (50kg)',
      stockQuantity: 250,
      location: 'AgriTech Central Warehouse, Ludhiana',
      imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&auto=format&fit=crop&q=80',
      status: 'Available',
      rating: 5.0
    });

    const prod4 = await Product.create({
      seller: adminUser._id,
      title: 'Automatic Solar Drip Controller Kit',
      category: 'Smart Farming Tools & Equipment',
      description: 'Solar-powered solenoid valve automation unit with smartphone telemetry, automatic moisture cut-off, and low-pressure alarms.',
      price: 8900,
      unit: 'piece',
      stockQuantity: 18,
      location: 'AgriTech Tech Hub, Mohali',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
      status: 'Available',
      rating: 4.9
    });

    console.log('[Seeder]: 4 Marketplace Products created.');

    // 7. Create Orders
    await Order.create({
      buyer: farmerUser._id,
      items: [
        {
          product: prod3._id,
          title: prod3.title,
          price: prod3.price,
          quantity: 10,
          unit: prod3.unit,
          seller: adminUser._id
        }
      ],
      totalAmount: 4500,
      shippingAddress: {
        fullName: 'Gurpreet Singh',
        phone: '+91 98765 43210',
        street: 'Green Horizon Farm, Canal Road',
        city: 'Samrala',
        state: 'Punjab',
        postalCode: '141114'
      },
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      deliveryEstimate: 'Delivered on Oct 22',
      notes: 'Please call before unloading near barn gate.'
    });

    console.log('[Seeder]: 1 Sample Order created.');

    // 8. Create Consultations
    await Consultation.create({
      farmer: farmerUser._id,
      expert: expertUser._id,
      topic: 'Optimal Micronutrient Spray Schedule for Pre-Flowering Wheat',
      category: 'Crop Health & Disease',
      priority: 'High Priority',
      cropMentioned: 'Wheat PBW 824',
      question: 'Our crop is approaching flag leaf stage. Should we spray Zinc EDTA along with Urea, or does it cause scorch during daytime temperatures around 28°C?',
      status: 'Advisory Provided',
      replies: [
        {
          sender: farmerUser._id,
          senderName: 'Gurpreet Singh',
          role: 'farmer',
          message: 'Our crop is approaching flag leaf stage. Should we spray Zinc EDTA along with Urea, or does it cause scorch during daytime temperatures around 28°C?',
          createdAt: new Date('2026-10-23T09:00:00Z')
        },
        {
          sender: expertUser._id,
          senderName: 'Dr. Anita Deshmukh',
          role: 'expert',
          message: 'Namaste Gurpreet ji. Yes, Chelate Zinc (Zn-EDTA 12%) @ 1g/liter mixed with 2% spray-grade Urea is safe, provided foliar application is conducted between 3:30 PM and 6:00 PM when stomatal conductance is receptive and evaporative scorch risk is negligible.',
          createdAt: new Date('2026-10-23T14:30:00Z')
        }
      ]
    });

    console.log('[Seeder]: 1 Consultation thread created.');
    console.log('\n======================================================');
    console.log('✅ AgriTech Database Seeded Successfully!');
    console.log('======================================================');
    console.log('Demo Credentials:');
    console.log('  👨‍🌾 Farmer: farmer@agritech.com | farmer123');
    console.log('  🔬 Expert: expert@agritech.com | expert123');
    console.log('  👑 Admin:  admin@agritech.com  | admin123');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
