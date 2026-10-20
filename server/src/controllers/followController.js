import Follow from '../models/Follow.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Private
export const followUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself.',
      });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser || targetUser.isSuspended) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Check if current user is blocked
    if (targetUser.blockedUsers.includes(currentUserId) || req.user.blockedUsers.includes(targetUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Unable to follow this user.',
      });
    }

    const existingFollow = await Follow.findOne({
      follower: currentUserId,
      following: targetUserId,
    });

    if (existingFollow) {
      return res.status(400).json({
        success: false,
        message: 'You are already following or requested to follow this user.',
        status: existingFollow.status,
      });
    }

    const isPrivate = targetUser.accountVisibility === 'private';
    const status = isPrivate ? 'pending' : 'accepted';

    const follow = await Follow.create({
      follower: currentUserId,
      following: targetUserId,
      status,
    });

    if (status === 'accepted') {
      await Promise.all([
        User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } }),
        User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: 1 } }),
      ]);

      // Notify target user if enabled
      if (targetUser.preferences?.notifyFollows) {
        await Notification.create({
          recipient: targetUserId,
          actor: currentUserId,
          type: 'follow',
          resourceType: 'user',
          resourceId: currentUserId,
          message: `${req.user.name} started following you.`,
        });
      }
    } else {
      // Pending request notification
      await Notification.create({
        recipient: targetUserId,
        actor: currentUserId,
        type: 'follow_request',
        resourceType: 'user',
        resourceId: currentUserId,
        message: `${req.user.name} requested to follow you.`,
      });
    }

    res.status(200).json({
      success: true,
      message: status === 'accepted' ? `You are now following ${targetUser.username}.` : `Follow request sent to ${targetUser.username}.`,
      status,
      isFollowing: status === 'accepted',
      isFollowPending: status === 'pending',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Private
export const unfollowUser = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    const follow = await Follow.findOneAndDelete({
      follower: currentUserId,
      following: targetUserId,
    });

    if (!follow) {
      return res.status(400).json({
        success: false,
        message: 'You are not following this user.',
      });
    }

    if (follow.status === 'accepted') {
      await Promise.all([
        User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } }),
        User.findByIdAndUpdate(currentUserId, { $inc: { followingCount: -1 } }),
      ]);
    }

    // Clean up any pending notifications
    await Notification.deleteMany({
      actor: currentUserId,
      recipient: targetUserId,
      type: { $in: ['follow', 'follow_request'] },
    });

    res.status(200).json({
      success: true,
      message: 'Unfollowed successfully.',
      isFollowing: false,
      isFollowPending: false,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's followers
// @route   GET /api/users/:username/followers
// @access  Public (with optionalAuth)
export const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ normalizedUsername: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const total = await Follow.countDocuments({ following: user._id, status: 'accepted' });
    const follows = await Follow.find({ following: user._id, status: 'accepted' })
      .populate('follower', 'name username avatar bio followersCount isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // If current user is authenticated, check which of these followers the current user follows
    let followingIds = [];
    if (req.user) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        status: 'accepted',
      }).select('following');
      followingIds = myFollows.map((f) => f.following.toString());
    }

    const followersList = follows.map((item) => {
      const u = item.follower;
      if (!u) return null;
      return {
        ...(u.toJSON ? u.toJSON() : u),
        isFollowing: req.user ? followingIds.includes(u._id.toString()) : false,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      followers: followersList,
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

// @desc    Get users followed by a user
// @route   GET /api/users/:username/following
// @access  Public (with optionalAuth)
export const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findOne({ normalizedUsername: username.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const total = await Follow.countDocuments({ follower: user._id, status: 'accepted' });
    const follows = await Follow.find({ follower: user._id, status: 'accepted' })
      .populate('following', 'name username avatar bio followersCount isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    let followingIds = [];
    if (req.user) {
      const myFollows = await Follow.find({
        follower: req.user._id,
        status: 'accepted',
      }).select('following');
      followingIds = myFollows.map((f) => f.following.toString());
    }

    const followingList = follows.map((item) => {
      const u = item.following;
      if (!u) return null;
      return {
        ...(u.toJSON ? u.toJSON() : u),
        isFollowing: req.user ? followingIds.includes(u._id.toString()) : false,
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      following: followingList,
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
