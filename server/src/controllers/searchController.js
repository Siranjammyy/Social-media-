import User from '../models/User.js';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import { enrichPostsWithUserFlags } from './postController.js';

// @desc    Search users by name or username
// @route   GET /api/search/users
// @access  Public (with optionalAuth)
export const searchUsers = async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    if (!q) {
      return res.status(200).json({ success: true, users: [] });
    }

    // Escape regex characters
    const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'i');

    const users = await User.find({
      isSuspended: false,
      $or: [{ name: regex }, { username: regex }],
    })
      .select('name username avatar bio followersCount isVerified')
      .limit(20);

    let followingIds = [];
    if (req.user) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        status: 'accepted',
      }).select('following');
      followingIds = myFollows.map((f) => f.following.toString());
    }

    const results = users.map((u) => ({
      ...u.toJSON(),
      isFollowing: req.user ? followingIds.includes(u._id.toString()) : false,
      isSelf: req.user ? req.user._id.toString() === u._id.toString() : false,
    }));

    res.status(200).json({
      success: true,
      users: results,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search posts by keyword or hashtag
// @route   GET /api/search/posts
// @access  Public (with optionalAuth)
export const searchPosts = async (req, res, next) => {
  try {
    const q = req.query.q ? req.query.q.trim() : '';
    const hashtag = req.query.tag ? req.query.tag.trim().toLowerCase().replace('#', '') : null;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let query = { visibility: 'public' };

    if (hashtag) {
      query.hashtags = hashtag;
    } else if (q) {
      const escapedQuery = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.text = { $regex: new RegExp(escapedQuery, 'i') };
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enriched = await enrichPostsWithUserFlags(posts, req.user ? req.user._id : null);

    res.status(200).json({
      success: true,
      posts: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending hashtags
// @route   GET /api/search/trending
// @access  Public
export const getTrendingHashtags = async (req, res, next) => {
  try {
    // Look at posts from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          visibility: 'public',
          hashtags: { $exists: true, $ne: [] },
        },
      },
      { $unwind: '$hashtags' },
      {
        $group: {
          _id: '$hashtags',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      trending,
    });
  } catch (error) {
    next(error);
  }
};
