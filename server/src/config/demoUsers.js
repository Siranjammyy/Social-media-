export const DEMO_USERS = {
  admin: {
    _id: '65d21a000000000000000001',
    name: 'Alex Rivera',
    username: 'alexrivera',
    normalizedUsername: 'alexrivera',
    email: 'alex@aura.io',
    normalizedEmail: 'alex@aura.io',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    bio: 'Lead Architect & Platform Administrator at Aura. Building next-generation social tools.',
    website: 'https://alexrivera.dev',
    location: 'San Francisco, CA',
    isVerified: true,
    onboardingCompleted: true,
    followersCount: 4820,
    followingCount: 340,
    postsCount: 42,
    accountVisibility: 'public',
    preferences: {
      theme: 'system',
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
    },
    blockedUsers: [],
    mutedUsers: [],
    isSuspended: false,
    toJSON() {
      return { ...this };
    },
  },
  designer: {
    _id: '65d21a000000000000000002',
    name: 'Elena Rostova',
    username: 'elena_codes',
    normalizedUsername: 'elena_codes',
    email: 'elena@aura.io',
    normalizedEmail: 'elena@aura.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    bio: 'UI/UX Architect & Creative Technologist. Obsessed with dark mode palettes and micro-interactions.',
    website: 'https://elenarostova.design',
    location: 'Berlin, Germany',
    isVerified: true,
    onboardingCompleted: true,
    followersCount: 2950,
    followingCount: 180,
    postsCount: 28,
    accountVisibility: 'public',
    preferences: {
      theme: 'dark',
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
    },
    blockedUsers: [],
    mutedUsers: [],
    isSuspended: false,
    toJSON() {
      return { ...this };
    },
  },
  creator: {
    _id: '65d21a000000000000000003',
    name: 'Marcus Vance',
    username: 'marcus_vance',
    normalizedUsername: 'marcus_vance',
    email: 'marcus@aura.io',
    normalizedEmail: 'marcus@aura.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    bio: 'Landscape & Street Photographer. Capturing moments between seconds. Canon EOS R5 explorer.',
    website: 'https://marcusvance.photo',
    location: 'Seattle, WA',
    isVerified: false,
    onboardingCompleted: true,
    followersCount: 1410,
    followingCount: 220,
    postsCount: 19,
    accountVisibility: 'public',
    preferences: {
      theme: 'system',
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
    },
    blockedUsers: [],
    mutedUsers: [],
    isSuspended: false,
    toJSON() {
      return { ...this };
    },
  },
  ai: {
    _id: '65d21a000000000000000004',
    name: 'Sophia Chen',
    username: 'sophiatech',
    normalizedUsername: 'sophiatech',
    email: 'sophia@aura.io',
    normalizedEmail: 'sophia@aura.io',
    role: 'user',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    bio: 'AI researcher and distributed systems builder. Exploring LLMs, agentic workflows, and human-computer symbiosis.',
    website: 'https://sophiachen.ai',
    location: 'Austin, TX',
    isVerified: true,
    onboardingCompleted: true,
    followersCount: 3820,
    followingCount: 410,
    postsCount: 35,
    accountVisibility: 'public',
    preferences: {
      theme: 'system',
      notifyLikes: true,
      notifyComments: true,
      notifyFollows: true,
      notifyMessages: true,
    },
    blockedUsers: [],
    mutedUsers: [],
    isSuspended: false,
    toJSON() {
      return { ...this };
    },
  },
};

export const getDemoUserById = (id) => {
  return Object.values(DEMO_USERS).find((u) => u._id === id);
};

export const getDemoUserByUsername = (username) => {
  if (!username) return null;
  const clean = username.trim().toLowerCase().replace('@', '');
  return Object.values(DEMO_USERS).find(
    (u) => u.normalizedUsername === clean || u.username.toLowerCase() === clean
  );
};

export const getDemoUserByRoleOrKey = (key = 'admin') => {
  return DEMO_USERS[key.toLowerCase()] || DEMO_USERS.admin;
};
