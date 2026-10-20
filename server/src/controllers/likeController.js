import Like from '../models/Like.js';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

// @desc    Like a post
// @route   PUT /api/posts/:id/like
// @access  Private
export const likePost = async (req, res, next) => {
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

    // Check if like already exists (idempotent)
    const existingLike = await Like.findOne({ user: userId, post: postId });
    if (existingLike) {
      return res.status(200).json({
        success: true,
        message: 'Post already liked.',
        isLiked: true,
        likeCount: post.likeCount,
      });
    }

    await Like.create({
      user: userId,
      post: postId,
      reaction: req.body.reaction || 'like',
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likeCount: 1 } },
      { new: true }
    );

    // Notify author if not the liker
    if (post.author.toString() !== userId.toString()) {
      await Notification.create({
        recipient: post.author,
        actor: userId,
        type: 'like',
        resourceType: 'post',
        resourceId: post._id,
        message: `${req.user.name} liked your post.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post liked.',
      isLiked: true,
      likeCount: updatedPost.likeCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlike a post
// @route   DELETE /api/posts/:id/like
// @access  Private
export const unlikePost = async (req, res, next) => {
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

    const deletedLike = await Like.findOneAndDelete({ user: userId, post: postId });

    let likeCount = post.likeCount;
    if (deletedLike) {
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $inc: { likeCount: -1 } },
        { new: true }
      );
      likeCount = Math.max(0, updatedPost.likeCount);

      // Clean up like notification
      await Notification.deleteMany({
        actor: userId,
        recipient: post.author,
        resourceId: postId,
        type: 'like',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post unliked.',
      isLiked: false,
      likeCount,
    });
  } catch (error) {
    next(error);
  }
};
