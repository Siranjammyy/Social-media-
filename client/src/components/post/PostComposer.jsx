import React, { useState, useRef } from 'react';
import {
  Image,
  Globe,
  Users,
  Lock,
  MapPin,
  X,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { postService } from '../../services/postService';
import { uploadService } from '../../services/messageService';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';

export const PostComposer = ({ onPostCreated, className = '' }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) return null;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (mediaFiles.length + files.length > 4) {
      toast.error('You can upload a maximum of 4 media attachments per post.');
      return;
    }

    setMediaFiles((prev) => [...prev, ...files]);

    const newPreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && mediaFiles.length === 0) {
      toast.error('Please write something or attach media to publish.');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedMedia = [];

      if (mediaFiles.length > 0) {
        const uploadRes = await uploadService.uploadFiles(mediaFiles);
        if (uploadRes.success && uploadRes.files) {
          uploadedMedia = uploadRes.files.map((f) => ({
            url: f.url,
            type: f.type,
          }));
        }
      }

      const res = await postService.createPost({
        text,
        visibility,
        location: location.trim(),
        media: uploadedMedia,
      });

      if (res.success) {
        toast.success('Your post has been published!');
        setText('');
        setLocation('');
        setShowLocationInput(false);
        setMediaFiles([]);
        setPreviewUrls([]);
        if (onPostCreated) {
          onPostCreated(res.post);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`nexora-card p-4 sm:p-5 mb-5 ${className}`}>
      <div className="flex gap-3.5">
        <Avatar src={user.avatar} name={user.name} size="md" isVerified={user.isVerified} />

        <div className="flex-1 min-w-0">
          <textarea
            placeholder={`What's happening, ${user.name.split(' ')[0]}? Share your ideas, moments, or #hashtags...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={3000}
            rows={text.length > 100 ? 4 : 2}
            className="w-full bg-transparent resize-none border-none outline-none text-sm sm:text-base text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-0 p-0"
          />

          {/* Media Previews Grid */}
          {previewUrls.length > 0 && (
            <div
              className={`grid gap-2 mt-3 mb-2 rounded-xl overflow-hidden ${
                previewUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
              }`}
            >
              {previewUrls.map((item, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 max-h-64">
                  {item.type === 'video' ? (
                    <video src={item.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt="upload preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Optional Location Input */}
          {showLocationInput && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-[#182235] border border-gray-200 dark:border-[#273449]">
              <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
              <input
                type="text"
                placeholder="Add a location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="bg-transparent text-xs w-full outline-none text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => {
                  setLocation('');
                  setShowLocationInput(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-[#273449]">
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Media Picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-brand-primary hover:bg-brand-primary/10 transition"
                title="Add photos or video"
              >
                <Image className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*,video/*"
                className="hidden"
              />

              {/* Location Picker */}
              <button
                type="button"
                onClick={() => setShowLocationInput(!showLocationInput)}
                className="p-2 rounded-xl text-gray-500 hover:text-brand-primary hover:bg-brand-primary/10 transition"
                title="Add location"
              >
                <MapPin className="w-5 h-5" />
              </button>

              {/* Visibility Selector */}
              <div className="relative inline-flex items-center bg-gray-100 dark:bg-[#182235] rounded-lg px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                {visibility === 'public' && <Globe className="w-3.5 h-3.5 mr-1 text-emerald-500" />}
                {visibility === 'followers' && <Users className="w-3.5 h-3.5 mr-1 text-brand-primary" />}
                {visibility === 'private' && <Lock className="w-3.5 h-3.5 mr-1 text-amber-500" />}
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer pr-1"
                >
                  <option value="public" className="dark:bg-[#111827]">Public</option>
                  <option value="followers" className="dark:bg-[#111827]">Followers</option>
                  <option value="private" className="dark:bg-[#111827]">Private</option>
                </select>
              </div>
            </div>

            {/* Character counter & Publish button */}
            <div className="flex items-center gap-3">
              {text.length > 0 && (
                <span
                  className={`text-xs font-mono ${
                    text.length > 2800 ? 'text-rose-500 font-bold' : 'text-gray-400'
                  }`}
                >
                  {3000 - text.length}
                </span>
              )}
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                size="sm"
                className="rounded-xl px-4 py-2 font-semibold shadow-md shadow-brand-primary/20"
              >
                Publish
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
