import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Camera, Check, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userService } from '../services/userService';
import { uploadService } from '../services/messageService';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';

const AVAILABLE_INTERESTS = [
  'Technology',
  'Design',
  'Web Development',
  'AI & Robotics',
  'Photography',
  'Startups',
  'Art & Illustration',
  'Science',
  'Music',
  'Gaming',
  'Writing',
  'Travel',
];

export const OnboardingPage = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followedUserIds, setFollowedUserIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Fetch suggestions for step 3
    const loadSuggestions = async () => {
      try {
        const res = await userService.getSuggestions(6);
        if (res.success) {
          setSuggestedUsers(res.users);
        }
      } catch (err) {
        // Silently catch
      }
    };
    loadSuggestions();
  }, []);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFiles([file]);
      if (res.success && res.files[0]) {
        setAvatar(res.files[0].url);
        toast.success('Avatar uploaded!');
      }
    } catch (err) {
      toast.error('Could not upload avatar.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFollowToggle = async (targetId) => {
    try {
      if (followedUserIds.has(targetId)) {
        await userService.unfollowUser(targetId);
        setFollowedUserIds((prev) => {
          const next = new Set(prev);
          next.delete(targetId);
          return next;
        });
      } else {
        await userService.followUser(targetId);
        setFollowedUserIds((prev) => new Set([...prev, targetId]));
      }
    } catch (err) {
      toast.error('Action failed.');
    }
  };

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await userService.completeOnboarding({
        avatar,
        bio: bio.trim(),
        interests: selectedInterests,
      });

      if (res.success) {
        updateUser(res.user);
        toast.success("Welcome aboard! Let's explore your home feed.");
        navigate('/home', { replace: true });
      }
    } catch (err) {
      toast.error('Could not finish onboarding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FC] dark:bg-[#0B1020]">
      <div className="w-full max-w-xl aura-card p-6 sm:p-10 shadow-2xl">
        {/* Top Progress Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100 dark:border-[#273449]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm text-gray-900 dark:text-white">
              Setup Your Aura Profile
            </span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all ${
                  step === s
                    ? 'bg-brand-primary w-8'
                    : step > s
                    ? 'bg-emerald-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Avatar & Bio */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Choose a Photo & Bio
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Help friends recognize you across Aura.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative group cursor-pointer">
                <Avatar src={avatar} name={user?.name || 'User'} size="2xl" />
                <label className="absolute inset-0 rounded-full bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-semibold">Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>
              <p className="text-[11px] text-gray-400">Click avatar to upload your own picture</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Short Bio (Optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                rows={3}
                placeholder="What are you building, learning, or passionate about?"
                className="w-full rounded-xl bg-gray-50 dark:bg-[#182235] border border-gray-200 dark:border-[#273449] p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Skip
              </Button>
              <Button onClick={() => setStep(2)}>
                Next Step <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                What are your interests?
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Select topics to personalize your For You stream.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 justify-center py-2">
              {AVAILABLE_INTERESTS.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/25 scale-105'
                        : 'bg-gray-100 dark:bg-[#182235] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#22314a]'
                    }`}
                  >
                    {interest}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Next Step <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Suggested Connections */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Follow initial accounts
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Discover creators and builders to populate your feed.
              </p>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {suggestedUsers.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  Ready to jump straight into Aura!
                </p>
              ) : (
                suggestedUsers.map((u) => {
                  const isFollowing = followedUserIds.has(u._id);
                  return (
                    <div
                      key={u._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#182235] border border-gray-100 dark:border-[#273449]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={u.avatar} name={u.name} size="md" isVerified={u.isVerified} />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {u.name}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">@{u.username}</p>
                          {u.bio && (
                            <p className="text-[11px] text-gray-500 truncate max-w-xs">{u.bio}</p>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isFollowing ? 'secondary' : 'primary'}
                        onClick={() => handleFollowToggle(u._id)}
                        className="rounded-full text-xs px-3.5 h-8 shrink-0"
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                onClick={handleFinishOnboarding}
                isLoading={isSubmitting}
                className="px-6 shadow-lg shadow-brand-primary/25"
              >
                Enter Home Feed <Sparkles className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
