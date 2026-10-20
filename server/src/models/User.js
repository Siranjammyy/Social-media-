import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-zA-Z0-9_.]+$/, 'Username can only contain alphanumeric characters, dots, and underscores'],
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    normalizedUsername: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    normalizedEmail: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password'],
      select: false,
    },
    bio: {
      type: String,
      default: '',
      maxlength: [280, 'Bio cannot exceed 280 characters'],
    },
    avatar: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    accountVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    interests: {
      type: [String],
      default: [],
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    postsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    preferences: {
      theme: {
        type: String,
        enum: ['system', 'light', 'dark'],
        default: 'system',
      },
      notifyLikes: { type: Boolean, default: true },
      notifyComments: { type: Boolean, default: true },
      notifyFollows: { type: Boolean, default: true },
      notifyMessages: { type: Boolean, default: true },
      allowDirectMessages: {
        type: String,
        enum: ['everyone', 'following', 'nobody'],
        default: 'everyone',
      },
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    mutedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isSuspended: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Pre-save hook to normalize username & email, and hash password if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('username')) {
    this.normalizedUsername = this.username.toLowerCase().trim();
  }
  if (this.isModified('email')) {
    this.normalizedEmail = this.email.toLowerCase().trim();
  }
  if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2a$') && !this.passwordHash.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
