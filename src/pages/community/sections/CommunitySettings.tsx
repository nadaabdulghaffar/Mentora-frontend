/**
 * CommunitySettings Section Component
 * Community settings and management interface
 */

import React, { useEffect, useRef, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import type { CommunitySettings, Community } from '../types';
import lookupAPI from '../../../services/lookupService';
import { uploadCommunityCoverImage } from '../../../services/fileUploadService';
import {
  resolveCommunityImageUrl,
  toStorageCommunityImageUrl,
} from '../../../utils/communityImageUrl';
import {
  validateCommunityImageFile,
  validateUpdateCommunityForm,
  type CommunityFieldErrors,
} from '../../../validators/community';

interface CommunitySettingsSectionProps {
  community: Community;
  onSave: (settings: Partial<CommunitySettings>) => void | Promise<void>;
  isLoading?: boolean;
  onDelete?: () => void;
  onClose?: () => void;
}

type DomainOption = {
  id: number;
  name: string;
};

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
    domainId: community.domainId,
    avatar: community.avatar,
    cover: community.cover,
  });
  const [storedCoverUrl, setStoredCoverUrl] = useState(
    toStorageCommunityImageUrl(community.cover) ?? ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CommunityFieldErrors>({});
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [domains, setDomains] = useState<DomainOption[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormData({
      name: community.name,
      description: community.description,
      domainId: community.domainId,
      avatar: community.avatar,
      cover: community.cover,
    });
    setStoredCoverUrl(
      toStorageCommunityImageUrl(community.cover) ?? ''
    );
  }, [community]);

  useEffect(() => {
    const loadDomains = async () => {
      try {
        const response = await lookupAPI.getDomains();
        if (response.success && response.data) {
          setDomains(
            response.data.map((domain) => ({
              id: Number(domain.id),
              name: domain.name,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load domains', error);
      } finally {
        setLoadingDomains(false);
      }
    };

    loadDomains();
  }, []);

  const handleCoverPick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const validation = validateCommunityImageFile(file);
    if (!validation.valid) {
      setCoverUploadError(validation.message || 'Invalid cover image.');
      event.target.value = '';
      return;
    }

    setCoverUploadError(null);
    setIsUploadingCover(true);
    setSaveError(null);

    try {
      const uploadedUrl = await uploadCommunityCoverImage(file);
      const storageUrl = toStorageCommunityImageUrl(uploadedUrl) ?? uploadedUrl;

      setStoredCoverUrl(storageUrl);
      setFormData((prev) => ({
        ...prev,
        cover: resolveCommunityImageUrl(storageUrl),
      }));
    } catch (error) {
      setCoverUploadError(
        error instanceof Error
          ? error.message
          : 'Failed to upload cover image.'
      );
    } finally {
      setIsUploadingCover(false);
      event.target.value = '';
    }
  };

  const handleSave = async () => {
    setSaveError(null);
    setFieldErrors({});

    const validationErrors = validateUpdateCommunityForm({
      name: formData.name,
      description: formData.description,
      domainId: formData.domainId,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setIsSaving(true);

    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        domainId: formData.domainId,
        cover: storedCoverUrl || undefined,
      });
      onClose?.();
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : 'Failed to save community settings.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const coverPreview = resolveCommunityImageUrl(
    storedCoverUrl || formData.cover
  );

  return (
    <div className="space-y-6 bg-pane">
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Community Information</h2>
            <p className="mt-1 text-sm text-gray-500">
              Basic details and visual identity for your mentorship space.
            </p>
          </div>
          <ChevronUp size={18} className="text-gray-500" />
        </div>

        {saveError && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {saveError}
          </p>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Community Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-pane px-3 py-2.5 text-sm text-gray-900 outline-none"
              disabled={isLoading || isSaving}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>
            )}
          </div>

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
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
            )}
          </div>

          <div>
              <label className="block text-sm font-medium text-gray-700">Community Cover</label>
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={coverPreview || formData.cover}
                  alt={community.name}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCoverPick}
                    type="button"
                    disabled={isLoading || isSaving || isUploadingCover}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-primary disabled:opacity-50"
                  >
                    {isUploadingCover ? 'Uploading…' : 'Change Cover'}
                  </button>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handleCoverChange}
                />
              </div>
              {coverUploadError && (
                <p className="mt-1 text-sm text-red-600">{coverUploadError}</p>
              )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Domain</label>
            <select
              value={formData.domainId || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  domainId: Number(e.target.value),
                }))
              }
              className="mt-2 w-full rounded-xl border border-gray-200 bg-pane px-3 py-2.5 text-sm text-gray-900 outline-none"
              disabled={isLoading || isSaving || loadingDomains}
            >
              <option value="">
                {loadingDomains ? 'Loading domains…' : 'Select domain'}
              </option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
            {fieldErrors.domainId && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.domainId}</p>
            )}
          </div>
        </div>
      </div>

      {onDelete && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="text-2xl font-bold text-slate-900">Advanced Actions</h3>
          <p className="mt-1 text-sm text-red-500">
            Warning: These actions are permanent and cannot be undone.
          </p>
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
            disabled={isLoading || isSaving || isUploadingCover}
            className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
