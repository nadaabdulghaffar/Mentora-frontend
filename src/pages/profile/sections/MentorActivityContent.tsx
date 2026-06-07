import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExtraProgramCard from '../../../components/ExtraProgramCard';
import ProgramCard from '../../../components/ProgramCard';
import CreateProgramModal from '../../../components/create-program/CreateProgramModal';
import type { CreateProgramFormData } from '../../../components/create-program/types';
import { ActivityScrollSection } from '../../../components/profile/ActivityScrollSection';
import RoadmapCard from '../../../components/roadmap-builder/roadmap/RoadmapCard';
import { Alert } from '../../../components/Alert';
import type { AuthUser } from '../../../types/api';
import type { RoadmapListItem } from '../../../types/roadmap';
import {
  fetchProgramById,
  getMyPublishedPrograms,
  getPublishedProgramsByMentorProfile,
  getProgramView,
  mapProgramResponseToFormData,
  unpublishProgram,
} from '../../../services/programService';
import {
  deleteRoadmap,
  extractErrorMessage,
  getMyPublishedRoadmaps,
  getPublishedRoadmapsByMentorProfile,
} from '../../../services/roadmapService';
import { resolveMentorProfileIdForApi } from '../../../utils/mentorProfileId';
import {
  formatRoadmapDuration,
  loadRoadmapDomainNameMaps,
  normalizeRoadmapDetailsList,
  roadmapDetailsToListItem,
} from '../../../utils/roadmapDisplayUtils';
import type { ProfileEntity } from '../types';
import {
  extractApiData,
  extractPagedProgramItems,
  formatDeadline,
  getProgramStatus,
  isApiSuccess,
  mapPublishedProgramToExploreStyle,
  mapPublishedProgramToMentorApplication,
  type ExploreStyleProgramItem,
  type MentorApplicationProgramItem,
} from '../profileActivityMappers';

interface MentorActivityContentProps {
  profile: ProfileEntity;
  isOwner: boolean;
  viewer: AuthUser;
}

type PageAlert = {
  type: 'success' | 'error';
  message: string;
};

