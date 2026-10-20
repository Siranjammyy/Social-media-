import mongoose from 'mongoose';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import Post from '../models/Post.js';
import Like from '../models/Like.js';
import Comment from '../models/Comment.js';
import Bookmark from '../models/Bookmark.js';
import { getDemoUserByUsername, getDemoUserById, DEMO_USERS } from '../config/demoUsers.js';

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public (with optionalAuth)
export const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const cleanUsername = username.trim().toLowerCase().replace('@', '');
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
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (user.isSuspended) {
      return res.status(404).json({
        success: false,
        message: 'This account has been suspended.',
      });
    }

    const currentUserId = req.user ? req.user._id : null;
    const isOwner = Boolean(
      currentUserId &&
        (currentUserId.toString() === user._id.toString() ||
          (req.user?.username && req.user.username.toLowerCase() === cleanUsername))
    );

    let isFollowing = false;
    let isFollowPending = false;
    let isBlocked = false;
    let isMuted = false;

    if (isDbConnected && currentUserId && !isOwner) {
      // Check if current user is blocked by target user or has blocked target user
      if (
        user.blockedUsers?.includes(currentUserId) ||
        req.user?.blockedUsers?.includes(user._id)
      ) {
        isBlocked = true;
      }

      if (req.user?.mutedUsers?.includes(user._id)) {
        isMuted = true;
      }

      try {
        const followRecord = await Follow.findOne({
          follower: currentUserId,
          following: user._id,
        });

        if (followRecord) {
          if (followRecord.status === 'accepted') {
            isFollowing = true;
          } else if (followRecord.status === 'pending') {
            isFollowPending = true;
          }
        }
      } catch (fErr) {
        // Fallback for follow status
      }
    }

    // Refresh dynamic counts or fallback to user defaults
    let postsCount = user.postsCount || 0;
    let followersCount = user.followersCount || 0;
    let followingCount = user.followingCount || 0;

    if (isDbConnected) {
      try {
        const [pCount, fCount, fgCount] = await Promise.all([
          Post.countDocuments({ author: user._id, visibility: { $ne: 'private' } }),
          Follow.countDocuments({ following: user._id, status: 'accepted' }),
          Follow.countDocuments({ follower: user._id, status: 'accepted' }),
        ]);
        postsCount = pCount;
        followersCount = fCount;
        followingCount = fgCount;
      } catch (countErr) {
        // Keep user's predefined counts
      }
    }

    const rawUser = user.toJSON ? user.toJSON() : { ...user };

    const userProfile = {
      ...rawUser,
      postsCount,
      followersCount,
      followingCount,
      isOwner,
      isFollowing,
      isFollowPending,
      isBlocked,
      isMuted,
    };

    return res.status(200).json({
      success: true,
      user: userProfile,
    });
  } catch (error) {
    // Ultimate demo fallback if username matches any demo user
    const fallbackDemo = getDemoUserByUsername(req.params.username);
    if (fallbackDemo) {
      return res.status(200).json({
        success: true,
        user: {
          ...fallbackDemo,
          isOwner: req.user?.username?.toLowerCase() === fallbackDemo.username.toLowerCase(),
          isFollowing: false,
          isFollowPending: false,
          isBlocked: false,
          isMuted: false,
        },
      });
    }
    next(error);
  }
};

// @desc    Update current user profile
// @route   PATCH /api/users/me
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name',
      'bio',
      'avatar',
      'coverImage',
      'website',
      'location',
      'accountVisibility',
      'interests',
      'preferences',
    ];

    const updates = {};
    for (const key of Object.keys(req.body)) {
      if (allowedFields.includes(key)) {
        updates[key] = req.body[key];
      }
    }

    if (req.body.username && req.body.username.toLowerCase() !== req.user.username) {
      const cleanUsername = req.body.username.trim().toLowerCase();
      const existing = await User.findOne({ normalizedUsername: cleanUsername });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken.',
        });
      }
      updates.username = cleanUsername;
      updates.normalizedUsername = cleanUsername;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete onboarding
// @route   POST /api/users/onboarding
// @access  Private
export const completeOnboarding = async (req, res, next) => {
  try {
    const { avatar, bio, interests } = req.body;

    const updates = {
      onboardingCompleted: true,
    };

    if (avatar) updates.avatar = avatar;
    if (bio !== undefined) updates.bio = bio;
    if (Array.isArray(interests)) updates.interests = interests;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully!',
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get suggested users to follow
// @route   GET /api/users/suggestions
// @access  Private
export const getSuggestedUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;

    // Get IDs of users current user already follows
    const currentFollows = await Follow.find({ follower: req.user._id }).select('following');
    const followingIds = currentFollows.map((f) => f.following);

    // Exclude current user, blocked users, and already followed users
    const excludedIds = [req.user._id, ...(req.user.blockedUsers || []), ...followingIds];

    const suggestions = await User.find({
      _id: { $nin: excludedIds },
      isSuspended: false,
    })
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(limit)
      .select('name username avatar bio followersCount isVerified');

    res.status(200).json({
      success: true,
      users: suggestions,
    });
  } catch (error) {
    // Demo suggestions fallback
    const suggestions = Object.values(DEMO_USERS)
      .filter((u) => u._id !== req.user?._id && u.username !== req.user?.username)
      .slice(0, 5)
      .map((u) => ({
        _id: u._id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        followersCount: u.followersCount,
        isVerified: u.isVerified,
      }));

    res.status(200).json({
      success: true,
      users: suggestions,
    });
  }
};

// @desc    Block a user
// @route   POST /api/users/:id/block
// @access  Private
export const blockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block yourself.',
      });
    }

    // Add to blockedUsers if not present
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUsers: targetUserId },
    });

    // Remove any follow relationships in both directions
    await Follow.deleteMany({
      $or: [
        { follower: req.user._id, following: targetUserId },
        { follower: targetUserId, following: req.user._id },
      ],
    });

    res.status(200).json({
      success: true,
      message: 'User blocked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a user
// @route   POST /api/users/:id/unblock
// @access  Private
export const unblockUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { blockedUsers: targetUserId },
    });

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mute or unmute a user
// @route   POST /api/users/:id/mute
// @access  Private
export const toggleMuteUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const isMuted = req.user.mutedUsers.includes(targetUserId);

    if (isMuted) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { mutedUsers: targetUserId },
      });
      return res.status(200).json({ success: true, message: 'User unmuted.', isMuted: false });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { mutedUsers: targetUserId },
      });
      return res.status(200).json({ success: true, message: 'User muted.', isMuted: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Permanently delete account
// @route   DELETE /api/users/me
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete user posts, comments, likes, follows, bookmarks
    await Promise.all([
      Post.deleteMany({ author: userId }),
      Comment.deleteMany({ author: userId }),
      Like.deleteMany({ user: userId }),
      Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
      Bookmark.deleteMany({ user: userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.status(200).json({
      success: true,
      message: 'Your account and associated data have been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};
