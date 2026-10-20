import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import PasswordResetToken from '../models/PasswordResetToken.js';
import { signToken, sendTokenCookie, clearTokenCookie } from '../utils/jwt.js';
import { DEMO_USERS, getDemoUserByRoleOrKey } from '../config/demoUsers.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, username, email, password, confirmPassword } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, username, email, and password.',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ normalizedUsername: cleanUsername }, { normalizedEmail: cleanEmail }],
    });

    if (existingUser) {
      if (existingUser.normalizedUsername === cleanUsername) {
        return res.status(400).json({
          success: false,
          message: 'This username is already taken. Please choose another one.',
          field: 'username',
        });
      }
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
        field: 'email',
      });
    }

    // Default avatar based on user name
    const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6c5ce7`;

    const user = await User.create({
      name: name.trim(),
      username: cleanUsername,
      normalizedUsername: cleanUsername,
      email: cleanEmail,
      normalizedEmail: cleanEmail,
      passwordHash: password,
      avatar: defaultAvatar,
      onboardingCompleted: false,
    });

    const token = signToken({ id: user._id, role: user.role });
    sendTokenCookie(res, token);

    const userResponse = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'Account created successfully. Welcome to Aura!',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log in user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email/username and password.',
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Find user by username or email including passwordHash
    const user = await User.findOne({
      $or: [
        { normalizedUsername: cleanIdentifier },
        { normalizedEmail: cleanIdentifier },
      ],
    }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact Nexora support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email/username and password.',
      });
    }

    const token = signToken({ id: user._id, role: user.role });
    sendTokenCookie(res, token);

    const userResponse = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Log out user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logout = async (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// @desc    Instant 1-Click Demo Login
// @route   POST /api/auth/demo-login
// @access  Public
export const demoLogin = async (req, res, next) => {
  try {
    const { role = 'admin' } = req.body || {};
    const demoUser = getDemoUserByRoleOrKey(role);

    const isDbConnected = mongoose.connection.readyState === 1;
    let effectiveUser = {
      _id: demoUser._id,
      name: demoUser.name,
      username: demoUser.username,
      normalizedUsername: demoUser.normalizedUsername,
      email: demoUser.email,
      normalizedEmail: demoUser.normalizedEmail,
      role: demoUser.role,
      avatar: demoUser.avatar,
      coverImage: demoUser.coverImage,
      bio: demoUser.bio,
      website: demoUser.website,
      location: demoUser.location,
      isVerified: demoUser.isVerified,
      onboardingCompleted: true,
      followersCount: demoUser.followersCount,
      followingCount: demoUser.followingCount,
      postsCount: demoUser.postsCount,
      accountVisibility: 'public',
      preferences: demoUser.preferences,
      blockedUsers: [],
      mutedUsers: [],
      isSuspended: false,
    };

    if (isDbConnected) {
      try {
        const dbUser = await User.findOne({
          $or: [
            { normalizedEmail: demoUser.normalizedEmail },
            { normalizedUsername: demoUser.normalizedUsername },
          ],
        });
        if (dbUser) {
          effectiveUser = dbUser.toJSON ? dbUser.toJSON() : dbUser;
        }
      } catch (err) {
        // Fallback cleanly
      }
    }

    const token = signToken({
      id: effectiveUser._id,
      role: effectiveUser.role,
      isDemo: true,
    });

    sendTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: `Welcome, ${effectiveUser.name}! You are logged in with Demo Access (${demoUser.role.toUpperCase()}).`,
      token,
      user: effectiveUser,
      isDemo: true,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    List available demo profiles
// @route   GET /api/auth/demo-users
// @access  Public
export const getDemoUsersList = async (req, res) => {
  const users = Object.entries(DEMO_USERS).map(([key, u]) => ({
    key,
    id: u._id,
    name: u.name,
    username: u.username,
    role: u.role,
    avatar: u.avatar,
    coverImage: u.coverImage,
    bio: u.bio,
    badge:
      key === 'admin'
        ? 'Platform Administrator'
        : key === 'designer'
        ? 'Lead UI/UX Designer'
        : key === 'creator'
        ? 'Visual Creator & Artist'
        : 'AI Researcher & Systems',
    tags:
      key === 'admin'
        ? ['Full Access', 'Moderation', 'Analytics']
        : key === 'designer'
        ? ['Design Tokens', 'Dark Theme', 'Pro']
        : key === 'creator'
        ? ['Photography', 'Media', 'Verified']
        : ['Machine Learning', 'NextGen AI', 'Tech'],
  }));

  res.status(200).json({
    success: true,
    demoUsers: users,
  });
};

// @desc    Get currently authenticated user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// @desc    Request password reset token
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your account email address.',
      });
    }

    const user = await User.findOne({ normalizedEmail: email.trim().toLowerCase() });
    
    // Always respond with a generic success message to prevent user enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with that email, a password reset link has been dispatched.',
      });
    }

    // Generate random raw reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Remove any existing reset tokens for this user
    await PasswordResetToken.deleteMany({ user: user._id });

    // Save token with 1 hour expiration
    await PasswordResetToken.create({
      user: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    console.log(`[Password Reset Dev Helper] User: ${user.email}, Token: ${resetToken}`);

    // In development or demo, we also return the token in response to allow easy testing without external email setup
    const isDev = process.env.NODE_ENV !== 'production';

    res.status(200).json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been dispatched.',
      ...(isDev && { devResetToken: resetToken, devResetUrl: `/reset-password?token=${resetToken}` }),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await PasswordResetToken.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
      used: false,
    });

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    const user = await User.findById(resetRecord.user).select('+passwordHash');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User for this token was not found.',
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    // Log the user in with new token
    const authToken = signToken({ id: user._id, role: user.role });
    sendTokenCookie(res, authToken);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You are now logged in.',
      token: authToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password while logged in
// @route   POST /api/auth/update-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters.',
      });
    }

    const user = await User.findById(req.user._id).select('+passwordHash');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    user.passwordHash = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
