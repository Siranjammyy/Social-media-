import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Get comments for a post
// @route   GET /api/posts/:postId/comments
// @access  Public (with optionalAuth)
export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Comment.countDocuments({ post: postId, parentComment: null });

    const comments = await Comment.find({ post: postId, parentComment: null })
      .populate('author', 'name username avatar isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Fetch replies for each comment
    const commentIds = comments.map((c) => c._id);
    const replies = await Comment.find({ parentComment: { $in: commentIds } })
      .populate('author', 'name username avatar isVerified')
      .sort({ createdAt: 1 });

    const currentUserId = req.user ? req.user._id.toString() : null;

    const repliesByParent = {};
    replies.forEach((r) => {
      const pId = r.parentComment?.toString();
      if (!pId) return;
      if (!repliesByParent[pId]) repliesByParent[pId] = [];
      const rObj = r.toObject ? r.toObject() : { ...r };
      rObj.isAuthor = currentUserId && r.author ? currentUserId === r.author._id?.toString() : false;
      rObj.isLiked = currentUserId ? r.likes?.some(id => id.toString() === currentUserId) : false;
      repliesByParent[pId].push(rObj);
    });

    const structuredComments = comments.map((c) => {
      const cObj = c.toObject ? c.toObject() : { ...c };
      cObj.replies = repliesByParent[c._id.toString()] || [];
      cObj.isAuthor = currentUserId && c.author ? currentUserId === c.author._id?.toString() : false;
      cObj.isLiked = currentUserId ? c.likes?.some(id => id.toString() === currentUserId) : false;
      return cObj;
    });

    res.status(200).json({
      success: true,
      comments: structuredComments,
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

// @desc    Create a comment or reply
// @route   POST /api/posts/:postId/comments
// @access  Private
export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { text, parentCommentId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text cannot be empty.',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.',
      });
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found.',
        });
      }
    }

    const comment = await Comment.create({
      post: postId,
      author: req.user._id,
      text: text.trim(),
      parentComment: parentComment ? parentComment._id : null,
    });

    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    const populatedComment = await Comment.findById(comment._id).populate(
      'author',
      'name username avatar isVerified'
    );

    // Send notification
    if (parentComment && parentComment.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: parentComment.author,
        actor: req.user._id,
        type: 'reply',
        resourceType: 'post',
        resourceId: postId,
        message: `${req.user.name} replied to your comment.`,
      });
    } else if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: req.user._id,
        type: 'comment',
        resourceType: 'post',
        resourceId: postId,
        message: `${req.user.name} commented on your post.`,
      });
    }

    const commentObj = populatedComment.toObject();
    commentObj.replies = [];
    commentObj.isAuthor = true;
    commentObj.isLiked = false;

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      comment: commentObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found.',
      });
    }

    const post = await Post.findById(comment.post);
    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
    }

    // Delete comment and child replies
    const childRepliesCount = await Comment.countDocuments({ parentComment: comment._id });
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(comment._id);

    // Decrement post comment count (1 + child replies)
    const decrementTotal = 1 + childRepliesCount;
    await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -decrementTotal } });

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
