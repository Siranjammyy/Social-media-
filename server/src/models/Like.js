import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
      index: true,
    },
    reaction: {
      type: String,
      enum: ['like', 'love', 'celebrate', 'insightful'],
      default: 'like',
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index prevents duplicate likes by the same user on the same post
likeSchema.index({ user: 1, post: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);
export default Like;
