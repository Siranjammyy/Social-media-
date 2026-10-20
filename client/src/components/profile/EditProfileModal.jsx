import React, { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { userService } from '../../services/userService';
import { uploadService } from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../common/Avatar';

export const EditProfileModal = ({ isOpen, onClose, onUpdated }) => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [location, setLocation] = useState(user?.location || '');
  const [accountVisibility, setAccountVisibility] = useState(
    user?.accountVisibility || 'public'
  );

  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [coverImage, setCoverImage] = useState(user?.coverImage || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFiles([file]);
      if (res.success && res.files[0]) {
        setAvatar(res.files[0].url);
        toast.success('Profile photo uploaded.');
      }
    } catch (err) {
      toast.error('Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadService.uploadFiles([file]);
      if (res.success && res.files[0]) {
        setCoverImage(res.files[0].url);
        toast.success('Cover photo uploaded.');
      }
    } catch (err) {
      toast.error('Failed to upload cover photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await userService.updateProfile({
        name,
        bio,
        website,
        location,
        avatar,
        coverImage,
        accountVisibility,
      });

      if (res.success) {
        updateUser(res.user);
        toast.success('Profile updated successfully!');
        if (onUpdated) onUpdated(res.user);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" maxWidth="max-w-lg">
      <form onSubmit={handleSave} className="space-y-4">
        {/* Cover Image Upload Area */}
        <div className="relative h-32 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent overflow-hidden group">
          {coverImage ? (
            <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full opacity-60" />
          )}

          <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white text-xs font-semibold gap-1.5">
            <Camera className="w-4 h-4" />
            <span>Change Cover</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverUpload}
            />
          </label>
        </div>

        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar src={avatar} name={name} size="xl" />
            <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white">
              <Camera className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile Photo</p>
            <p className="text-xs text-gray-500">Recommended: Square format (PNG, JPG, WEBP)</p>
          </div>
        </div>

        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={280}
            rows={3}
            placeholder="Tell the Aura community about yourself..."
            className="w-full rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#273449] p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-brand-primary"
          />
          <span className="text-xs text-right text-gray-400">{280 - bio.length} characters remaining</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location"
            placeholder="e.g. San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <Input
            label="Website"
            placeholder="https://example.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Privacy</label>
          <select
            value={accountVisibility}
            onChange={(e) => setAccountVisibility(e.target.value)}
            className="w-full rounded-xl bg-white dark:bg-[#111827] border border-gray-200 dark:border-[#273449] px-3.5 py-2.5 text-sm text-gray-900 dark:text-white outline-none"
          >
            <option value="public">Public (Anyone can view posts and follow)</option>
            <option value="private">Private (Only approved followers can view posts)</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-[#273449]">
          <Button variant="secondary" onClick={onClose} disabled={isSaving || isUploading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving || isUploading}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
