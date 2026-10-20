import Bookmark from '../models/Bookmark.js';
import Post from '../models/Post.js';
import { enrichPostsWithUserFlags } from './postController.js';

// @desc    Toggle bookmark a post
// @route   PUT /api/posts/:id/bookmark
// @access  Private
export const toggleBookmark = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    const existingBookmark = await Bookmark.findOne({ user: userId, post: postId });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      await Post.findByIdAndUpdate(postId, { $inc: { bookmarkCount: -1 } });
      return res.status(200).json({
        success: true,
        message: 'Post removed from bookmarks.',
        isBookmarked: false,
      });
    } else {
      await Bookmark.create({ user: userId, post: postId });
      await Post.findByIdAndUpdate(postId, { $inc: { bookmarkCount: 1 } });
      return res.status(200).json({
        success: true,
        message: 'Post saved to bookmarks.',
        isBookmarked: true,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookmarked posts
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Bookmark.countDocuments({ user: req.user._id });
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'post',
        populate: { path: 'author', select: 'name username avatar bio isVerified' },
      });

    // Filter out posts that might have been deleted
    const validPosts = bookmarks.map((b) => b.post).filter(Boolean);
    const enriched = await enrichPostsWithUserFlags(validPosts, req.user._id);

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
