import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, ChevronDown, Link, Pencil, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { InputGroup, SelectField, SelectWithTags, TextAreaField, type Option } from '../../../components/MultiStepForm';
import { ProfileAvatar } from '../../../components/profile/ProfileAvatar';
import authAPI from '../../../services/authService';
import lookupAPI from '../../../services/lookupService';
import { toStorageProfilePictureUrl } from '../../../utils/profileImageUrl';
import type { ProfileEntity, SocialLink } from '../types';
import type { SubDomain, Technology } from '../../../types/api';
import {
  isMentorLinkedInSyntheticId,
  mentorLinkedInSyntheticId,
  normalizeSocialPlatform,
  experienceLevelToApiValue,
  experienceLevelToSelectValue,
  enumNameToSelectValue,
  mentorYearsSelectToApiValue,
  mentorYearsToSelectValue,
  MENTOR_YEARS_OPTIONS,
  selectValueToEnumName,
  validateSocialLinks,
  type OwnProfileUpdatePayload,
} from '../profileService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileEntity;
  onSave: (updates: OwnProfileUpdatePayload) => void | Promise<void>;
}

type ToolSelection = {
  technologyId: number;
  name: string;
  level: string;
};

function toolsFromProfile(profile: ProfileEntity): ToolSelection[] {
  if (profile.role === 'mentor') {
    return profile.expertise.map((item) => ({
      technologyId: item.technologyId,
      name: item.technologyName,
      level: '',
    }));
  }

  return profile.technologies.map((item) => ({
    technologyId: item.technologyId,
    name: item.technologyName,
    level: experienceLevelToSelectValue(item.experienceLevel),
  }));
}

function parseTechnologyId(id: string): number {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : 0;
}

const DEFAULT_EXPERIENCE_LEVELS: Option[] = [
  { label: 'None', value: '1' },
  { label: 'Beginner', value: '2' },
  { label: 'Intermediate', value: '3' },
  { label: 'Advanced', value: '4' },
];

function toExperienceLevelOption(level: { name?: string; label?: string; value?: string | number }): Option {
  const label = String(level.name ?? level.label ?? 'Option');
  const value = String(level.value ?? label);
  return { label, value };
}

function SectionHeader({
  title,
  subtitle,
  open,
  onToggle,
}: {
  title: string;
  subtitle: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#FBFCFF]"
    >
      <div>
        <h3 className="mt-1 text-lg font-bold text-[#1F2533]">{title}</h3>
        <p className="mt-1 text-sm text-[#6B7289]">{subtitle}</p>
      </div>
      <ChevronDown size={18} className={`shrink-0 text-[#8B92A8] transition ${open ? 'rotate-180' : ''}`} />
    </button>
  );
}

