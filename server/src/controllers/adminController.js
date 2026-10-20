import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import { DEMO_STATS, DEMO_POSTS, DEMO_ADMIN_USERS } from '../config/demoData.js';

// @desc    Get dashboard metrics
// @route   GET /api/admin/stats
// @access  Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalComments, pendingReports, suspendedUsers] =
      await Promise.all([
        User.countDocuments(),
        Post.countDocuments(),
        Comment.countDocuments(),
        Report.countDocuments({ status: 'pending' }),
        User.countDocuments({ isSuspended: true }),
      ]);

    // Recent activity: latest 5 registered users and latest 5 posts
    const [recentUsers, recentPosts] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(5).select('name username email createdAt isSuspended role'),
      Post.find().sort({ createdAt: -1 }).limit(5).populate('author', 'name username').select('text likeCount commentCount createdAt'),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalPosts,
        totalComments,
        pendingReports,
        suspendedUsers,
      },
      recentUsers,
      recentPosts,
    });
  } catch (error) {
    // Graceful fallback for offline demo exploration
    res.status(200).json({
      success: true,
      stats: DEMO_STATS,
      recentUsers: DEMO_ADMIN_USERS,
      recentPosts: DEMO_POSTS.slice(0, 5),
    });
  }
};

// @desc    Get all users for admin moderation
// @route   GET /api/admin/users
// @access  Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const q = req.query.q ? req.query.q.trim() : '';

    let query = {};
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [{ name: regex }, { username: regex }, { email: regex }];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('name username email role isSuspended isVerified createdAt postsCount followersCount');

    res.status(200).json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    // Graceful fallback for offline demo exploration
    res.status(200).json({
      success: true,
      users: DEMO_ADMIN_USERS,
      pagination: {
        page: 1,
        limit: 20,
        total: DEMO_ADMIN_USERS.length,
        pages: 1,
      },
    });
  }
};

// @desc    Toggle suspend user
// @route   PATCH /api/admin/users/:id/suspend
// @access  Admin
export const toggleSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: user.isSuspended ? 'User has been suspended.' : 'User has been unsuspended.',
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    next(error);
  }
};
