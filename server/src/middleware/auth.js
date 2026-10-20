import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';
import { getDemoUserById } from '../config/demoUsers.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in cookie first, then Authorization header
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'You are not logged in. Please log in to access this resource.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication session. Please log in again.',
      });
    }

    // Check if user still exists
    let currentUser;
    try {
      currentUser = await User.findById(decoded.id);
    } catch (dbErr) {
      // Catch db offline
    }

    if (!currentUser && (decoded.isDemo || getDemoUserById(decoded.id))) {
      currentUser = getDemoUserById(decoded.id);
    }

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if user is suspended
    if (currentUser.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        let currentUser;
        try {
          currentUser = await User.findById(decoded.id);
        } catch (dbErr) {
          // DB offline
        }
        if (!currentUser && (decoded.isDemo || getDemoUserById(decoded.id))) {
          currentUser = getDemoUserById(decoded.id);
        }
        if (currentUser && !currentUser.isSuspended) {
          req.user = currentUser;
        }
      } catch (err) {
        // Silently continue for optional auth
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};
