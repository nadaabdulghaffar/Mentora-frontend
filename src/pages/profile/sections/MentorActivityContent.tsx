import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExtraProgramCard from '../../../components/ExtraProgramCard';
import ProgramCard from '../../../components/ProgramCard';
import CreateProgramModal from '../../../components/create-program/CreateProgramModal';
import type { CreateProgramFormData } from '../../../components/create-program/types';
import { ActivityScrollSection } from '../../../components/profile/ActivityScrollSection';
import RoadmapCard from '../../../components/roadmap-builder/roadmap/RoadmapCard';
import { notifySuccess, notifyError } from '../../../utils/toast';
import ConfirmationModal from '../../../components/modals/ConfirmationModal';
import type { AuthUser } from '../../../types/api';
import type { RoadmapListItem } from '../../../types/roadmap';
import {
  fetchProgramById,
  getMyPublishedPrograms,
  getPublishedProgramsByMentorProfile,
  getProgramView,
  mapProgramResponseToFormData,
  deleteProgram,
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

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deletingRoadmapId, setDeletingRoadmapId] = useState<number | null>(null);

  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [roadmapToDelete, setRoadmapToDelete] = useState<number | null>(null);

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
        notifyError(res?.message || 'Could not load program details for editing.');
        setIsEditOpen(false);
        setEditingProgramId(null);
      }
    } catch (err) {
      console.error(err);
      notifyError('Could not load program details for editing.');
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
    notifySuccess(message || 'Program updated successfully.');

    if (updatedProgram) {
      const patch = mapPublishedProgramToMentorApplication(updatedProgram);
      setOwnerPrograms((prev) =>
        prev.map((item) => (item.id === patch.id ? { ...item, ...patch } : item))
      );
      return;
    }

    await loadPrograms();
  };

  const handleDeleteProgram = async (programId: string) => {
    setProgramToDelete(null);

    setActionLoadingId(programId);
    try {
      const res = await deleteProgram(Number(programId));
      if (res?.success) {
        notifySuccess(res.message || 'Program deleted successfully.');
        setOwnerPrograms((prev) => prev.filter((item) => item.id !== programId));
        window.dispatchEvent(new Event("mentora:programs-updated"));
      } else {
        notifyError(res?.message || 'Could not delete program.');
      }
    } catch (err) {
      console.error(err);
      notifyError(extractErrorMessage(err));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteRoadmap = async (roadmapId: number) => {
    setRoadmapToDelete(null);
    setDeletingRoadmapId(roadmapId);
    try {
      await deleteRoadmap(roadmapId);
      notifySuccess('Roadmap deleted successfully.');
      setRoadmaps((prev) => prev.filter((r) => r.roadmapId !== roadmapId));
    } catch (error) {
      console.error(extractErrorMessage(error));
      notifyError(extractErrorMessage(error));
    } finally {
      setDeletingRoadmapId(null);
    }
  };

  const programsEmpty = isOwner ? ownerPrograms.length === 0 : visitorPrograms.length === 0;

  return (
    <div className="w-full min-w-0 space-y-6">


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
                <div key={item.id} className="w-[320px] shrink-0 snap-start md:w-[340px] flex">
                  <ExtraProgramCard
                    variant="mentor-profile-program-card"
                    title={item.title}
                    description={item.description}
                    image={item.image}
                    tag={item.tag}
                    subDomains={item.subDomains}
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
                    onDelete={isDeadlinePassed ? undefined : () => setProgramToDelete(item.id)}
                  />
                </div>
              );
            })
          : visitorPrograms.map((item) => {
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
                  primaryButtonText="View Details"
                  className="h-full w-[320px] md:w-[340px]"
                  onPrimaryClick={() => navigate(`/applications/${item.id}`)}
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
                  onDelete={() => setRoadmapToDelete(roadmap.roadmapId)}
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
                  className="h-full w-[320px] md:w-[340px]"
                  onPrimaryClick={() => navigate(`/roadmap/${roadmap.roadmapId}`)}
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

      <ConfirmationModal
        isOpen={!!programToDelete}
        onConfirm={() => {
          if (programToDelete) {
            handleDeleteProgram(programToDelete);
          }
        }}
        onCancel={() => setProgramToDelete(null)}
        title="Delete Program"
        message="Are you sure you want to delete this program?"
        confirmText="Delete Program"
        variant="danger"
        isLoading={!!actionLoadingId}
      />

      <ConfirmationModal
        isOpen={!!roadmapToDelete}
        onConfirm={() => {
          if (roadmapToDelete !== null) {
            handleDeleteRoadmap(roadmapToDelete);
          }
        }}
        onCancel={() => setRoadmapToDelete(null)}
        title="Delete Roadmap?"
        message="Are you sure you want to delete this roadmap? This action cannot be undone."
        confirmText="Delete Roadmap"
        variant="danger"
        isLoading={!!deletingRoadmapId}
      />
    </div>
  );
}
