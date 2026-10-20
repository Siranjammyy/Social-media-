import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    text: {
      type: String,
      default: '',
      maxlength: [3000, 'Post text cannot exceed 3000 characters'],
      trim: true,
    },
    media: [
      {
        url: { type: String, required: true },
        type: { type: String, enum: ['image', 'video'], default: 'image' },
        caption: { type: String, default: '' },
      },
    ],
    hashtags: {
      type: [String],
      default: [],
      index: true,
    },
    mentions: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
      index: true,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for feeds, hashtag searching, and text search
postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ text: 'text' });

// Auto-extract hashtags and mentions before saving if present
postSchema.pre('save', function (next) {
  if (this.text) {
    // Extract #hashtags
    const tags = this.text.match(/#[a-zA-Z0-9_]+/g);
    if (tags) {
      this.hashtags = [...new Set(tags.map(tag => tag.slice(1).toLowerCase()))];
    } else {
      this.hashtags = [];
    }

    // Extract @mentions
    const mentions = this.text.match(/@[a-zA-Z0-9_.]+/g);
    if (mentions) {
      this.mentions = [...new Set(mentions.map(mention => mention.slice(1).toLowerCase()))];
    } else {
      this.mentions = [];
    }
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
