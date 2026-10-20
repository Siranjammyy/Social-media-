import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

// Ensure reliable SRV DNS resolution for MongoDB Atlas across local routers/ISPs
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore in restricted environments
}

import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Follow from '../models/Follow.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura';

const seedData = async () => {
  try {
    console.log(`[Seed] Connecting to database at ${uri}...`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log(`[Seed] Database connected.`);

    // Check if users already exist
    const count = await User.countDocuments();
    if (count > 0 && !process.argv.includes('--force')) {
      console.log(`[Seed] Database already contains ${count} users. Run with '--force' to reset and seed fresh data.`);
      process.exit(0);
    }

    console.log(`[Seed] Clearing existing collections...`);
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Follow.deleteMany({}),
      Like.deleteMany({}),
      Bookmark.deleteMany({}),
      Notification.deleteMany({}),
      Conversation.deleteMany({}),
      Message.deleteMany({}),
    ]);

    console.log(`[Seed] Creating sample users...`);
    const users = await User.create([
      {
        name: 'Alex Rivera',
        username: 'alexrivera',
        normalizedUsername: 'alexrivera',
        email: 'alex@aura.io',
        normalizedEmail: 'alex@aura.io',
        passwordHash: 'Password123!',
        bio: 'Building the future of social software. Full-stack engineer, coffee aficionado, and open-source enthusiast.',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        website: 'https://alexrivera.dev',
        location: 'San Francisco, CA',
        isVerified: true,
        onboardingCompleted: true,
        role: 'admin',
        interests: ['Technology', 'Design', 'Startups', 'Web3'],
      },
      {
        name: 'Elena Rostova',
        username: 'elena_codes',
        normalizedUsername: 'elena_codes',
        email: 'elena@aura.io',
        normalizedEmail: 'elena@aura.io',
        passwordHash: 'Password123!',
        bio: 'UI/UX Architect & Creative Technologist. Obsessed with micro-interactions, sleek aesthetics, and design tokens.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
        website: 'https://elenarostova.design',
        location: 'Berlin, Germany',
        isVerified: true,
        onboardingCompleted: true,
        role: 'user',
        interests: ['Design', 'Frontend', 'Art', 'Typography'],
      },
      {
        name: 'Marcus Vance',
        username: 'marcus_vance',
        normalizedUsername: 'marcus_vance',
        email: 'marcus@aura.io',
        normalizedEmail: 'marcus@aura.io',
        passwordHash: 'Password123!',
        bio: 'Landscape & Street Photographer. Capturing moments between seconds. Canon EOS R5 explorer.',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        website: 'https://marcusvance.photo',
        location: 'Seattle, WA',
        isVerified: false,
        onboardingCompleted: true,
        role: 'user',
        interests: ['Photography', 'Travel', 'Art'],
      },
      {
        name: 'Sophia Chen',
        username: 'sophiatech',
        normalizedUsername: 'sophiatech',
        email: 'sophia@aura.io',
        normalizedEmail: 'sophia@aura.io',
        passwordHash: 'Password123!',
        bio: 'AI researcher and distributed systems builder. Exploring LLMs, agentic workflows, and human-computer symbiosis.',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
        website: 'https://sophiachen.ai',
        location: 'Austin, TX',
        isVerified: true,
        onboardingCompleted: true,
        role: 'user',
        interests: ['AI', 'Research', 'Python', 'Algorithms'],
      },
    ]);

    const [alex, elena, marcus, sophia] = users;

    console.log(`[Seed] Creating sample posts...`);
    const posts = await Post.create([
      {
        author: alex._id,
        text: 'Thrilled to unveil Aura! 🚀 Connect beyond boundaries with a vibrant, modern social space engineered for creators, builders, and dreamers. What would you like to see next? #aura #webdev #innovation',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
            type: 'image',
          },
        ],
        hashtags: ['aura', 'webdev', 'innovation'],
        visibility: 'public',
        likeCount: 3,
        commentCount: 2,
        bookmarkCount: 1,
        location: 'Aura HQ, San Francisco',
      },
      {
        author: elena._id,
        text: 'Design isn’t just what it looks like and feels like. Design is how it works. Spent today refining glassmorphism micro-interactions and dark mode color contrast. The purple-cyan gradient accents feel so alive! ✨ #design #uiux #aesthetic',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
            type: 'image',
          },
        ],
        hashtags: ['design', 'uiux', 'aesthetic'],
        visibility: 'public',
        likeCount: 2,
        commentCount: 1,
        bookmarkCount: 1,
        location: 'Berlin, Germany',
      },
      {
        author: marcus._id,
        text: 'Morning light piercing through the misty Olympic Peninsula pines. Nature has a way of resetting every creative block. Always carry your camera. 🌲📷 #photography #nature #olympicnationalpark',
        media: [
          {
            url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80',
            type: 'image',
          },
        ],
        hashtags: ['photography', 'nature', 'olympicnationalpark'],
        visibility: 'public',
        likeCount: 1,
        commentCount: 0,
        bookmarkCount: 0,
        location: 'Olympic Peninsula, WA',
      },
      {
        author: sophia._id,
        text: 'Deep dive into local neural representations: the boundary between static inference and adaptive cognition is blurring faster than expected. Exciting times for real-time edge intelligence. #ai #deeplearning #research',
        media: [],
        hashtags: ['ai', 'deeplearning', 'research'],
        visibility: 'public',
        likeCount: 2,
        commentCount: 1,
        bookmarkCount: 0,
        location: 'Austin, TX',
      },
    ]);

    console.log(`[Seed] Creating follow relationships...`);
    await Follow.create([
      { follower: alex._id, following: elena._id, status: 'accepted' },
      { follower: alex._id, following: sophia._id, status: 'accepted' },
      { follower: elena._id, following: alex._id, status: 'accepted' },
      { follower: marcus._id, following: alex._id, status: 'accepted' },
      { follower: sophia._id, following: alex._id, status: 'accepted' },
      { follower: sophia._id, following: elena._id, status: 'accepted' },
    ]);

    // Update user follower/following counts
    await User.findByIdAndUpdate(alex._id, { followersCount: 3, followingCount: 2, postsCount: 1 });
    await User.findByIdAndUpdate(elena._id, { followersCount: 2, followingCount: 1, postsCount: 1 });
    await User.findByIdAndUpdate(marcus._id, { followersCount: 0, followingCount: 1, postsCount: 1 });
    await User.findByIdAndUpdate(sophia._id, { followersCount: 1, followingCount: 2, postsCount: 1 });

    console.log(`[Seed] Creating comments and likes...`);
    const [p1, p2, p3, p4] = posts;

    // Likes on Alex's post
    await Like.create([
      { user: elena._id, post: p1._id },
      { user: marcus._id, post: p1._id },
      { user: sophia._id, post: p1._id },
    ]);

    // Comments on Alex's post
    const comment1 = await Comment.create({
      post: p1._id,
      author: elena._id,
      text: 'Congratulations Alex! The interface responsiveness and real-time chat are genuinely top notch! 💜',
    });

    await Comment.create({
      post: p1._id,
      author: sophia._id,
      text: 'Can not wait to integrate automated AI insights into the discovery feed!',
      parentComment: comment1._id,
    });

    // Bookmarks
    await Bookmark.create([
      { user: alex._id, post: p2._id },
      { user: elena._id, post: p1._id },
    ]);

    // Sample Direct Conversation between Alex and Elena
    const conversation = await Conversation.create({
      participants: [alex._id, elena._id],
      lastMessage: {
        text: 'The new color palette and typography look gorgeous!',
        sender: elena._id,
        createdAt: new Date(),
      },
    });

    await Message.create([
      {
        conversation: conversation._id,
        sender: alex._id,
        content: 'Hey Elena! Did you check out the updated design system?',
        readBy: [alex._id, elena._id],
      },
      {
        conversation: conversation._id,
        sender: elena._id,
        content: 'The new color palette and typography look gorgeous!',
        readBy: [elena._id],
      },
    ]);

    console.log(`[Seed] Demo data seeded successfully!`);
    console.log(`--------------------------------------------------`);
    console.log(`Sample Accounts (Password for all: Password123!)`);
    console.log(`- alex@nexora.io       (Admin, Full-stack developer)`);
    console.log(`- elena@nexora.io      (Designer / Creative)`);
    console.log(`- marcus@nexora.io     (Photographer)`);
    console.log(`- sophia@nexora.io     (AI Researcher)`);
    console.log(`--------------------------------------------------`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ [Seed Database Error]: ${error.message}`);
    console.error(`\n📋 [Setup Guidance]:`);
    console.error(`1. To run MongoDB locally: Download & install MongoDB Community Server or start MongoDB service.`);
    console.error(`2. To run with MongoDB Atlas (Recommended & Free):`);
    console.error(`   - Create a free cluster at https://cloud.mongodb.com`);
    console.error(`   - Copy your connection string into server/.env:`);
    console.error(`     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexora?retryWrites=true&w=majority`);
    console.error(`3. Once configured, re-run: npm run seed\n`);
    process.exit(1);
  }
};

seedData();
