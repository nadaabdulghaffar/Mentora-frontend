import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../shared/components/Layout';
import authAPI from '../../services/authService';
import type { AuthUser } from '../../types/api';
import type { EducationEntry, ProfileEntity } from './types';
import {
  getProfileForRoute,
  PROFILE_DEMO_ROUTES,
  refreshOwnProfile,
  saveEducationEntries,
  saveMenteeTechnologies,
  saveMentorExpertise,
  saveSocialLinks,
  saveSubDomains,
  updateOwnProfile,
  type OwnProfileUpdatePayload,
} from './profileService';
import {
  ProfileBanner,
  ProfileTabs,
} from '../../components/profile';
import { MentorOverviewContent } from './sections/MentorOverviewContent';
import { MentorActivityContent } from './sections/MentorActivityContent';
import { FeedbackSection } from './feedback';
import { MentorRoadmapsContent } from './sections/MentorRoadmapsContent';
import { MenteeOverviewContent } from './sections/MenteeOverviewContent';
import { MenteeActivityContent } from './sections/MenteeActivityContent';
import { SettingsModal } from './modals/SettingsModal';
import { EditProfileModal } from './modals/EditProfileModal';
import { EditEducationModal } from './modals/EditEducationModal';
import { ProfileToast } from '../../components/profile/ProfileToast';
import { followService } from '../../services/followService';
import {
  isValidUserGuid,
  messagingService,
} from '../../services/messagingService';

type MentorTab = 'overview' | 'activity' | 'reviews' | 'roadmaps';
type MenteeTab = 'overview' | 'activity';

const ProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
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
  const [profileToast, setProfileToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);

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

    if (profile.role === 'mentor' && searchParams.get('tab') === 'reviews') {
      setMentorTab('reviews');
    } else {
      setMentorTab('overview');
    }
    setMenteeTab('overview');
  }, [profile?.userId, searchParams]);

  const isOwner = useMemo(
    () => !!(viewer && (!userId || userId === viewer.userId)),
    [viewer, userId]
  );

  const viewerIsMentee = viewer?.role?.toLowerCase() === 'mentee';
  const profileIsMentor = profile?.role === 'mentor';

  const showFollow = Boolean(
    !isOwner && viewerIsMentee && profileIsMentor && viewer && profile
  );
  const showMessage = Boolean(!isOwner && viewer && profile);

  useEffect(() => {
    if (!showFollow || !profile) {
      setIsFollowing(false);
      return;
    }

    let cancelled = false;

    const loadFollowState = async () => {
      try {
        const [following, count] = await Promise.all([
          followService.isFollowingMentor(profile.userId),
          followService.getFollowerCount(profile.userId),
        ]);

        if (!cancelled) {
          setIsFollowing(following);
          setFollowerCount(count);
        }
      } catch (error) {
        console.error('Failed to load follow state', error);
        if (!cancelled) {
          setIsFollowing(false);
          setFollowerCount(profile.followerCount ?? null);
        }
      }
    };

    void loadFollowState();

    return () => {
      cancelled = true;
    };
  }, [showFollow, profile?.userId, profile?.followerCount]);

  const handleFollowToggle = useCallback(async () => {
    if (!profile || !showFollow) {
      return;
    }

    setFollowLoading(true);
    const mentorId = profile.userId;
    const wasFollowing = isFollowing;

    setIsFollowing(!wasFollowing);
    setFollowerCount((current) => {
      const base = current ?? profile.followerCount ?? 0;
      return wasFollowing ? Math.max(0, base - 1) : base + 1;
    });

    try {
      if (wasFollowing) {
        await followService.unfollowMentor(mentorId);
      } else {
        await followService.followMentor(mentorId);
      }
    } catch (error) {
      console.error('Follow action failed', error);
      setIsFollowing(wasFollowing);
      setFollowerCount((current) => {
        const base = current ?? profile.followerCount ?? 0;
        return wasFollowing ? base + 1 : Math.max(0, base - 1);
      });
      setProfileToast({
        type: 'error',
        message: 'Could not update follow status. Please try again.',
      });
    } finally {
      setFollowLoading(false);
    }
  }, [profile, showFollow, isFollowing]);

  const handleMessage = useCallback(async () => {
    if (!profile || isOwner) {
      return;
    }

    if (!isValidUserGuid(profile.userId)) {
      setProfileToast({
        type: 'error',
        message: 'Unable to start a conversation for this profile.',
      });
      return;
    }

    try {
      setMessageLoading(true);

      const conversation = await messagingService.createOrGetConversation(
        profile.userId
      );

      navigate(`/messages?conversationId=${conversation.conversationId}`, {
        state: {
          conversationId: conversation.conversationId,
          otherUserId: profile.userId,
        },
      });
    } catch (error) {
      console.error('Failed to open conversation', error);
      setProfileToast({
        type: 'error',
        message: 'Could not open conversation. Please try again.',
      });
    } finally {
      setMessageLoading(false);
    }
  }, [profile, isOwner, navigate]);

  const applyProfilePatch = useCallback((patch: Partial<ProfileEntity>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const handleSaveProfile = useCallback(
    async (updates: OwnProfileUpdatePayload) => {
      if (!viewer) {
        return;
      }

      await updateOwnProfile(viewer, updates);

      const viewerRole = viewer.role?.toLowerCase();
      if (viewerRole === 'mentee' && updates.technologyInterests) {
        await saveMenteeTechnologies(updates.technologyInterests);
      } else if (viewerRole === 'mentor' && updates.expertiseTechnologyIds) {
        await saveMentorExpertise(updates.expertiseTechnologyIds);
      }

      if (updates.subDomainIds) {
        await saveSubDomains(updates.subDomainIds);
      }

      if (updates.socialLinks) {
        await saveSocialLinks(viewer, updates.socialLinks);
      }

      const refreshed = await refreshOwnProfile();
      if (refreshed) {
        setProfile(refreshed);
      }

      setProfileToast({
        type: 'success',
        message: 'Your profile was updated successfully.',
      });
    },
    [viewer]
  );

  const handleSaveEducation = useCallback(
    async (educationEntries: EducationEntry[]) => {
      const success = await saveEducationEntries(educationEntries);
      if (!success) {
        throw new Error('Failed to save education. Please try again.');
      }

      const refreshed = await refreshOwnProfile();
      if (refreshed) {
        setProfile(refreshed);
      }

      setProfileToast({
        type: 'success',
        message: 'Your education was updated successfully.',
      });
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
          profile={
            followerCount != null
              ? { ...profile, followerCount }
              : profile
          }
          isOwner={isOwner}
          showFollow={showFollow}
          showMessage={showMessage}
          isFollowing={isFollowing}
          followLoading={followLoading}
          messageLoading={messageLoading}
          onEdit={() => setEditProfileOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onFollow={() => void handleFollowToggle()}
          onMessage={() => void handleMessage()}
          onReport={() => undefined}
        />

        {/* Public-profile notice removed per request */}

        <ProfileTabs role={profile.role} active={activeTab} onChange={handleTabChange} />

        <div className={`grid min-w-0 gap-6 ${mainGridClass}`}>
          <div className="min-w-0">
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
                {mentorTab === 'activity' ? (
                  <MentorActivityContent
                    profile={profile}
                    isOwner={isOwner}
                    viewer={viewer}
                  />
                ) : null}
                {mentorTab === 'reviews' ? (
                  <FeedbackSection mentorUserId={profile.userId} />
                ) : null}
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
                  <MenteeActivityContent isOwner={isOwner} />
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

          {profileToast ? (
            <ProfileToast
              type={profileToast.type}
              message={profileToast.message}
              onClose={() => setProfileToast(null)}
            />
          ) : null}
        </>
      ) : null}
    </Layout>
  );
};

export default ProfilePage;
