import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../shared/components/Layout';
import authAPI from '../../services/authService';
import type { AuthUser } from '../../types/api';
import type { EducationEntry, ProfileEntity } from './types';
import { getProfileForRoute, PROFILE_DEMO_ROUTES, refreshOwnProfile, saveEducationEntries, updateOwnProfile } from './profileService';
import {
  ProfileBanner,
  ProfileTabs,
} from '../../components/profile';
import { MentorOverviewContent } from './sections/MentorOverviewContent';
import { MentorActivityContent } from './sections/MentorActivityContent';
import { MentorReviewsContent } from './sections/MentorReviewsContent';
import { MentorRoadmapsContent } from './sections/MentorRoadmapsContent';
import { MenteeOverviewContent } from './sections/MenteeOverviewContent';
import { MenteeActivityContent } from './sections/MenteeActivityContent';
import { SettingsModal } from './modals/SettingsModal';
import { EditProfileModal } from './modals/EditProfileModal';
import { EditEducationModal } from './modals/EditEducationModal';

type MentorTab = 'overview' | 'activity' | 'reviews' | 'roadmaps';
type MenteeTab = 'overview' | 'activity';

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [viewer, setViewer] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileEntity | null>(null);
  const [mentorTab, setMentorTab] = useState<MentorTab>('overview');
  const [menteeTab, setMenteeTab] = useState<MenteeTab>('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editEducationOpen, setEditEducationOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const me = await authAPI.getMe();

      if (!me.success || !me.data) {
        throw new Error(me.message || 'Unable to load the signed-in user profile.');
      }

      setViewer(me.data);

      const resolvedProfile = await getProfileForRoute(me.data, userId);
      setProfile(resolvedProfile);

      if (!resolvedProfile) {
        setError('Profile not found.');
      }
    } catch (loadError) {
      setViewer(null);
      setProfile(null);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setMentorTab('overview');
    setMenteeTab('overview');
  }, [profile?.userId]);

  const isOwner = useMemo(
    () => !!(viewer && (!userId || userId === viewer.userId)),
    [viewer, userId]
  );
  const isPublicProfile = !isOwner;

  const applyProfilePatch = useCallback((patch: Partial<ProfileEntity>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const handleSaveProfile = useCallback(
    async (updates: { bio?: string; countryCode?: string; profilePictureUrl?: string; linkedInUrl?: string; pastExperience?: string; }) => {
      if (!viewer) {
        return;
      }

      await updateOwnProfile(viewer, updates);
      const refreshed = await refreshOwnProfile();
      if (refreshed) {
        setProfile(refreshed);
      }
    },
    [viewer]
  );

  const handleSaveEducation = useCallback(
    async (educationEntries: EducationEntry[]) => {
      const success = await saveEducationEntries(educationEntries);
      if (success) {
        const refreshed = await refreshOwnProfile();
        if (refreshed) {
          setProfile(refreshed);
        }
      }
    },
    []
  );

  const handleTabChange = useCallback(
    (tab: MentorTab | MenteeTab) => {
      if (!profile) return;
      if (profile.role === 'mentor') {
        setMentorTab(tab as MentorTab);
      } else {
        setMenteeTab(tab as MenteeTab);
      }
    },
    [profile]
  );

  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg rounded-3xl border border-[#E8EBF2] bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#1F2533]">Loading profile</h1>
          <p className="mt-2 text-sm text-[#6B7289]">Fetching the latest profile data from the backend.</p>
        </div>
      </Layout>
    );
  }

  if (!viewer || !profile) {
    return (
      <Layout>
        <div className="mx-auto max-w-lg rounded-3xl border border-[#E8EBF2] bg-white p-10 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#1F2533]">{error ? 'Profile error' : 'Profile not found'}</h1>
          <p className="mt-2 text-sm text-[#6B7289]">
            {error || 'This user does not exist or is not visible.'}
          </p>
          <p className="mt-4 text-xs text-[#9CA3B8]">
            Try demo public URLs:{' '}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => navigate(`/profile/${PROFILE_DEMO_ROUTES.publicMentor}`)}
            >
              mentor
            </button>
            {' · '}
            <button
              type="button"
              className="text-primary underline"
              onClick={() => navigate(`/profile/${PROFILE_DEMO_ROUTES.publicMentee}`)}
            >
              mentee
            </button>
          </p>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white"
          >
            Back to my profile
          </button>
        </div>
      </Layout>
    );
  }

  const showMentorStats = false;
  const activeTab = profile.role === 'mentor' ? mentorTab : menteeTab;
  const mainGridClass = showMentorStats ? 'lg:grid-cols-[1fr_300px]' : '';

  return (
    <Layout>
      <div className="space-y-6 pb-12">
        <ProfileBanner
          profile={profile}
          isOwner={isOwner}
          onEdit={() => setEditProfileOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onFollow={() => undefined}
          onMessage={() => navigate('/messages')}
          onReport={() => undefined}
        />

        {/* Public-profile notice removed per request */}

        <ProfileTabs role={profile.role} active={activeTab} onChange={handleTabChange} />

        <div className={`grid gap-6 ${mainGridClass}`}>
          <div>
            {profile.role === 'mentor' ? (
              <>
                {mentorTab === 'overview' ? (
                  <MentorOverviewContent
                    profile={profile}
                    isOwner={isOwner}
                    onEditBio={() => setEditProfileOpen(true)}
                    onEditEducation={() => setEditEducationOpen(true)}
                  />
                ) : null}
                {mentorTab === 'activity' ? <MentorActivityContent profile={profile} /> : null}
                {mentorTab === 'reviews' ? <MentorReviewsContent profile={profile} /> : null}
                {mentorTab === 'roadmaps' ? <MentorRoadmapsContent profile={profile} /> : null}
              </>
            ) : (
              <>
                {menteeTab === 'overview' ? (
                  <MenteeOverviewContent
                    profile={profile}
                    isOwner={isOwner}
                    onEditBio={() => setEditProfileOpen(true)}
                    onEditEducation={() => setEditEducationOpen(true)}
                    onAiCta={() => navigate('/search-mentorship')}
                  />
                ) : null}
                {menteeTab === 'activity' ? (
                  <MenteeActivityContent
                    profile={profile}
                    isOwner={isOwner}
                    onAiCta={() => navigate('/search-mentorship')}
                  />
                ) : null}
              </>
            )}
          </div>

          {null}
        </div>

      </div>

      {isOwner ? (
        <>
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            initialEmail={profile.email}
            onSave={({ email }) => applyProfilePatch({ email })}
          />

          <EditProfileModal
            isOpen={editProfileOpen}
            onClose={() => setEditProfileOpen(false)}
            profile={profile}
            onSave={handleSaveProfile}
          />

          <EditEducationModal
            isOpen={editEducationOpen}
            onClose={() => setEditEducationOpen(false)}
            education={profile.education}
            onSave={handleSaveEducation}
          />
        </>
      ) : null}
    </Layout>
  );
};

export default ProfilePage;
