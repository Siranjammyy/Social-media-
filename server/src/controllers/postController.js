import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import { getDemoUserByUsername } from '../config/demoUsers.js';
import { DEMO_POSTS } from '../config/demoData.js';

// Helper to attach isLiked and isBookmarked flags
export const enrichPostsWithUserFlags = async (posts, currentUserId) => {
  if (!posts || posts.length === 0) return [];

  const postIds = posts.map((p) => p._id);

  let likedPostIds = new Set();
  let bookmarkedPostIds = new Set();

  if (currentUserId && mongoose.connection.readyState === 1) {
    try {
      const [likes, bookmarks] = await Promise.all([
        Like.find({ user: currentUserId, post: { $in: postIds } }).select('post'),
        Bookmark.find({ user: currentUserId, post: { $in: postIds } }).select('post'),
      ]);

      likedPostIds = new Set(likes.map((l) => l.post.toString()));
      bookmarkedPostIds = new Set(bookmarks.map((b) => b.post.toString()));
    } catch (dbErr) {
      // Graceful fallback for offline mode
    }
  }

  return posts.map((post) => {
    const postObj = post.toObject ? post.toObject() : post;
    const authorId = postObj.author?._id || postObj.author;
    return {
      ...postObj,
      isLiked: likedPostIds.has(postObj._id.toString()),
      isBookmarked: bookmarkedPostIds.has(postObj._id.toString()),
      isAuthor: currentUserId ? currentUserId.toString() === authorId.toString() : false,
    };
  });
};

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
export const createPost = async (req, res, next) => {
  try {
    const { text, media, visibility, location } = req.body;

    if (!text && (!media || media.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain either text or media.',
      });
    }

    const postVisibility = ['public', 'followers', 'private'].includes(visibility)
      ? visibility
      : 'public';

    const post = await Post.create({
      author: req.user._id,
      text: text ? text.trim() : '',
      media: Array.isArray(media) ? media : [],
      visibility: postVisibility,
      location: location ? location.trim() : '',
    });

    // Increment user's posts count
    await User.findByIdAndUpdate(req.user._id, { $inc: { postsCount: 1 } });

    // Handle mentions notifications
    if (post.mentions && post.mentions.length > 0) {
      const mentionedUsers = await User.find({
        normalizedUsername: { $in: post.mentions },
        _id: { $ne: req.user._id },
      });

      for (const mUser of mentionedUsers) {
        await Notification.create({
          recipient: mUser._id,
          actor: req.user._id,
          type: 'mention',
          resourceType: 'post',
          resourceId: post._id,
          message: `${req.user.name} mentioned you in a post.`,
        });
      }
    }

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name username avatar isVerified'
    );

    const enriched = (await enrichPostsWithUserFlags([populatedPost], req.user._id))[0];

    res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      post: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public (with optionalAuth)
