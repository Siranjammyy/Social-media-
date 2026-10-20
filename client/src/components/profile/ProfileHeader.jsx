import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Link as LinkIcon,
  Mail,
  MoreHorizontal,
  Shield,
  UserCheck,
  UserPlus,
  Lock,
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { messageService } from '../../services/messageService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Dropdown, DropdownItem } from '../common/Dropdown';

export const ProfileHeader = ({ profile, onEditProfile, onProfileUpdated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false);
  const [followersCount, setFollowersCount] = useState(profile.followersCount || 0);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const isOwner = user && user._id === profile._id;

  const joinedDate = profile.createdAt
    ? format(new Date(profile.createdAt), 'MMMM yyyy')
    : 'Recently';

  const handleFollowToggle = async () => {
    if (!user) {
      toast.info('Please log in to follow users.');
      navigate('/login');
      return;
    }

    setIsFollowLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(profile._id);
        setIsFollowing(false);
        setFollowersCount((c) => Math.max(0, c - 1));
        toast.success(`Unfollowed @${profile.username}`);
      } else {
        const res = await userService.followUser(profile._id);
        if (res.status === 'accepted') {
          setIsFollowing(true);
          setFollowersCount((c) => c + 1);
          toast.success(`Following @${profile.username}`);
        } else {
          toast.info('Follow request sent.');
        }
      }
    } catch (err) {
      toast.error('Action failed. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleStartMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      const res = await messageService.getOrCreateConversation(profile._id);
      if (res.success && res.conversation) {
        navigate(`/messages?conversation=${res.conversation._id}`);
      }
    } catch (err) {
      toast.error('Could not initiate conversation.');
    }
  };

  const handleBlockUser = async () => {
    try {
      await userService.blockUser(profile._id);
      toast.success(`Blocked @${profile.username}`);
      navigate('/home');
    } catch (err) {
      toast.error('Failed to block user.');
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-[#273449] pb-4">
      {/* Cover Image Banner */}
      <div className="relative h-44 sm:h-56 w-full bg-gradient-to-r from-brand-primary via-brand-500 to-brand-accent overflow-hidden">
        {profile.coverImage ? (
          <img
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/80 to-brand-accent/50 opacity-90" />
        )}
      </div>

      {/* Profile Bar & Actions */}
      <div className="px-4 sm:px-6 relative">
        <div className="flex justify-between items-end -mt-16 sm:-mt-20 mb-4">
          <div className="relative">
            <Avatar
              src={profile.avatar}
              name={profile.name}
              size="2xl"
              className="ring-4 ring-white dark:ring-[#0B1020] shadow-xl"
              isVerified={profile.isVerified}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            {isOwner ? (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditProfile}
                className="rounded-full px-5"
              >
                Edit Profile
              </Button>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleStartMessage}
                  className="rounded-full p-2.5"
                  title="Direct Message"
                >
                  <Mail className="w-4 h-4" />
                </Button>

                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={handleFollowToggle}
                  isLoading={isFollowLoading}
                  className="rounded-full px-5 font-semibold"
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4 mr-1 text-emerald-500" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>

                <Dropdown
                  trigger={
                    <button className="p-2 rounded-full border border-gray-200 dark:border-[#273449] hover:bg-gray-100 dark:hover:bg-[#182235] transition">
                      <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>
                  }
                >
                  <DropdownItem danger icon={Shield} onClick={handleBlockUser}>
                    Block @{profile.username}
                  </DropdownItem>
                </Dropdown>
              </>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              {profile.accountVisibility === 'private' && (
                <span title="Private Account">
                  <Lock className="w-4 h-4 text-gray-400" />
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{profile.username}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {profile.bio}
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-gray-400 pt-1">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={
                  profile.website.startsWith('http')
                    ? profile.website
                    : `https://${profile.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-brand-primary hover:underline"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined {joinedDate}
            </span>
          </div>

          {/* Counts */}
          <div className="flex items-center gap-6 text-sm pt-2">
            <div>
              <span className="font-extrabold text-gray-900 dark:text-white mr-1.5">
                {profile.followingCount || 0}
              </span>
              <span className="text-gray-500">Following</span>
            </div>
            <div>
              <span className="font-extrabold text-gray-900 dark:text-white mr-1.5">
                {followersCount}
              </span>
              <span className="text-gray-500">Followers</span>
            </div>
            <div>
              <span className="font-extrabold text-gray-900 dark:text-white mr-1.5">
                {profile.postsCount || 0}
              </span>
              <span className="text-gray-500">Posts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
