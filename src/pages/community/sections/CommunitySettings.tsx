/**
 * CommunitySettings Section Component
 * Community settings and management interface
 */

import React, { useState, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { CommunitySettings, Community } from '../types';

const COMMUNITY_DOMAINS = [
  'Software Engineering',
  'Data Science',
  'UI/UX Design',
  'Product Management',
  'Cybersecurity',
];

interface CommunitySettingsSectionProps {
  community: Community;
  onSave: (settings: Partial<CommunitySettings>) => void;
  isLoading?: boolean;
  onDelete?: () => void;
  onClose?: () => void;
}

/**
 * CommunitySettingsSection - Settings management
 * Features:
 * - Edit community info
 * - Change avatar and cover
 * - Update description and domain
 * - Delete community (admin only)
 */
export const CommunitySettingsSection: React.FC<CommunitySettingsSectionProps> = ({
  community,
  onSave,
  isLoading,
  onDelete,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    name: community.name,
    description: community.description,
    domain: community.domain,
    avatar: community.avatar,
    cover: community.cover,
  });
  const [isSaving, setIsSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const handleFilePick = (type: 'avatar' | 'cover') => {
    if (type === 'avatar') avatarInputRef.current?.click();
    else coverInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData((prev) => ({ ...prev, [type]: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Support sync or async onSave handlers
      const res = onSave(formData);
      if (res && typeof (res as Promise<unknown>).then === 'function') {
        await res;
      }
      // Save succeeded — modal will be closed below in finally
    } finally {
      setIsSaving(false);
      // Close modal regardless (defensive) so UI doesn't hang; parent can handle errors if needed
      try {
        onClose?.();
      } catch (err) {
        // swallow
      }
    }
  };

  return (
    <div className="space-y-6 bg-pane">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Community Information</h2>
            <p className="mt-1 text-sm text-gray-500">Basic details and visual identity for your mentorship space.</p>
          </div>
          <ChevronUp size={18} className="text-gray-500" />
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Community Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-pane px-3 py-2.5 text-sm text-gray-900 outline-none"
              disabled={isLoading || isSaving}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={4}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-pane px-3 py-2.5 text-sm text-gray-900 outline-none"
              disabled={isLoading || isSaving}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Community Avatar</label>
              <div className="mt-2 flex items-center gap-3">
                <img src={formData.avatar} alt={community.name} className="h-12 w-12 rounded-lg border border-gray-200 object-cover" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilePick('avatar')}
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-primary"
                  >
                    Change Avatar
                  </button>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'avatar')}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Community Cover</label>
              <div className="mt-2 flex items-center gap-3">
                <img src={formData.cover} alt={community.name} className="h-12 w-12 rounded-lg border border-gray-200 object-cover" />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFilePick('cover')}
                    type="button"
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-primary"
                  >
                    Change Cover
                  </button>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'cover')}
                />
              </div>
            </div>
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Domain</label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData((prev) => ({ ...prev, domain: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-gray-200 bg-pane px-3 py-2.5 text-sm text-gray-900 outline-none"
              disabled={isLoading || isSaving}
            >
              {COMMUNITY_DOMAINS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      {onDelete && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-2xl font-bold text-slate-900">Advanced Actions</h3>
          <p className="mt-1 text-sm text-red-500">Warning: These actions are permanent and cannot be undone.</p>
          <div className="mt-6 flex items-center justify-between rounded-xl border border-gray-100 p-4">
            <div>
              <h4 className="font-semibold text-slate-900">Delete community</h4>
              <p className="text-sm text-gray-500">Permanently remove all data and content.</p>
            </div>
            <button
              onClick={onDelete}
              disabled={isLoading || isSaving}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      <div className="sticky bottom-0 z-20 -mx-6 border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-end gap-6">
          <button
            onClick={() => onClose?.()}
            className="text-base font-semibold text-gray-600"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
