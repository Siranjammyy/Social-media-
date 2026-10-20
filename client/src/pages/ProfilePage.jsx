import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, FileText, Image, Heart, ArrowLeft, Loader2, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { PostCard } from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { DEMO_PROFILES } from '../components/auth/DemoAccessModal';

export const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'media' | 'likes'
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setError(null);
      const cleanUsername = username?.trim().toLowerCase().replace('@', '');

      try {
        const res = await userService.getProfile(cleanUsername);
        if (res.success && res.user) {
          setProfile(res.user);
          setLoadingProfile(false);
          return;
        }
      } catch (err) {
        // Fallback for current logged in user or demo personas
      }

      // Check if viewing own profile
      if (currentUser && currentUser.username?.toLowerCase() === cleanUsername) {
        setProfile({
          ...currentUser,
          isOwner: true,
          isFollowing: false,
          postsCount: currentUser.postsCount || 28,
          followersCount: currentUser.followersCount || 2950,
          followingCount: currentUser.followingCount || 180,
        });
        setLoadingProfile(false);
        return;
      }

      // Check if viewing another demo profile
      const demoMatch = DEMO_PROFILES.find(
        (p) => p.username.toLowerCase() === cleanUsername
      );
      if (demoMatch) {
        setProfile({
          _id: demoMatch.role === 'admin' ? '65d21a000000000000000001' : '65d21a000000000000000002',
          name: demoMatch.name,
          username: demoMatch.username,
          avatar: demoMatch.avatar,
          bio: demoMatch.bio,
          isVerified: true,
          coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
          postsCount: 28,
          followersCount: 2950,
          followingCount: 180,
          isOwner: currentUser?.username?.toLowerCase() === cleanUsername,
          isFollowing: false,
        });
        setLoadingProfile(false);
        return;
      }

      setError('Profile not found.');
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [username, currentUser]);

  // Fetch posts for active tab
  useEffect(() => {
    if (!profile) return;

    const fetchTabPosts = async () => {
      setLoadingPosts(true);
      try {
        const res = await userService.getUserPosts(username, activeTab);
        if (res.success) {
          setPosts(res.posts || []);
        }
      } catch (err) {
        // Can fail if private account
        setPosts([]);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchTabPosts();
  }, [profile, username, activeTab]);

  if (loadingProfile) {
    return (
      <div className="p-12 flex justify-center text-brand-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="p-6">
        <EmptyState
          icon={UserX}
          title="Account not found"
          description={`The account @${username} does not exist or may have been deactivated.`}
          actionText="Back to Home"
          onAction={() => navigate('/home')}
        />
      </div>
    );
  }

  const isPrivateAndRestricted =
    profile.accountVisibility === 'private' && !profile.isOwner && !profile.isFollowing;

  return (
    <div className="min-h-screen">
      {/* Top back navigation */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449] px-4 py-2.5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#182235] transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
            {profile.name}
          </h2>
          <p className="text-[11px] text-gray-500">
            {profile.postsCount || 0} {profile.postsCount === 1 ? 'post' : 'posts'}
          </p>
        </div>
      </div>

      {/* Profile Header */}
      <ProfileHeader
        profile={profile}
        onEditProfile={() => setIsEditModalOpen(true)}
        onProfileUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
      />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-[#273449]">
        {[
          { id: 'posts', label: 'Posts', icon: FileText },
          { id: 'media', label: 'Media', icon: Image },
          { id: 'likes', label: 'Likes', icon: Heart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition relative ${
              activeTab === tab.id
                ? 'text-brand-primary'
                : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-brand-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Posts List */}
      <div className="p-4 sm:p-5">
        {isPrivateAndRestricted ? (
          <div className="text-center p-12 nexora-card">
            <Lock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              This Account is Private
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              Follow @{profile.username} to view their posts, photos, and interactions.
            </p>
          </div>
        ) : loadingPosts ? (
          <div className="space-y-4">
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostUpdated={(updated) =>
                  setPosts((prev) =>
                    prev.map((p) => (p._id === updated._id ? updated : p))
                  )
                }
                onPostDeleted={(id) =>
                  setPosts((prev) => prev.filter((p) => p._id !== id))
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No ${activeTab} yet`}
            description={
              profile.isOwner
                ? `You haven't shared any ${activeTab} yet.`
                : `@${profile.username} hasn't shared any ${activeTab} yet.`
            }
          />
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
        />
      )}
    </div>
  );
};
