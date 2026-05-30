import { useEffect, useRef, useState } from 'react';
import { Camera, ChevronDown, Link, Pencil, Plus, Trash2 } from 'lucide-react';
import { Modal } from '../../../components/Modal';
import { InputGroup, SelectField, SelectWithTags, TextAreaField, type Option } from '../../../components/MultiStepForm';
import authAPI from '../../../services/authService';
import lookupAPI from '../../../services/lookupService';
import type { ProfileEntity, SocialLink } from '../types';
import type { SubDomain, Technology } from '../../../types/api';
import type { OwnProfileUpdatePayload } from '../profileService';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileEntity;
  onSave: (updates: OwnProfileUpdatePayload) => void | Promise<void>;
}

type ToolSelection = {
  name: string;
  level: string;
};

const DEFAULT_EXPERIENCE_LEVELS: Option[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
];

function toExperienceOption(level: unknown): Option {
  if (typeof level === 'string' || typeof level === 'number') {
    const text = String(level);
    return { label: text, value: text.toLowerCase() };
  }

  if (level && typeof level === 'object') {
    const raw = level as { label?: unknown; name?: unknown; value?: unknown; id?: unknown };
    const label = String(raw.label ?? raw.name ?? raw.value ?? raw.id ?? 'Option');
    const value = String(raw.value ?? raw.id ?? raw.label ?? raw.name ?? label);
    return { label, value: value.toLowerCase() };
  }

  return { label: 'Option', value: 'option' };
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
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [headline, setHeadline] = useState(profile.headline);
  const [countryCode, setCountryCode] = useState(profile.countryCode ?? '');
  const [email, setEmail] = useState(profile.email);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [links, setLinks] = useState<SocialLink[]>(profile.socialLinks);
  const [domainId, setDomainId] = useState(profile.domainId ?? '');
  const [yearsOfExperience, setYearsOfExperience] = useState(profile.yearsOfExperience ?? '');
  const [relevantExpertise, setRelevantExpertise] = useState<string[]>(profile.relevantExpertise ?? []);
  const [tools, setTools] = useState<ToolSelection[]>(profile.tools ?? []);
  const [basicInfoOpen, setBasicInfoOpen] = useState(true);
  const [experienceOpen, setExperienceOpen] = useState(true);
  const [toolDropdownOpen, setToolDropdownOpen] = useState(false);
  const [domains, setDomains] = useState<Option[]>([]);
  const [subDomainOptions, setSubDomainOptions] = useState<SubDomain[]>([]);
  const [technologyOptions, setTechnologyOptions] = useState<Technology[]>([]);
  const [experienceLevels, setExperienceLevels] = useState<Option[]>(DEFAULT_EXPERIENCE_LEVELS);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [toolError, setToolError] = useState('');

  const selectedToolNames = tools.map((tool) => tool.name);
  const availableTechnologies = technologyOptions.filter((tech) => !selectedToolNames.includes(tech.name));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDisplayName(profile.displayName);
    setHeadline(profile.headline);
    setCountryCode(profile.countryCode ?? '');
    setEmail(profile.email);
    setBio(profile.bio);
    setAvatarUrl(profile.avatarUrl);
    setLinks(profile.socialLinks);
    setDomainId(profile.domainId ?? '');
    setYearsOfExperience(profile.yearsOfExperience ?? '');
    setRelevantExpertise(profile.relevantExpertise ?? []);
    setTools(profile.tools ?? []);
    setBasicInfoOpen(true);
    setExperienceOpen(true);
    setToolDropdownOpen(false);
    setSaveError('');
    setToolError('');

    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [domainsResponse, experienceResponse] = await Promise.all([
          lookupAPI.getDomains(),
          lookupAPI.getExperienceLevels(),
        ]);

        if (domainsResponse.success && domainsResponse.data) {
          const domainOptions = domainsResponse.data.map((domain) => ({
            label: domain.name,
            value: domain.id,
          }));
          setDomains(domainOptions);
          if (!profile.domainId && domainOptions.length > 0) {
            setDomainId(domainOptions[0].value);
          }
        } else {
          setDomains([
            { label: 'Design', value: 'design' },
            { label: 'Software', value: 'software' },
            { label: 'Marketing', value: 'marketing' },
          ]);
        }

        if (experienceResponse.success && experienceResponse.data) {
          setExperienceLevels(experienceResponse.data.map(toExperienceOption));
        }
      } catch (error) {
        setDomains([
          { label: 'Design', value: 'design' },
          { label: 'Software', value: 'software' },
          { label: 'Marketing', value: 'marketing' },
        ]);
        setExperienceLevels(DEFAULT_EXPERIENCE_LEVELS);
      } finally {
        setLoadingLookups(false);
      }
    };

    void loadLookups();
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!domainId) {
      setSubDomainOptions([]);
      setTechnologyOptions([]);
      setRelevantExpertise([]);
      setTools([]);
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

    const selectedSubDomainIds = subDomainOptions
      .filter((subDomain) => relevantExpertise.includes(subDomain.name))
      .map((subDomain) => subDomain.id);

    if (selectedSubDomainIds.length === 0) {
      setTechnologyOptions([]);
      setTools([]);
      setToolDropdownOpen(false);
      return;
    }

    const loadTechnologies = async () => {
      try {
        const responses = await Promise.all(
          selectedSubDomainIds.map((id) => lookupAPI.getTechnologies(id))
        );

        const technologies = responses
          .filter((response) => response.success && response.data)
          .flatMap((response) => response.data ?? []);

        const uniqueByName = new Map<string, Technology>();
        technologies.forEach((technology) => {
          if (!uniqueByName.has(technology.name)) {
            uniqueByName.set(technology.name, technology);
          }
        });

        const dedupedTechnologies = Array.from(uniqueByName.values());
        const validNames = new Set(dedupedTechnologies.map((technology) => technology.name));
        setTechnologyOptions(dedupedTechnologies);
        setTools((prev) => prev.filter((tool) => validNames.has(tool.name)));
      } catch (error) {
        setTechnologyOptions([]);
        setTools([]);
      }
    };

    void loadTechnologies();
  }, [isOpen, relevantExpertise, subDomainOptions]);

  const handleSave = async () => {
    const incompleteTools = tools.filter((tool) => !tool.level);
    if (incompleteTools.length > 0) {
      setToolError('Please select a level for each selected tool');
      setExperienceOpen(true);
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const linkedInUrl = links.find((link) => link.platform === 'linkedin' || link.label.toLowerCase().includes('linkedin'))?.url;

      await onSave({
        bio,
        countryCode,
        profilePictureUrl: avatarUrl,
        linkedInUrl,
      });
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = () => {
    setLinks((prev) => [
      ...prev,
      {
        id: `link-${Date.now()}`,
        platform: 'linkedin',
        label: 'LinkedIn',
        url: '',
      },
    ]);
  };

  const handleRemoveLink = (linkId: string) => {
    setLinks((prev) => prev.filter((link) => link.id !== linkId));
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
      try {
        const response = await authAPI.uploadFile(file, 'profile-picture');
        if (response.success && response.data?.fileUrl) {
          setAvatarUrl(response.data.fileUrl);
        }
      } finally {
        input.value = '';
      }
    })();
  };

  const handleAddTool = (toolName: string) => {
    setTools((prev) => {
      if (prev.some((tool) => tool.name === toolName)) {
        return prev;
      }
      return [...prev, { name: toolName, level: '' }];
    });
    setToolDropdownOpen(false);
    setToolError('');
  };

  const handleRemoveTool = (toolName: string) => {
    setTools((prev) => prev.filter((tool) => tool.name !== toolName));
    setToolError('');
  };

  const handleToolLevelChange = (toolName: string, level: string) => {
    setTools((prev) => prev.map((tool) => (tool.name === toolName ? { ...tool, level } : tool)));
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
              <img
                src={avatarUrl}
                alt=""
                className="h-28 w-28 rounded-full object-cover ring-4 ring-[#F0F2F8] transition group-hover:opacity-90"
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
            <p className="text-sm text-[#6B7289]">Update your profile picture</p>
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
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full rounded-xl border border-[#D8DCE8] px-4 py-2.5 text-sm outline-none focus:border-primary"
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
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-[#D8DCE8] px-4 py-2.5 text-sm outline-none focus:border-primary"
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
                        disabled={saving}
                      {links.map((link) => (
                        <li key={link.id} className="flex items-center gap-3 rounded-xl border border-[#E8EBF2] px-3 py-2">
                        {saving ? 'Saving...' : 'Save'}
                          <input
                            value={link.url}
                            onChange={(e) =>
                              setLinks((prev) =>
                                prev.map((item) => (item.id === link.id ? { ...item, url: e.target.value } : item))
                              )
                            }
                            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveLink(link.id)}
                            className="text-[#9CA3B8] hover:text-red-500"
                            aria-label="Remove"
                          >
                            <Trash2 size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
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
                        onChange={(value) => {
                          setDomainId(value);
                          setRelevantExpertise([]);
                          setTools([]);
                          setToolDropdownOpen(false);
                          setToolError('');
                        }}
                        options={domains}
                      />
                    </InputGroup>

                    <InputGroup label="Years of Experience" htmlFor="yearsOfExperience">
                      <SelectField
                        id="yearsOfExperience"
                        value={yearsOfExperience}
                        onChange={setYearsOfExperience}
                        options={experienceLevels}
                      />
                    </InputGroup>

                    <InputGroup label="Relevant Expertise" htmlFor="relevantExpertise">
                      <SelectWithTags
                        id="relevantExpertise"
                        options={subDomainOptions.map((subDomain) => subDomain.name)}
                        selected={relevantExpertise}
                        onAdd={(item) => setRelevantExpertise((prev) => [...prev, item])}
                        onRemove={(item) => setRelevantExpertise((prev) => prev.filter((value) => value !== item))}
                        placeholder="Select expertise..."
                      />
                    </InputGroup>

                    <InputGroup label="Tools" htmlFor="tools">
                      <div className="space-y-3">
                        <div
                          onClick={() => setToolDropdownOpen((prev) => !prev)}
                          className="flex min-h-[48px] cursor-pointer flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-base text-slateInk outline-none transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
                        >
                          {tools.length > 0 ? (
                            tools.map((tool) => (
                              <div
                                key={tool.name}
                                className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                              >
                                <span>#{tool.name}</span>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleRemoveTool(tool.name);
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
                                onClick={() => handleAddTool(technology.name)}
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
                                key={tool.name}
                                className="flex flex-col gap-3 rounded-xl border border-[#E8EBF2] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                                    #{tool.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <select
                                    value={tool.level}
                                    onChange={(event) => handleToolLevelChange(tool.name, event.target.value)}
                                    className="rounded-xl border border-[#D8DCE8] bg-white px-3 py-2 text-sm outline-none focus:border-primary"
                                  >
                                    <option value="">Level</option>
                                    {experienceLevels.map((level) => (
                                      <option key={level.value} value={level.value}>
                                        {level.label}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTool(tool.name)}
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