export function EditProfileModal({ isOpen, onClose, profile, onSave }: EditProfileModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMentor = profile.role === 'mentor';
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [headline, setHeadline] = useState(profile.headline);
  const [countryCode, setCountryCode] = useState(profile.countryCode ?? '');
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [profilePicturePath, setProfilePicturePath] = useState(
    profile.profilePicturePath ?? ''
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [links, setLinks] = useState<SocialLink[]>(profile.socialLinks);
  const [domainId, setDomainId] = useState(profile.domainId ?? '');
  const [yearsOfExperience, setYearsOfExperience] = useState(
    mentorYearsToSelectValue(profile.yearsOfExperience)
  );
  const [educationStatus, setEducationStatus] = useState(
    enumNameToSelectValue('educationStatus', profile.educationStatus)
  );
  const [currentLevel, setCurrentLevel] = useState(
    enumNameToSelectValue('currentLevel', profile.currentLevel)
  );
  const [relevantExpertise, setRelevantExpertise] = useState<string[]>(
    profile.subDomains.map((item) => item.name)
  );
  const [selectedSubDomainIds, setSelectedSubDomainIds] = useState<number[]>(
    profile.subDomains.map((item) => item.id)
  );
  const [tools, setTools] = useState<ToolSelection[]>(() => toolsFromProfile(profile));
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const [domains, setDomains] = useState<Option[]>([]);
  const [subDomainOptions, setSubDomainOptions] = useState<SubDomain[]>([]);
  const [technologyOptions, setTechnologyOptions] = useState<Technology[]>([]);
  const [technologySubDomainMap, setTechnologySubDomainMap] = useState<Map<number, number>>(
    () => new Map()
  );
  const [toolExperienceLevels, setToolExperienceLevels] = useState<Option[]>(DEFAULT_EXPERIENCE_LEVELS);
  const [educationStatusOptions, setEducationStatusOptions] = useState<Option[]>([]);
  const [currentLevelOptions, setCurrentLevelOptions] = useState<Option[]>([]);
  const mentorYearsOptions = useMemo<Option[]>(
    () => MENTOR_YEARS_OPTIONS.map((option) => ({ ...option })),
    []
  );
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toolError, setToolError] = useState('');
  const [linkError, setLinkError] = useState('');

  const selectedToolIds = useMemo(() => new Set(tools.map((tool) => tool.technologyId)), [tools]);
  const availableTechnologies = technologyOptions.filter(
    (tech) => !selectedToolIds.has(parseTechnologyId(tech.id))
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDisplayName(profile.displayName);
    setHeadline(profile.headline);
    setCountryCode(profile.countryCode ?? '');
    setEmail(profile.email);
    setBio(profile.bio);
    setProfilePicturePath(profile.profilePicturePath ?? '');
    setLinks(profile.socialLinks);
    setDomainId(profile.domainId ?? '');
    setYearsOfExperience(mentorYearsToSelectValue(profile.yearsOfExperience));
    setEducationStatus(enumNameToSelectValue('educationStatus', profile.educationStatus));
    setCurrentLevel(enumNameToSelectValue('currentLevel', profile.currentLevel));
    setRelevantExpertise(profile.subDomains.map((item) => item.name));
    setSelectedSubDomainIds(profile.subDomains.map((item) => item.id));
    setTools(toolsFromProfile(profile));
    setBasicInfoOpen(true);
    setExperienceOpen(true);
    setToolDropdownOpen(false);
    setSaveError('');
    setToolError('');
    setLinkError('');

    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const domainsResponse = await lookupAPI.getDomains();

        if (domainsResponse.success && domainsResponse.data) {
          const domainOptions = domainsResponse.data.map((domain) => ({
            label: domain.name,
            value: domain.id,
          }));
          setDomains(domainOptions);

          const domainName = profile.domainName?.trim().toLowerCase();
          const matchedDomain = domainName
            ? domainOptions.find((option) => option.label.trim().toLowerCase() === domainName)
            : undefined;

          if (profile.domainId) {
            setDomainId(profile.domainId);
          } else if (matchedDomain) {
            setDomainId(matchedDomain.value);
          }
        } else {
          setDomains([
            { label: 'Design', value: 'design' },
            { label: 'Software', value: 'software' },
            { label: 'Marketing', value: 'marketing' },
          ]);
        }

        if (!isMentor) {
          const [educationResponse, currentLevelResponse, experienceResponse] = await Promise.all([
            lookupAPI.getEducationStatuses(),
            lookupAPI.getCurrentLevels(),
            lookupAPI.getExperienceLevels(),
          ]);

          if (educationResponse.success && educationResponse.data) {
            setEducationStatusOptions(educationResponse.data.map(toExperienceLevelOption));
          }

          if (currentLevelResponse.success && currentLevelResponse.data) {
            setCurrentLevelOptions(currentLevelResponse.data.map(toExperienceLevelOption));
          }

          if (experienceResponse.success && experienceResponse.data) {
            setToolExperienceLevels(experienceResponse.data.map(toExperienceLevelOption));
          }
        } else {
          setYearsOfExperience((prev) => prev || mentorYearsToSelectValue(profile.yearsOfExperience));
        }
      } catch (error) {
        setDomains([
          { label: 'Design', value: 'design' },
          { label: 'Software', value: 'software' },
          { label: 'Marketing', value: 'marketing' },
        ]);
        if (!isMentor) {
          setToolExperienceLevels(DEFAULT_EXPERIENCE_LEVELS);
        }
      } finally {
        setLoadingLookups(false);
      }
    };

    void loadLookups();
  }, [isOpen, profile, isMentor]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!domainId) {
      setSubDomainOptions([]);
      setTechnologyOptions([]);
      setToolDropdownOpen(false);
      return;
    }

    const loadSubDomains = async () => {
      try {
        const response = await lookupAPI.getSubDomains(domainId);
        if (response.success && response.data) {
          setSubDomainOptions(response.data);
        } else {
          setSubDomainOptions([]);
        }
      } catch (error) {
        setSubDomainOptions([]);
      }
    };

    void loadSubDomains();
  }, [isOpen, domainId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const subDomainIdsForCatalog =
      selectedSubDomainIds.length > 0
        ? selectedSubDomainIds
        : subDomainOptions
            .filter((subDomain) => relevantExpertise.includes(subDomain.name))
            .map((subDomain) => Number(subDomain.id))
            .filter((id) => Number.isFinite(id) && id > 0);

    if (subDomainIdsForCatalog.length === 0) {
      setTechnologyOptions([]);
      setTechnologySubDomainMap(new Map());
      setToolDropdownOpen(false);
      return;
    }

    const loadTechnologies = async () => {
      try {
        const responses = await Promise.all(
          subDomainIdsForCatalog.map((id) => lookupAPI.getTechnologies(String(id)))
        );

        const uniqueById = new Map<number, Technology>();
        const subDomainMap = new Map<number, number>();

        subDomainIdsForCatalog.forEach((subDomainId, index) => {
          const response = responses[index];
          if (!response?.success || !response.data) {
            return;
          }

          response.data.forEach((technology) => {
            const technologyId = parseTechnologyId(technology.id);
            if (technologyId <= 0) {
              return;
            }

            subDomainMap.set(technologyId, subDomainId);
            if (!uniqueById.has(technologyId)) {
              uniqueById.set(technologyId, {
                ...technology,
                subDomainId: String(subDomainId),
              });
            }
          });
        });

        tools.forEach((tool) => {
          if (tool.technologyId > 0 && !uniqueById.has(tool.technologyId)) {
            uniqueById.set(tool.technologyId, {
              id: String(tool.technologyId),
              name: tool.name,
            });
          }
        });

        setTechnologySubDomainMap(subDomainMap);
        setTechnologyOptions(Array.from(uniqueById.values()));
      } catch {
        setTechnologySubDomainMap(new Map());
        setTechnologyOptions(
          tools.map((tool) => ({
            id: String(tool.technologyId),
            name: tool.name,
          }))
        );
      }
    };

    void loadTechnologies();
  }, [isOpen, selectedSubDomainIds, relevantExpertise, subDomainOptions, tools]);

  const removeToolsForSubDomain = (subDomainId: number) => {
    const removedTechnologyIds = new Set<number>();

    technologySubDomainMap.forEach((mappedSubDomainId, technologyId) => {
      if (mappedSubDomainId === subDomainId) {
        removedTechnologyIds.add(technologyId);
      }
    });

    technologyOptions.forEach((technology) => {
      if (Number(technology.subDomainId) === subDomainId) {
        const technologyId = parseTechnologyId(technology.id);
        if (technologyId > 0) {
          removedTechnologyIds.add(technologyId);
        }
      }
    });

    setTools((prev) => prev.filter((tool) => !removedTechnologyIds.has(tool.technologyId)));
    setToolError('');
  };

  const handleSave = async () => {
    if (selectedSubDomainIds.length === 0) {
      setToolError('Please select at least one area of expertise');
      setExperienceOpen(true);
      return;
    }

    if (!isMentor) {
      if (tools.length === 0) {
        setToolError('Please select at least one tool');
        setExperienceOpen(true);
        return;
      }

      const incompleteTools = tools.filter((tool) => !tool.level);
      if (incompleteTools.length > 0) {
        setToolError('Please select a level for each selected tool');
        setExperienceOpen(true);
        return;
      }
    } else if (tools.length === 0) {
      setToolError('Please select at least one area of expertise');
      setExperienceOpen(true);
      return;
    }

    const linkValidationError = validateSocialLinks(links);
    if (linkValidationError) {
      setLinkError(linkValidationError);
      setBasicInfoOpen(true);
      return;
    }

    setSaving(true);
    setSaveError('');
    setLinkError('');
    try {
      const linkedInLink = links.find(
        (link) =>
          isMentorLinkedInSyntheticId(link.id, profile.userId) ||
          link.platform === 'linkedin' ||
          link.label.toLowerCase().includes('linkedin')
      );

      await onSave({
        bio,
        countryCode,
        profilePictureUrl: profilePicturePath || undefined,
        linkedInUrl: isMentor ? linkedInLink?.url.trim() ?? '' : undefined,
        socialLinks: links,
        subDomainIds: selectedSubDomainIds,
        technologyInterests: isMentor
          ? undefined
          : tools.map((tool) => ({
              technologyId: tool.technologyId,
              experienceLevel: experienceLevelToApiValue(tool.level),
            })),
        expertiseTechnologyIds: isMentor ? tools.map((tool) => tool.technologyId) : undefined,
        educationStatus: isMentor
          ? undefined
          : selectValueToEnumName(educationStatusOptions, educationStatus),
        currentLevel: isMentor
          ? undefined
          : selectValueToEnumName(currentLevelOptions, currentLevel),
        yearsOfExperience: isMentor ? mentorYearsSelectToApiValue(yearsOfExperience) : undefined,
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = () => {
    const isMentor = profile.role === 'mentor';
    const hasLinkedIn = links.some(
      (link) =>
        isMentorLinkedInSyntheticId(link.id, profile.userId) ||
        link.platform === 'linkedin' ||
        link.label.toLowerCase().includes('linkedin')
    );

    if (isMentor && !hasLinkedIn) {
      setLinks((prev) => [
        ...prev,
        {
          id: mentorLinkedInSyntheticId(profile.userId),
          platform: 'linkedin',
          label: 'LinkedIn',
          url: '',
        },
      ]);
      return;
    }

    setLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}`,
        platform: 'other',
        label: '',
        url: '',
      },
    ]);
    setLinkError('');
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
    setLinkError('');
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const input = event.target;

    void (async () => {
      setUploadingPhoto(true);
      setSaveError('');
      try {
        const response = await authAPI.uploadFile(file, 'profile-picture');
        if (response.success && response.data?.fileUrl) {
          setProfilePicturePath(
            toStorageProfilePictureUrl(response.data.fileUrl) ?? response.data.fileUrl
          );
        } else {
          setSaveError(response.message || 'Failed to upload profile picture.');
        }
      } catch (error) {
        setSaveError(
          error instanceof Error ? error.message : 'Failed to upload profile picture.'
        );
      } finally {
        setUploadingPhoto(false);
        input.value = '';
      }
    })();
  };

  const handleAddTool = (technology: Technology) => {
    const technologyId = parseTechnologyId(technology.id);
    if (!technologyId) {
      return;
    }

    setTools((prev) => {
      if (prev.some((tool) => tool.technologyId === technologyId)) {
        return prev;
      }
      return [...prev, { technologyId, name: technology.name, level: '' }];
    });
    setToolDropdownOpen(false);
    setToolError('');
  };

  const handleRemoveTool = (technologyId: number) => {
    setTools((prev) => prev.filter((tool) => tool.technologyId !== technologyId));
    setToolError('');
  };

  const handleToolLevelChange = (technologyId: number, level: string) => {
    setTools((prev) =>
      prev.map((tool) => (tool.technologyId === technologyId ? { ...tool, level } : tool))
    );
    if (level) {
      setToolError('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECEFF5] px-6 py-4">
        <div className="flex items-center gap-2">
          <Pencil className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-[#1F2533]">Edit Profile</h2>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="flex flex-col items-center border-b border-[#ECEFF5] pb-6 sm:flex-row sm:items-start sm:gap-6">
          <div className="relative">
            <button
              type="button"
              onClick={handlePhotoClick}
              className="group block rounded-full outline-none"
              aria-label="Change photo"
            >
              <ProfileAvatar
                pictureUrl={profilePicturePath}
                name={displayName}
                alt=""
                className={`h-28 w-28 rounded-full object-cover ring-4 ring-[#F0F2F8] transition group-hover:opacity-90 ${uploadingPhoto ? 'opacity-60' : ''}`}
              />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
            <button
              type="button"
              onClick={handlePhotoClick}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-md"
              aria-label="Change photo"
            >
              <Camera size={16} />
            </button>
          </div>
          <div className="mt-4 text-center sm:mt-0 sm:text-left">
            <p className="font-semibold text-[#1F2533]">Your Photo</p>
            <p className="text-sm text-[#6B7289]">
              {uploadingPhoto ? 'Uploading...' : 'Update your profile picture'}
            </p>
          </div>
        </div>

        {loadingLookups ? (
          <div className="rounded-3xl border border-[#ECEFF5] bg-white px-6 py-10 text-center text-sm text-[#6B7289]">
            Loading form data...
          </div>
        ) : (
          <div className="space-y-4">
            <section className="overflow-hidden rounded-3xl border border-[#ECEFF5] bg-white shadow-sm">
              <SectionHeader
                title="Basic Info"
                subtitle="Update your name, contact details, bio, and social links."
                open={basicInfoOpen}
                onToggle={() => setBasicInfoOpen((prev) => !prev)}
              />

              {basicInfoOpen ? (
                <div className="border-t border-[#ECEFF5] px-5 py-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
                        Full Name
                      </label>
                      <input
                        value={displayName}
                        readOnly
                        disabled
                        aria-readonly="true"
                        className="w-full cursor-not-allowed rounded-xl border border-[#D8DCE8] bg-[#F8F9FD] px-4 py-2.5 text-sm text-[#5C6378] outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
                        Role / Headline
                      </label>
                      <input
                        value={headline}
                        onChange={(e) => setHeadline(e.target.value)}
                        className="w-full rounded-xl border border-[#D8DCE8] px-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
                        Country Code
                      </label>
                      <input
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                        placeholder="EG"
                        className="w-full rounded-xl border border-[#D8DCE8] px-4 py-2.5 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        disabled
                        aria-readonly="true"
                        className="w-full cursor-not-allowed rounded-xl border border-[#D8DCE8] bg-[#F8F9FD] px-4 py-2.5 text-sm text-[#5C6378] outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#8B92A8]">
                        Bio / Summary
                      </label>
                      <TextAreaField
                        id="bio"
                        value={bio}
                        onChange={setBio}
                        rows={4}
                        placeholder="Write a short summary about yourself..."
                      />
                    </div>
                  </div>

                  <div className="mt-6 border-t border-[#ECEFF5] pt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Online presence</span>
                      <button type="button" onClick={handleAddLink} className="text-primary hover:opacity-80" aria-label="Add link">
                        <Plus size={20} />
                      </button>
                    </div>
                    <ul className="space-y-3">
                      {links.map((link) => (
                        <li
                          key={link.id}
                          className="flex flex-col gap-2 rounded-xl border border-[#E8EBF2] px-3 py-2 sm:flex-row sm:items-center"
                        >
                          <input
                            disabled={saving}
                            value={link.label}
                            onChange={(e) => {
                              const label = e.target.value;
                              setLinks((prev) =>
                                prev.map((item) =>
                                  item.id === link.id
                                    ? {
                                        ...item,
                                        label,
                                        platform: normalizeSocialPlatform(label),
                                      }
                                    : item
                                )
                              );
                              setLinkError('');
                            }}
                            placeholder="Label (e.g. GitHub)"
                            className="w-full min-w-0 rounded-lg border border-[#E8EBF2] bg-white px-3 py-2 text-sm outline-none focus:border-primary sm:w-36"
                          />
                          <input
                            disabled={saving}
                            value={link.url}
                            onChange={(e) => {
                              setLinks((prev) =>
                                prev.map((item) =>
                                  item.id === link.id ? { ...item, url: e.target.value } : item
                                )
                              );
                              setLinkError('');
                            }}
                            placeholder="https://..."
                            className="min-w-0 flex-1 rounded-lg border border-[#E8EBF2] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            className="self-end text-[#9CA3B8] hover:text-red-500 sm:self-center"
                            aria-label="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    {linkError ? <p className="mt-2 text-sm text-red-600">{linkError}</p> : null}
                  </div>
                </div>
              ) : null}
            </section>

            <section className="overflow-hidden rounded-3xl border border-[#ECEFF5] bg-white shadow-sm">
              <SectionHeader
                title="Your Experience"
                subtitle="Pick your domain, expertise areas, and tools with their levels."
                open={experienceOpen}
                onToggle={() => setExperienceOpen((prev) => !prev)}
              />

              {experienceOpen ? (
                <div className="border-t border-[#ECEFF5] px-5 py-5">
                  <div className="space-y-5">
                    <InputGroup label="Your Domain of Expertise" htmlFor="domainId">
                      <SelectField
                        id="domainId"
                        value={domainId}
                        onChange={() => {}}
                        options={domains}
                        disabled
                      />
                    </InputGroup>

                    {isMentor ? (
                      <InputGroup label="Years of Experience" htmlFor="yearsOfExperience">
                        <SelectField
                          id="yearsOfExperience"
                          value={yearsOfExperience}
                          onChange={setYearsOfExperience}
                          options={mentorYearsOptions}
                        />
                      </InputGroup>
                    ) : (
                      <>
                        <InputGroup label="Education Status" htmlFor="educationStatus">
                          <SelectField
                            id="educationStatus"
                            value={educationStatus}
                            onChange={setEducationStatus}
                            options={educationStatusOptions}
                          />
                        </InputGroup>

                        <InputGroup label="Current Level" htmlFor="currentLevel">
                          <SelectField
                            id="currentLevel"
                            value={currentLevel}
                            onChange={setCurrentLevel}
                            options={currentLevelOptions}
                          />
                        </InputGroup>
                      </>
                    )}

                    <InputGroup label="Relevant Expertise" htmlFor="relevantExpertise">
                      <SelectWithTags
                        id="relevantExpertise"
                        options={subDomainOptions.map((subDomain) => subDomain.name)}
                        selected={relevantExpertise}
                        onAdd={(item) => {
                          setRelevantExpertise((prev) => [...prev, item]);
                          const subDomain = subDomainOptions.find((option) => option.name === item);
                          if (subDomain) {
                            const subDomainId = Number(subDomain.id);
                            if (subDomainId > 0) {
                              setSelectedSubDomainIds((prev) =>
                                prev.includes(subDomainId) ? prev : [...prev, subDomainId]
                              );
                            }
                          }
                        }}
                        onRemove={(item) => {
                          setRelevantExpertise((prev) => prev.filter((value) => value !== item));
                          const subDomain = subDomainOptions.find((option) => option.name === item);
                          if (subDomain) {
                            const subDomainId = Number(subDomain.id);
                            if (subDomainId > 0) {
                              setSelectedSubDomainIds((prev) => prev.filter((id) => id !== subDomainId));
                              removeToolsForSubDomain(subDomainId);
                            }
                          }
                        }}
                        placeholder="Select expertise..."
                      />
                    </InputGroup>

                    <InputGroup label={isMentor ? 'Expertise' : 'Tools'} htmlFor="tools">
                      <div className="space-y-3">
                        <div
                          onClick={() => setToolDropdownOpen((prev) => !prev)}
                          className="flex min-h-[48px] cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-base text-slateInk outline-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                        >
                          {tools.length > 0 ? (
                            tools.map((tool) => (
                              <div
                                key={tool.technologyId}
                                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                              >
                                <span>#{tool.name}</span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveTool(tool.technologyId);
                                  }}
                                  className="inline-flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-primary transition hover:bg-primary/20"
                                >
                                  ✕
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-gray-400">Select tools...</span>
                          )}
                          <ChevronDown
                            size={16}
                            className={`ml-auto shrink-0 text-slateInk transition ${toolDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </div>

                        {toolDropdownOpen && availableTechnologies.length > 0 ? (
                          <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                            {availableTechnologies.map((technology) => (
                              <button
                                key={technology.id}
                                type="button"
                                onClick={() => handleAddTool(technology)}
                                className="block w-full px-4 py-3 text-left text-sm text-slateInk transition hover:bg-indigo-50 first:rounded-t-xl last:rounded-b-xl"
                              >
                                {technology.name}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        {tools.length > 0 ? (
                          <div className="space-y-3">
                            {tools.map((tool) => (
                              <div
                                key={tool.technologyId}
                                className="flex flex-col gap-3 rounded-xl border border-[#E8EBF2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                    #{tool.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {!isMentor ? (
                                    <select
                                      value={tool.level}
                                      onChange={(event) =>
                                        handleToolLevelChange(tool.technologyId, event.target.value)
                                      }
                                      className="rounded-xl border border-[#D8DCE8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                                    >
                                      <option value="">Level</option>
                                      {toolExperienceLevels.map((level) => (
                                        <option key={level.value} value={level.value}>
                                          {level.label}
                                        </option>
                                      ))}
                                    </select>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTool(tool.technologyId)}
                                    className="rounded-full p-2 text-[#9CA3B8] transition hover:bg-red-50 hover:text-red-500"
                                    aria-label={`Remove ${tool.name}`}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {toolError ? <p className="text-sm text-red-600">{toolError}</p> : null}
                      </div>
                    </InputGroup>
                  </div>
                </div>
              ) : null}
            </section>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-[#ECEFF5] px-6 py-4">
        {saveError ? <p className="mr-auto text-sm text-red-600">{saveError}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-[#D8DCE8] px-4 py-2 text-sm font-semibold text-primary hover:bg-[#F8F9FD]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-70"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
}
