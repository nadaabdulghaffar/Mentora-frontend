import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../shared/components/Layout";
import ExtraProgramCard from "../components/ExtraProgramCard";
import CreateProgramModal from "../components/create-program/CreateProgramModal";
import { Alert } from "../components/Alert";
import type { CreateProgramFormData } from "../components/create-program/types";
import {
  fetchProgramById,
  getMyPublishedPrograms,
  mapProgramResponseToFormData,
  resolveProgramImageUrl,
  unpublishProgram,
} from "../services/programService";

import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";

type MyApplicationItem = {
  id: string;
  title: string;
  description: string;
  image?: string;
  applicantsCount?: number;
  deadline?: string;
  status: "Open" | "Closed" | "Accepted" | "Under Review" | "Rejected";
};

type PageAlert = {
  type: "success" | "error";
  message: string;
};

const getProgramStatus = (
  deadline?: string
): "Open" | "Closed" => {
  if (!deadline) {
    return "Open";
  }

  const today = new Date();
  const deadlineDate = new Date(deadline);

  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  return deadlineDate >= today ? "Open" : "Closed";
};

const formatDeadline = (deadline?: string) => {
  if (!deadline || deadline.startsWith("0001-01-01")) {
    return "No deadline";
  }

  return new Date(deadline).toLocaleDateString();
};

const mapPublishedProgramToItem = (
  p: Record<string, unknown>
): MyApplicationItem => ({
  id: String(p.programId ?? p.ProgramId),
  title: String(p.title ?? p.Title ?? ""),
  description: String(p.description ?? p.Description ?? ""),
  image: resolveProgramImageUrl(
    String(p.programImageUrl ?? p.ProgramImageUrl ?? "")
  ),
  applicantsCount: 0,
  deadline: (p.deadline ?? p.Deadline) as string | undefined,
  status: getProgramStatus(String(p.deadline ?? p.Deadline ?? "")),
});

const ManageApplicantsPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mentorApplications, setMentorApplications] = useState<MyApplicationItem[]>([]);
  const [menteeApplications, setMenteeApplications] = useState<MyApplicationItem[]>([]);
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [editingInitialValues, setEditingInitialValues] = useState<Partial<CreateProgramFormData> | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const userRole = String(user?.role || "").toLowerCase();
  const isMentee = userRole === "mentee";
  const applications = isMentee ? menteeApplications : mentorApplications;

  const mentorName = user
    ? `${user.firstName} ${user.lastName ?? ""}`
    : "Mentor";

  const loadMentorPrograms = useCallback(async () => {
    const programsRes = await getMyPublishedPrograms();

    if (programsRes.success && programsRes.data) {
      const rawItems =
        programsRes.data.items ??
        programsRes.data.Items ??
        [];
      const mapped = (rawItems as Record<string, unknown>[]).map(
        mapPublishedProgramToItem
      );

      setMentorApplications(mapped);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const local = authAPI.getCurrentUser();

        if (local && mounted) {
          setUser(local);
        }

        const res = await authAPI.getMe();

        if (res.success && res.data && mounted) {
          setUser(res.data);

          if (String(res.data.role).toLowerCase() === "mentor") {
            await loadMentorPrograms();
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [loadMentorPrograms]);

  const goToApplicationDetails = (id: string) =>
    navigate(`/applications/${id}`, {
      state: {
        mentorName,
        programId: id,
      },
    });

  const goToManageApplicants = (id: string) =>
    navigate(`/applications/${id}/manage`, {
      state: {
        mentorName,
        programId: id,
      },
    });

  const goToClassroom = () => navigate("/classroom");

  const goToProgramView = (id: string) => navigate(`/applications/${id}`);

  const handleCancelApplying = (id: string) => {
    setMenteeApplications((current) => current.filter((item) => item.id !== id));
  };

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
          type: "error",
          message: res?.message || "Could not load program details for editing.",
        });
        setIsEditOpen(false);
        setEditingProgramId(null);
      }
    } catch (err) {
      console.error("Failed to load program for editing", err);
      setPageAlert({
        type: "error",
        message: "Could not load program details for editing.",
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
      type: "success",
      message: message || "Program updated successfully.",
    });

    if (updatedProgram) {
      const patch = mapPublishedProgramToItem(updatedProgram);
      setMentorApplications((prev) =>
        prev.map((item) => (item.id === patch.id ? { ...item, ...patch } : item))
      );
      return;
    }

    await loadMentorPrograms();
  };

  const handleUnpublish = async (programId: string) => {
    const confirmed = window.confirm(
      "Unpublish this program? It will no longer be visible to mentees, but applications will be kept."
    );

    if (!confirmed) return;

    setActionLoadingId(programId);

    try {
      const res = await unpublishProgram(Number(programId));

      if (res?.success) {
        setPageAlert({
          type: "success",
          message: res.message || "Program unpublished successfully.",
        });
        setMentorApplications((prev) =>
          prev.filter((item) => item.id !== programId)
        );
      } else {
        setPageAlert({
          type: "error",
          message: res?.message || "Could not unpublish program.",
        });
      }
    } catch (err) {
      console.error("Failed to unpublish program", err);
      setPageAlert({
        type: "error",
        message: "Could not unpublish program.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">
            My Applications
          </h1>

          <p className="mt-2 max-w-4xl text-xl text-[#5B6474]">
            {isMentee
              ? "Track your submitted applications and check their latest status."
              : "Review and manage all applications submitted to your programs."}
          </p>
        </div>

        {pageAlert && (
          <Alert
            type={pageAlert.type}
            message={pageAlert.message}
            onClose={() => setPageAlert(null)}
          />
        )}

        {applications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C8CDD9] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-[#2A3042]">
              No applications yet
            </h2>

            <p className="mt-2 text-[#7B869C]">
              {isMentee
                ? "Your submitted applications will appear here."
                : "Once students apply to your programs, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start max-w-full">
            {applications.map((item) => (
              <ExtraProgramCard
                key={item.id}
                variant={isMentee ? "mentee-application-card" : "mentor-application-card"}
                title={item.title}
                description={item.description}
                image={item.image}
                applicantsCount={item.applicantsCount}
                deadline={formatDeadline(item.deadline)}
                status={item.status}
                className="w-full"
                primaryButtonText={
                  isMentee
                    ? item.status === "Accepted"
                      ? "Join Classroom"
                      : "View Program"
                    : actionLoadingId === item.id
                      ? "Working…"
                      : "Manage Applicants"
                }
                onPrimaryClick={() => {
                  if (isMentee) {
                    if (item.status === "Accepted") {
                      goToClassroom();
                    } else {
                      goToProgramView(item.id);
                    }
                  } else {
                    goToManageApplicants(item.id);
                  }
                }}
                onViewApplicants={() => goToApplicationDetails(item.id)}
                onEdit={() => openEditModal(item.id)}
                onUnpublish={() => handleUnpublish(item.id)}
                onCancelApplying={() => handleCancelApplying(item.id)}
              />
            ))}
          </div>
        )}

        {isEditOpen && (
          <>
            {editLoading && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
                <div className="rounded-xl bg-white px-6 py-4 shadow-lg">
                  Loading program details…
                </div>
              </div>
            )}

            {!editLoading && editingInitialValues && (
              <CreateProgramModal
                isOpen={isEditOpen}
                onClose={closeEditModal}
                programId={editingProgramId ?? undefined}
                initialValues={editingInitialValues}
                onSuccess={handleEditSuccess}
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ManageApplicantsPage;