export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'author',
      'name username avatar bio isVerified accountVisibility blockedUsers'
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found or has been removed.',
      });
    }

    const currentUserId = req.user ? req.user._id : null;
    const isAuthor = currentUserId && currentUserId.toString() === post.author._id.toString();

    // Check blocking
    if (currentUserId && !isAuthor) {
      if (
        post.author.blockedUsers?.includes(currentUserId) ||
        req.user.blockedUsers?.includes(post.author._id)
      ) {
        return res.status(403).json({
          success: false,
          message: 'You cannot view this post.',
        });
      }
    }

    // Check visibility permissions
    if (post.visibility === 'private' && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'This post is private.',
      });
    }

    if (post.visibility === 'followers' && !isAuthor) {
      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          message: 'This post is visible to followers only. Please log in.',
        });
      }
      const isFollowing = await Follow.exists({
        follower: currentUserId,
        following: post.author._id,
        status: 'accepted',
      });
      if (!isFollowing) {
        return res.status(403).json({
          success: false,
          message: 'This post is visible to followers only.',
        });
      }
    }

    const enriched = (await enrichPostsWithUserFlags([post], currentUserId))[0];

    res.status(200).json({
      success: true,
      post: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update own post
// @route   PATCH /api/posts/:id
// @access  Private
export const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this post.',
      });
    }

    const { text, visibility, location } = req.body;

    if (text !== undefined) post.text = text.trim();
    if (location !== undefined) post.location = location.trim();
    if (visibility && ['public', 'followers', 'private'].includes(visibility)) {
      post.visibility = visibility;
    }
    post.isEdited = true;

    await post.save();

    const populatedPost = await Post.findById(post._id).populate(
      'author',
      'name username avatar isVerified'
    );

    const enriched = (await enrichPostsWithUserFlags([populatedPost], req.user._id))[0];

    res.status(200).json({
      success: true,
      message: 'Post updated successfully.',
      post: enriched,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own post or admin delete
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const isAuthor = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this post.',
      });
    }

    // Delete post and cascade delete likes, comments, bookmarks, and notifications
    await Promise.all([
      Post.findByIdAndDelete(post._id),
      Like.deleteMany({ post: post._id }),
      Comment.deleteMany({ post: post._id }),
      Bookmark.deleteMany({ post: post._id }),
      Notification.deleteMany({ resourceType: 'post', resourceId: post._id }),
      User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's posts (posts, replies, media, or likes)
// @route   GET /api/users/:username/posts
// @access  Public (with optionalAuth)
export const getUserPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.trim().toLowerCase().replace('@', '');
    const tab = req.query.tab || 'posts'; // 'posts', 'media', 'likes'
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const currentUserId = req.user ? req.user._id : null;
    const isDbConnected = mongoose.connection.readyState === 1;

    let user;
    if (isDbConnected) {
      try {
        user = await User.findOne({ normalizedUsername: cleanUsername });
      } catch (dbErr) {
        // Fall back to demo user
      }
    }

    if (!user) {
      user = getDemoUserByUsername(cleanUsername);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isOwner = Boolean(
      currentUserId &&
        (currentUserId.toString() === user._id.toString() ||
          (req.user?.username && req.user.username.toLowerCase() === cleanUsername))
    );

    // If database is offline, serve demo posts authored by this user
    if (!isDbConnected) {
      let userDemoPosts = DEMO_POSTS.filter(
        (p) =>
          p.author.username?.toLowerCase() === cleanUsername ||
          p.author._id === user._id ||
          (user.username && p.author.username?.toLowerCase() === user.username.toLowerCase())
      );

      if (tab === 'media') {
        userDemoPosts = userDemoPosts.filter((p) => p.media && p.media.length > 0);
      } else if (tab === 'likes') {
        userDemoPosts = DEMO_POSTS.filter((p) => p.isLiked);
      }

      // If user has no specific post in sample seed, show sample posts so profile feels alive
      if (userDemoPosts.length === 0 && tab === 'posts') {
        userDemoPosts = DEMO_POSTS.slice(0, 2).map((p) => ({
          ...p,
          author: {
            _id: user._id,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            isVerified: user.isVerified,
          },
        }));
      }

      const enriched = userDemoPosts.map((p) => ({
        ...p,
        isAuthor: isOwner,
      }));

      return res.status(200).json({
        success: true,
        posts: enriched,
        pagination: {
          page: 1,
          limit,
          total: enriched.length,
          pages: 1,
        },
      });
    }

    // Check blocked
    if (currentUserId && !isOwner) {
      if (user.blockedUsers?.includes(currentUserId) || req.user?.blockedUsers?.includes(user._id)) {
        return res.status(403).json({ success: false, message: 'Content not available.' });
      }
    }

    // Check account visibility
    if (user.accountVisibility === 'private' && !isOwner) {
      if (!currentUserId) {
        return res.status(403).json({ success: false, message: 'This account is private.' });
      }
      const isFollowing = await Follow.exists({
        follower: currentUserId,
        following: user._id,
        status: 'accepted',
      });
      if (!isFollowing) {
        return res.status(403).json({ success: false, message: 'This account is private. Follow to view posts.' });
      }
    }

    let query = {};
    let posts = [];
    let total = 0;

    if (tab === 'likes') {
      const likes = await Like.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'post',
          populate: { path: 'author', select: 'name username avatar isVerified' },
        });

      total = await Like.countDocuments({ user: user._id });
      posts = likes.map((l) => l.post).filter(Boolean);
    } else {
      query.author = user._id;

      if (!isOwner) {
        query.visibility = { $in: ['public', 'followers'] };
      }

      if (tab === 'media') {
        query.media = { $exists: true, $not: { $size: 0 } };
      }

      total = await Post.countDocuments(query);
      posts = await Post.find(query)
        .populate('author', 'name username avatar isVerified')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }

    const enriched = await enrichPostsWithUserFlags(posts, currentUserId);

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
    // Ultimate fallback for demo accounts
    const cleanUsername = req.params.username?.trim().toLowerCase().replace('@', '');
    let fallbackPosts = DEMO_POSTS.filter((p) => p.author.username?.toLowerCase() === cleanUsername);
    if (fallbackPosts.length === 0) fallbackPosts = DEMO_POSTS.slice(0, 2);

    res.status(200).json({
      success: true,
      posts: fallbackPosts,
      pagination: {
        page: 1,
        limit: 10,
        total: fallbackPosts.length,
        pages: 1,
      },
    });
  }
};