export function MentorActivityContent({
  profile,
  isOwner,
  viewer,
}: MentorActivityContentProps) {
  const navigate = useNavigate();

  const mentorProfileId = useMemo(
    () => resolveMentorProfileIdForApi(profile.userId, isOwner),
    [profile.userId, isOwner]
  );

  const [programsLoading, setProgramsLoading] = useState(true);
  const [roadmapsLoading, setRoadmapsLoading] = useState(true);
  const [ownerPrograms, setOwnerPrograms] = useState<MentorApplicationProgramItem[]>([]);
  const [visitorPrograms, setVisitorPrograms] = useState<ExploreStyleProgramItem[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingRoadmapId, setDeletingRoadmapId] = useState<number | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [editingInitialValues, setEditingInitialValues] = useState<Partial<CreateProgramFormData> | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const mentorName =
    profile.displayName ||
    `${viewer.firstName} ${viewer.lastName ?? ''}`.trim() ||
    'Mentor';

  const loadPrograms = useCallback(async () => {
    setProgramsLoading(true);
    try {
      if (isOwner) {
        const programsRes = await getMyPublishedPrograms();
        if (isApiSuccess(programsRes)) {
          const payload = extractApiData(programsRes) ?? programsRes.data;
          const mapped = extractPagedProgramItems(payload).map(
            mapPublishedProgramToMentorApplication
          );
          setOwnerPrograms(mapped);
        } else {
          setOwnerPrograms([]);
        }
      } else {
        const programsRes = await getPublishedProgramsByMentorProfile(mentorProfileId);
        if (isApiSuccess(programsRes)) {
          const payload = extractApiData(programsRes) ?? programsRes.data;
          const rawItems = extractPagedProgramItems(payload);
          const mapped = await Promise.all(
            rawItems.map(async (p) => {
              const programId = Number(p.programId ?? p.ProgramId);
              let isApplied = false;
              if (Number.isFinite(programId) && programId > 0) {
                try {
                  const view = await getProgramView(programId);
                  isApplied = Boolean(view?.isApplied);
                } catch {
                  isApplied = false;
                }
              }
              return mapPublishedProgramToExploreStyle(
                p,
                {
                  name: mentorName,
                  avatar: profile.avatarUrl || undefined,
                },
                isApplied
              );
            })
          );
          setVisitorPrograms(mapped);
        } else {
          setVisitorPrograms([]);
        }
      }
    } catch (error) {
      console.error('Failed to load mentor activity programs', error);
      if (isOwner) setOwnerPrograms([]);
      else setVisitorPrograms([]);
    } finally {
      setProgramsLoading(false);
    }
  }, [isOwner, mentorProfileId, mentorName, profile.avatarUrl]);

  const loadRoadmaps = useCallback(async () => {
    setRoadmapsLoading(true);
    try {
      const rawList = isOwner
        ? await getMyPublishedRoadmaps()
        : await getPublishedRoadmapsByMentorProfile(mentorProfileId);

      const normalized = normalizeRoadmapDetailsList(rawList);
      const maps = await loadRoadmapDomainNameMaps();
      const mapped = normalized.map((r) => roadmapDetailsToListItem(r, maps));
      setRoadmaps(mapped);
    } catch (error) {
      console.error('Failed to load mentor activity roadmaps', error);
      setRoadmaps([]);
    } finally {
      setRoadmapsLoading(false);
    }
  }, [isOwner, mentorProfileId]);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  useEffect(() => {
    void loadRoadmaps();
  }, [loadRoadmaps]);

  const goToApplicationDetails = (id: string) =>
    navigate(`/applications/${id}`, {
      state: { mentorName, programId: id },
    });

  const goToManageApplicants = (id: string) =>
    navigate(`/applications/${id}/manage`, {
      state: { mentorName, programId: id },
    });

  const openEditModal = async (programId: string) => {
    setEditingProgramId(Number(programId));
    setEditingInitialValues(null);
    setIsEditOpen(true);
    setEditLoading(true);

    try {
      const res = await fetchProgramById(Number(programId));
      if (res?.success && res.data) {
        setEditingInitialValues(
          mapProgramResponseToFormData(res.data as Record<string, unknown>)
        );
      } else {
        setPageAlert({
          type: 'error',
          message: res?.message || 'Could not load program details for editing.',
        });
        setIsEditOpen(false);
        setEditingProgramId(null);
      }
    } catch (err) {
      console.error(err);
      setPageAlert({
        type: 'error',
        message: 'Could not load program details for editing.',
      });
      setIsEditOpen(false);
      setEditingProgramId(null);
    } finally {
      setEditLoading(false);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingProgramId(null);
    setEditingInitialValues(null);
  };

  const handleEditSuccess = async (
    message?: string,
    updatedProgram?: Record<string, unknown>
  ) => {
    setPageAlert({
      type: 'success',
      message: message || 'Program updated successfully.',
    });

    if (updatedProgram) {
      const patch = mapPublishedProgramToMentorApplication(updatedProgram);
      setOwnerPrograms((prev) =>
        prev.map((item) => (item.id === patch.id ? { ...item, ...patch } : item))
      );
      return;
    }

    await loadPrograms();
  };

  const handleUnpublish = async (programId: string) => {
    const confirmed = window.confirm(
      'Unpublish this program? It will no longer be visible to mentees, but applications will be kept.'
    );
    if (!confirmed) return;

    setActionLoadingId(programId);
    try {
      const res = await unpublishProgram(Number(programId));
      if (res?.success) {
        setPageAlert({
          type: 'success',
          message: res.message || 'Program unpublished successfully.',
        });
        setOwnerPrograms((prev) => prev.filter((item) => item.id !== programId));
      } else {
        setPageAlert({
          type: 'error',
          message: res?.message || 'Could not unpublish program.',
        });
      }
    } catch (err) {
      console.error(err);
      setPageAlert({
        type: 'error',
        message: 'Could not unpublish program.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: number) => {
    if (!window.confirm('Delete this roadmap? This action cannot be undone.')) {
      return;
    }
    setDeletingRoadmapId(roadmapId);
    try {
      await deleteRoadmap(roadmapId);
      setRoadmaps((prev) => prev.filter((r) => r.roadmapId !== roadmapId));
    } catch (error) {
      console.error(extractErrorMessage(error));
      setPageAlert({
        type: 'error',
        message: extractErrorMessage(error),
      });
    } finally {
      setDeletingRoadmapId(null);
    }
  };

  const programsEmpty = isOwner ? ownerPrograms.length === 0 : visitorPrograms.length === 0;

  return (
    <div className="w-full min-w-0 space-y-6">
      {pageAlert ? (
        <Alert
          type={pageAlert.type}
          message={pageAlert.message}
          onClose={() => setPageAlert(null)}
        />
      ) : null}

      <ActivityScrollSection
        title="Mentorship Programs"
        loading={programsLoading}
        isEmpty={programsEmpty}
        emptyMessage="No published programs yet"
      >
        {isOwner
          ? ownerPrograms.map((item) => {
              const isDeadlinePassed = item.status === 'Closed';
              return (
                <div key={item.id} className="w-[320px] shrink-0 snap-start md:w-[340px]">
                  <ExtraProgramCard
                    variant="mentor-application-card"
                    title={item.title}
                    description={item.description}
                    image={item.image}
                    applicantsCount={item.applicantsCount}
                    deadline={formatDeadline(item.deadline)}
                    status={item.status}
                    className="h-full w-full"
                    primaryButtonText={
                      actionLoadingId === item.id ? 'Working…' : 'Manage Applicants'
                    }
                    onPrimaryClick={() => goToManageApplicants(item.id)}
                    onViewApplicants={() => goToApplicationDetails(item.id)}
                    onEdit={isDeadlinePassed ? undefined : () => openEditModal(item.id)}
                    onUnpublish={isDeadlinePassed ? undefined : () => handleUnpublish(item.id)}
                  />
                </div>
              );
            })
          : visitorPrograms.map((item) => {
              const isClosed = getProgramStatus(item.deadline) === 'Closed';
              return (
              <div key={item.id} className="w-[320px] shrink-0 snap-start md:w-[340px]">
                <ProgramCard
                  variant="dual-buttons"
                  image={item.image}
                  tag={item.tag}
                  phases={item.phases}
                  title={item.title}
                  description={item.description}
                  author={item.author}
                  primaryButtonText={isClosed ? undefined : (item.isApplied ? 'Join classroom' : 'Apply')}
                  secondaryButtonText="Details"
                  className="h-full w-[320px] md:w-[340px]"
                  onPrimaryClick={isClosed ? undefined : () => {
                    if (item.isApplied) {
                      navigate(`/classroom/${item.id}`);
                    } else {
                      navigate(`/applications/${item.id}?apply=1`);
                    }
                  }}
                  onSecondaryClick={() => navigate(`/applications/${item.id}`)}
                />
              </div>
            )})}
      </ActivityScrollSection>

      <ActivityScrollSection
        title="Published Roadmaps"
        loading={roadmapsLoading}
        isEmpty={roadmaps.length === 0}
        emptyMessage="No published roadmaps yet"
      >
        {isOwner
          ? roadmaps.map((roadmap) => (
              <div
                key={roadmap.roadmapId}
                className="w-[320px] shrink-0 snap-start md:w-[360px]"
              >
                <RoadmapCard
                  roadmap={roadmap}
                  onDelete={() => handleDeleteRoadmap(roadmap.roadmapId)}
                  isDeleting={deletingRoadmapId === roadmap.roadmapId}
                />
              </div>
            ))
          : roadmaps.map((roadmap) => (
              <div
                key={roadmap.roadmapId}
                className="w-[320px] shrink-0 snap-start md:w-[340px]"
              >
                <ProgramCard
                  variant="simple-button"
                  hideHeaderImage
                  title={roadmap.title}
                  description={roadmap.description}
                  phases={[
                    roadmap.domainName,
                    roadmap.subDomainName,
                    formatRoadmapDuration(roadmap.duration),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  primaryButtonText="View Roadmap"
                  secondaryButtonText="Details"
                  className="h-full w-[320px] md:w-[340px]"
                  onPrimaryClick={() => navigate(`/roadmap/${roadmap.roadmapId}`)}
                  onSecondaryClick={() => navigate(`/roadmap/${roadmap.roadmapId}`)}
                />
              </div>
            ))}
      </ActivityScrollSection>

      {isEditOpen ? (
        <>
          {editLoading ? (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
              <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
                Loading program details…
              </div>
            </div>
          ) : null}
          {!editLoading && editingInitialValues ? (
            <CreateProgramModal
              isOpen={isEditOpen}
              onClose={closeEditModal}
              programId={editingProgramId ?? undefined}
              initialValues={editingInitialValues}
              onSuccess={handleEditSuccess}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
