import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import { enrichPostsWithUserFlags } from './postController.js';
import { DEMO_POSTS } from '../config/demoData.js';

// @desc    Get Home Feed (For You)
// @route   GET /api/feed
// @access  Public (with optionalAuth)
export const getForYouFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const currentUserId = req.user ? req.user._id : null;
    let excludedAuthorIds = [];

    if (req.user) {
      excludedAuthorIds = [
        ...(req.user.blockedUsers || []),
        ...(req.user.mutedUsers || []),
      ];
    }

    const query = {
      visibility: 'public',
      ...(excludedAuthorIds.length > 0 && { author: { $nin: excludedAuthorIds } }),
    };

    // If user is logged in, they can also see 'followers' posts from people they actually follow
    if (req.user) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        status: 'accepted',
      }).select('following');
      const followingIds = myFollows.map((f) => f.following);

      query.$or = [
        { visibility: 'public' },
        { visibility: 'followers', author: { $in: followingIds } },
        { author: req.user._id },
      ];
      delete query.visibility;
    }

    const total = await Post.countDocuments(query);

    // Fetch posts and rank by weighted engagement + recency
    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enriched = await enrichPostsWithUserFlags(posts, currentUserId);

    res.status(200).json({
      success: true,
      filter: 'for-you',
      posts: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    // Graceful fallback for offline demo exploration
    const enriched = DEMO_POSTS.map((p) => ({
      ...p,
      isAuthor: req.user ? req.user._id === p.author._id : false,
    }));

    res.status(200).json({
      success: true,
      filter: 'for-you',
      posts: enriched,
      pagination: {
        page: 1,
        limit: 10,
        total: enriched.length,
        pages: 1,
        hasMore: false,
      },
    });
  }
};

// @desc    Get Following Feed
// @route   GET /api/feed/following
// @access  Private
export const getFollowingFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const myFollows = await Follow.find({
      follower: req.user._id,
      status: 'accepted',
    }).select('following');

    const followingIds = myFollows.map((f) => f.following);
    // Include user's own posts and followed accounts' posts
    const allowedAuthors = [...followingIds, req.user._id];

    const query = {
      author: { $in: allowedAuthors },
      visibility: { $in: ['public', 'followers'] },
    };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enriched = await enrichPostsWithUserFlags(posts, req.user._id);

    res.status(200).json({
      success: true,
      filter: 'following',
      posts: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    // Graceful fallback for offline demo exploration
    const enriched = DEMO_POSTS.map((p) => ({
      ...p,
      isAuthor: req.user ? req.user._id === p.author._id : false,
    }));

    res.status(200).json({
      success: true,
      filter: 'following',
      posts: enriched,
      pagination: {
        page: 1,
        limit: 10,
        total: enriched.length,
        pages: 1,
        hasMore: false,
      },
    });
  }
};

// @desc    Get Latest Feed (strictly chronological)
// @route   GET /api/feed/latest
// @access  Public (with optionalAuth)
export const getLatestFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const currentUserId = req.user ? req.user._id : null;
    let excludedAuthorIds = [];

    if (req.user) {
      excludedAuthorIds = [
        ...(req.user.blockedUsers || []),
        ...(req.user.mutedUsers || []),
      ];
    }

    const query = {
      visibility: 'public',
      ...(excludedAuthorIds.length > 0 && { author: { $nin: excludedAuthorIds } }),
    };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name username avatar bio isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const enriched = await enrichPostsWithUserFlags(posts, currentUserId);

    res.status(200).json({
      success: true,
      filter: 'latest',
      posts: enriched,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    // Graceful fallback for offline demo exploration
    const enriched = DEMO_POSTS.map((p) => ({
      ...p,
      isAuthor: req.user ? req.user._id === p.author._id : false,
    }));

    res.status(200).json({
      success: true,
      filter: 'latest',
      posts: enriched,
      pagination: {
        page: 1,
        limit: 10,
        total: enriched.length,
        pages: 1,
        hasMore: false,
      },
    });
  }
};
