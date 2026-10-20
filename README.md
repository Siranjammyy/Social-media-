# Nexora — Connect Beyond Boundaries

[![Nexora Social Platform](https://img.shields.io/badge/Nexora-v1.0.0-6C5CE7?style=for-the-badge&logo=rocket)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22D3EE?style=for-the-badge)](LICENSE)
[![Tests Passing](https://img.shields.io/badge/Tests-15%20Passed-10B981?style=for-the-badge&logo=vitest)](tests)

> **"Your World. Your People. Your Nexora."**  
> A next-generation, full-stack social networking web application engineered for creators, builders, thinkers, and communities to connect, publish moments, and communicate in real time.

---

## 🌟 Overview & Key Highlights

Nexora is a complete, production-inspired social media application featuring:
- **Clean Full-Stack Architecture**: Decoupled Express.js REST API with Socket.IO real-time channels and a modern React 18 / Vite client.
- **Persistent Data Modeling**: Fully indexed MongoDB schemas with Mongoose models enforcing uniqueness, relationships, and security constraints.
- **Comprehensive Authentication**: Robust registration, login with email/username, password hashing via `bcryptjs`, secure HTTP-only cookies, JWT authorization, and password recovery.
- **Dynamic 3-Column Social Feed**: "For You" (engagement + recency ranking), "Following" (posts from followed accounts), and "Latest" (chronological stream).
- **Post Management & Rich Media**: Text posts with automatic `#hashtag` and `@mention` extraction, multi-image galleries, video support, visibility controls (*Public*, *Followers only*, *Private*), and in-place editing.
- **Social Graph & Engagement**: Like reactions with optimistic UI updates, nested comment replies, bookmarking, profile follower/following relationships, and suggestion engines.
- **Real-Time Direct Messaging**: Socket.IO powered direct chats with live message delivery, typing indicators, image attachments, and unread counters.
- **Live Notifications**: Persisted in-app alerts for likes, replies, follows, mentions, and messages.
- **Theme Engine**: Seamless dark mode and light mode matching an aesthetic palette (`#6C5CE7` primary, `#0B1020` dark mode background).
- **Safety & Moderation**: User blocking, muting, content reporting, rate-limiting on sensitive endpoints, and an administrative moderation dashboard.

---

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide React, Socket.IO Client, date-fns |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, Cookie Parser, Helmet, Express Rate Limit, Multer, Morgan |
| **Database** | MongoDB (Supports local `mongod` or MongoDB Atlas cloud cluster) |
| **Testing** | Vitest, Supertest, `mongodb-memory-server` (15 automated unit & integration tests) |

---

## 📁 Repository Structure

```
nexora/
├── package.json              # Root orchestration scripts (dev, build, seed, test)
├── .gitignore                # Git exclusions (node_modules, .env, dist, uploads)
├── README.md                 # Project documentation
├── server/                   # Backend Express & Socket.IO API
│   ├── package.json
│   ├── vitest.config.js
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Local environment configuration
│   ├── uploads/              # Local media uploads storage
│   ├── src/
│   │   ├── config/           # MongoDB (db.js), Cloudinary (cloudinary.js)
│   │   ├── models/           # User, Post, Like, Comment, Follow, Bookmark,
│   │   │                     # Notification, Conversation, Message, Report, PasswordResetToken
│   │   ├── middleware/       # Auth, RateLimiter, Upload, Error handling
│   │   ├── controllers/      # Modular business logic controllers
│   │   ├── routes/           # REST API endpoints & route aggregation
│   │   ├── socket/           # Socket.IO connection handler & real-time events
│   │   ├── seeds/            # Rich demo seed script (seed.js)
│   │   ├── utils/            # JWT helpers, token cookies, sanitization
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # HTTP server entry point & Socket.IO initialization
│   └── tests/                # Automated backend test suites
│       ├── setup.js          # In-memory MongoDB testing environment
│       ├── auth.test.js      # Registration, login, JWT, security tests
│       ├── posts.test.js     # Post lifecycle, hashtags, likes, comments tests
│       └── social.test.js    # Follow graph, bookmarks, search tests
└── client/                   # Frontend React + Vite SPA
    ├── package.json
    ├── vite.config.js        # Vite dev server & proxy settings
    ├── tailwind.config.js    # Nexora custom design system tokens
    ├── postcss.config.js
    ├── index.html            # SEO meta tags, Google Fonts (Inter)
    ├── .env.example
    ├── .env
    └── src/
        ├── app/              # App.jsx, router.jsx
        ├── context/          # AuthContext, ThemeContext, SocketContext, ToastContext
        ├── components/
        │   ├── common/       # Avatar, Button, Input, Modal, Dropdown, Skeleton, ConfirmDialog, Badge
        │   ├── layout/       # AppShell, Sidebar, RightSidebar, TopBar, MobileNavigation
        │   ├── post/         # PostComposer, PostCard, CommentList
        │   ├── profile/      # ProfileHeader, EditProfileModal
        │   ├── messaging/    # ConversationList, MessageChat, NewConversationModal
        │   ├── notifications/# NotificationItem
        │   └── search/       # TrendingTopics, SuggestedUsers
        ├── pages/            # LandingPage, LoginPage, RegisterPage, ForgotPasswordPage,
        │                     # ResetPasswordPage, OnboardingPage, HomePage, ExplorePage,
        │                     # SearchPage, ProfilePage, NotificationsPage, MessagesPage,
        │                     # BookmarksPage, SettingsPage, AdminPage, NotFoundPage
        ├── services/         # Axios API modules (authService, postService, userService, etc.)
        ├── index.css         # Tailwind base styles, dark mode tokens, scrollbars
        └── main.jsx          # React DOM entry
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (Tested with Node v22.19.0)
- **npm**: v9.0.0 or higher
- **MongoDB**: A running local MongoDB instance or a free [MongoDB Atlas Cluster](https://cloud.mongodb.com).

### 2. Install Dependencies
Run the installation script in the root directory to install all packages for root, backend, and frontend:
```bash
# In the project root (nexora/)
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Configure Environment Variables

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Connect to local MongoDB or MongoDB Atlas:
# Local: mongodb://127.0.0.1:27017/nexora
# Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexora?retryWrites=true&w=majority
MONGODB_URI=mongodb://127.0.0.1:27017/nexora

# JWT & Cookie secrets
JWT_SECRET=nexora_super_secret_jwt_key_2026_development_token
COOKIE_SECRET=nexora_cookie_secret_key_2026_development_token
JWT_EXPIRES_IN=7d

# Optional Cloudinary (leaves empty to store media locally in server/uploads/)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

#### Frontend (`client/.env`):
```env
VITE_API_URL=/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Running the Application

### Option A: Run Both Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```
This runs the Express API server on `http://localhost:5000` and the Vite client on `http://localhost:5173`.

### Option B: Run Services Individually
In one terminal (Backend):
```bash
cd server
npm run dev
```

In a second terminal (Frontend):
```bash
cd client
npm run dev
```

Open your browser to: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Testing & Quality Assurance

Automated backend unit and integration tests are powered by Vitest, Supertest, and `mongodb-memory-server`. All tests run completely in an isolated in-memory database without requiring external credentials:

```bash
cd server
npm test
```

### Test Results Summary:
- **`tests/auth.test.js`** (7 tests):
  - Successful user registration with password hashing
  - Duplicate email rejection
  - Duplicate username rejection
  - Invalid login rejection
  - Successful credential verification and JWT generation
  - Bearer token authorization on protected endpoint (`/api/auth/me`)
  - Protected route access denial when token is absent
- **`tests/posts.test.js`** (5 tests):
  - Post creation with automated hashtag extraction (`#fullstack`, `#webdev`)
  - Feed retrieval with pagination
  - Author edit authorization and rejection of unauthorized edits
  - Like and unlike toggles with atomic counter increment/decrement
  - Comment creation and child count updates
- **`tests/social.test.js`** (3 tests):
  - Follow and unfollow relationship updates and follower listings
  - Bookmark toggling and saved posts retrieval
  - Regex search for users and posts

---

## 🌱 Demo Seeding Script

Nexora includes an optional seed script to populate realistic accounts, posts, comments, likes, conversations, and follows:

```bash
cd server
npm run seed
```
*(To overwrite existing data, run `npm run seed -- --force`)*

### Seeded Demonstration Accounts:
*Password for all demo accounts: `Password123!`*
- **Alex Rivera** (`alex@nexora.io` / `@alexrivera`) — Administrator, Full-Stack Engineer
- **Elena Rostova** (`elena@nexora.io` / `@elena_codes`) — UI/UX Architect & Designer
- **Marcus Vance** (`marcus@nexora.io` / `@marcus_vance`) — Photographer & Explorer
- **Sophia Chen** (`sophia@nexora.io` / `@sophiatech`) — AI Researcher & Builder

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /register` — Register new user account
- `POST /login` — Authenticate and obtain JWT / HTTP-only cookie
- `POST /logout` — Invalidate session and clear auth cookies
- `GET /me` — Retrieve current user profile (*Private*)
- `POST /forgot-password` — Request password reset link/token
- `POST /reset-password` — Reset password using verification token
- `POST /update-password` — Update account password (*Private*)

### Users & Relationships (`/api/users`)
- `GET /:username` — Fetch user profile with relationship status
- `PATCH /me` — Update bio, avatar, cover image, website, location (*Private*)
- `POST /onboarding` — Complete onboarding setup (*Private*)
- `GET /suggestions` — Get recommended accounts to follow (*Private*)
- `POST /:id/follow` — Follow user or send follow request (*Private*)
- `DELETE /:id/follow` — Unfollow user (*Private*)
- `GET /:username/followers` — List account followers
- `GET /:username/following` — List accounts followed
- `POST /:id/block` — Block user (*Private*)
- `POST /:id/unblock` — Unblock user (*Private*)
- `POST /:id/mute` — Toggle mute user (*Private*)
- `DELETE /me` — Permanently delete account and cascade remove data (*Private*)

### Posts & Feeds (`/api/posts` & `/api/feed`)
- `POST /posts` — Publish post (text, media, visibility: public/followers/private) (*Private*)
- `GET /posts/:id` — Retrieve post by ID with permission checks
- `PATCH /posts/:id` — Edit own post (*Private*)
- `DELETE /posts/:id` — Delete own post or administrator delete (*Private*)
- `PUT /posts/:id/like` — Idempotent like post (*Private*)
- `DELETE /posts/:id/like` — Unlike post (*Private*)
- `PUT /posts/:id/bookmark` — Toggle save post to bookmarks (*Private*)
- `GET /posts/:postId/comments` — Retrieve post comments & nested replies
- `POST /posts/:postId/comments` — Add comment or reply (*Private*)
- `GET /feed` — For You feed with engagement ranking
- `GET /feed/following` — Posts from followed accounts (*Private*)
- `GET /feed/latest` — Chronological public feed stream

### Search & Discovery (`/api/search`)
- `GET /search/users?q=:query` — Search users by name or handle
- `GET /search/posts?q=:query&tag=:tag` — Search posts by keyword or hashtag
- `GET /search/trending` — Top trending hashtags over the last 7 days

### Real-Time Messaging (`/api/conversations`)
- `GET /conversations` — User's conversation inbox (*Private*)
- `POST /conversations` — Start or retrieve direct conversation (*Private*)
- `GET /conversations/:id/messages` — Paginated message history (*Private*)
- `POST /conversations/:id/messages` — Send message with attachments (*Private*)

### Notifications (`/api/notifications`)
- `GET /notifications` — List notifications with unread counts (*Private*)
- `PATCH /notifications/:id/read` — Mark notification as read (*Private*)
- `POST /notifications/read-all` — Mark all notifications as read (*Private*)

### Moderation & Administration (`/api/reports` & `/api/admin`)
- `POST /reports` — Submit content violation report (*Private*)
- `GET /admin/stats` — Dashboard statistics (*Admin only*)
- `GET /admin/users` — Paginated user directory with moderation (*Admin only*)
- `PATCH /admin/users/:id/suspend` — Suspend or unsuspend account (*Admin only*)

### System Health (`/api/health`)
- `GET /health` — Application uptime, environment, and MongoDB connection status

---

## 🎨 Design System & Palette

- **Primary**: `#6C5CE7`
- **Primary Dark**: `#5145CD`
- **Secondary**: `#8B5CF6`
- **Accent**: `#22D3EE`
- **Light Surface**: `#FFFFFF` / **Light Background**: `#F7F8FC`
- **Dark Surface**: `#111827` / **Dark Elevated**: `#182235` / **Dark Background**: `#0B1020`
- **Typography**: Inter (Google Fonts) with clean hierarchies, comfortable line heights, and accessible contrast ratios.

---

## 🔒 Security Best Practices

1. **Password Protection**: Passwords hashed using `bcryptjs` with salt rounds. Plaintext passwords never saved or returned in responses (`select: false`).
2. **Session Security**: JWT tokens set inside `HttpOnly`, `SameSite: strict` (in production) cookies with fallback authorization headers.
3. **Cross-Site Protection**: CORS explicitly configured with allowed origins list; wildcard origins with credentials disallowed.
4. **Input Sanitization**: Mongoose schemas validate fields, enforce unique indexes, and normalize emails and usernames.
5. **Rate Limiting**: `express-rate-limit` prevents brute-force attempts on `/api/auth` (20 attempts/15 min) and spam on creation endpoints.
6. **Error Redaction**: Internal database stack traces hidden from client responses in production.

---

## 📄 License
This project is licensed under the MIT License.
