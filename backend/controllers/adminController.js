import mongoose from 'mongoose';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import Crop from '../models/Crop.js';
import SoilTest from '../models/SoilTest.js';
import PestAlert from '../models/PestAlert.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Consultation from '../models/Consultation.js';

// @desc    Get complete platform statistics for Admin Dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      farmersCount,
      expertsCount,
      totalFarms,
      totalCrops,
      totalSoilTests,
      totalPestAlerts,
      totalProducts,
      orders
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'expert' }),
      Farm.countDocuments(),
      Crop.countDocuments(),
      SoilTest.countDocuments(),
      PestAlert.countDocuments(),
      Product.countDocuments(),
      Order.find()
    ]);

    const totalOrders = orders.length;
    const totalOrderValue = orders.reduce((sum, ord) => sum + (ord.totalAmount || 0), 0);
    const activeAlerts = await PestAlert.countDocuments({ status: 'Active Warning' });
    const pendingConsultations = await Consultation.countDocuments({ status: { $in: ['Open', 'In Discussion'] } });

    // Recent registered users
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

    // Recent orders
    const recentOrders = await Order.find().populate('buyer', 'name email').sort({ createdAt: -1 }).limit(5);

    // Verified system configuration & telemetry
    const isDbConnected = mongoose.connection.readyState === 1;
    const dbHost = mongoose.connection.host || '';
    const isLocal = dbHost.includes('127.0.0.1') || dbHost.includes('localhost');

    const system = {
      dbConnected: isDbConnected,
      dbStatus: isDbConnected ? 'Connected' : 'Disconnected',
      dbType: 'MongoDB',
      dbEnvironment: isDbConnected ? (isLocal ? 'Local Instance' : 'Remote Cloud Cluster') : 'Disconnected',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
      serverStatus: 'Operational',
      securityStatus: 'JWT & Role Auth Active',
      weatherProvider: 'Open-Meteo REST API'
    };

    res.json({
      success: true,
      data: {
        counts: {
          totalUsers,
          farmers: farmersCount,
          experts: expertsCount,
          totalFarms,
          totalCrops,
          totalSoilTests,
          totalPestAlerts,
          activeAlerts,
          totalProducts,
          totalOrders,
          totalOrderValue,
          pendingConsultations
        },
        system,
        recentUsers,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['farmer', 'expert', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admins cannot delete their own account' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    next(error);
  }
};
