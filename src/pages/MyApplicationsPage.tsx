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
  deleteProgram,
  getMyApplications,
  withdrawApplication,
} from "../services/programService";

import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";
import { toast } from "react-hot-toast";
import ConfirmationModal from "../components/modals/ConfirmationModal";

type MyApplicationItem = {
  id: string;
  programId?: number;
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

const normalizeMenteeStatus = (
  raw?: string
): "Accepted" | "Under Review" | "Rejected" => {
  const normalized = String(raw || "").toLowerCase();
  if (normalized === "accepted") return "Accepted";
  if (normalized === "rejected") return "Rejected";
  return "Under Review";
};



const ManageApplicantsPage = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mentorApplications, setMentorApplications] = useState<MyApplicationItem[]>([]);
  const [menteeApplications, setMenteeApplications] = useState<MyApplicationItem[]>([]);
  const [pageAlert, setPageAlert] = useState<PageAlert | null>(null);
const [isEditOpen, setIsEditOpen] = useState(false);
const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
const [editingInitialValues, setEditingInitialValues] =
  useState<Partial<CreateProgramFormData> | null>(null);

const [editLoading, setEditLoading] = useState(false);
const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
const [programToDelete, setProgramToDelete] = useState<string | null>(null);

const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
const [isWithdrawing, setIsWithdrawing] = useState(false);


const resolveImageUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;

  const apiBase = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5069/api"
  ).replace(/\/api\/?$/, "");

  return url.startsWith("/")
    ? `${apiBase}${url}`
    : `${apiBase}/${url}`;
};

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

const refreshApplications = async (mounted = true) => {
  const local = authAPI.getCurrentUser();

  if (local && mounted) {
    setUser(local);
  }

  const res = await authAPI.getMe();

  if (!(res.success && res.data && mounted)) {
    return;
  }

  setUser(res.data);

  const role = String(res.data.role).toLowerCase();

  if (role === "mentee") {
    const appsRes = await getMyApplications(1, 100);
    const items = appsRes?.data?.items ?? [];

    const mapped = items.map((a: any) => ({
      id: String(a.applicationId ?? a.programId ?? Math.random()),
      programId: a.programId != null ? Number(a.programId) : undefined,
      title: String(a.programTitle ?? "Untitled Program"),
      description: String(a.programDescription ?? ""),
      image: resolveImageUrl(a.programImageUrl),
      status: normalizeMenteeStatus(a.status),
    })) as MyApplicationItem[];

    setMenteeApplications(mapped);
    return;
  }

  if (role === "mentor") {
    await loadMentorPrograms();
  }
};

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        await refreshApplications(mounted);
      } catch (error) {
        console.error(error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    const handleProgramsUpdated = () => {
      if (!mounted) {
        return;
      }

      void refreshApplications(mounted);
    };

    window.addEventListener("mentora:programs-updated", handleProgramsUpdated);

    return () => {
      mounted = false;
      window.removeEventListener("mentora:programs-updated", handleProgramsUpdated);
    };
  }, [loadMentorPrograms]);

const mentorName = user
  ? `${user.firstName} ${user.lastName ?? ""}`
  : "Mentor";

const userRole = String(user?.role || "").toLowerCase();
const isMentee = userRole === "mentee";

const applications = isMentee
  ? menteeApplications
  : mentorApplications;

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

  const goToClassroom = (programId: string) =>
    navigate(`/classroom/${programId}`);

  const goToProgramView = (id: string) => navigate(`/applications/${id}`);

  const handleCancelApplying = async (id: string): Promise<boolean> => {
    const target = menteeApplications.find((item) => item.id === id);
    if (!target?.programId) {
      toast.error("Program details are not available yet. Please refresh or restart backend.");
      return false;
    }

    try {
      await withdrawApplication(target.programId);
      setMenteeApplications((current) =>
        current.filter((item) => item.id !== id)
      );
      toast.success("withdawr succefully");
      return true;
    } catch (error) {
      console.error("Failed to withdraw application", error);
      toast.error("Could not withdraw application");
      return false;
    }
  };

  const handleConfirmWithdraw = async () => {
    if (!withdrawTargetId || isWithdrawing) return;

    setIsWithdrawing(true);
    const ok = await handleCancelApplying(withdrawTargetId);
    setIsWithdrawing(false);

    if (ok) {
      setWithdrawTargetId(null);
    }
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
        mapProgramResponseToFormData(
          res.data as Record<string, unknown>
        )
      );
    } else {
      setPageAlert({
        type: "error",
        message:
          res?.message ||
          "Could not load program details for editing.",
      });

      setIsEditOpen(false);
      setEditingProgramId(null);
    }
  } catch (err) {
    console.error(err);

    setPageAlert({
      type: "error",
      message:
        "Could not load program details for editing.",
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
  setEditLoading(false);
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

  const handleDeleteProgram = async (programId: string) => {
    setActionLoadingId(programId);
    setProgramToDelete(null);

    try {
      const res = await deleteProgram(Number(programId));

      if (res?.success) {
        toast.success(res.message || "Program deleted successfully.");
        setMentorApplications((prev) =>
          prev.filter((item) => item.id !== programId)
        );
      } else {
        toast.error(res?.message || "Could not delete program.");
      }
    } catch (err: any) {
      console.error("Failed to delete program", err);
      toast.error(
        err?.response?.data?.message || err?.response?.data?.errors?.[0] || err?.message || "Could not delete program."
      );
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
              {applications.map(
              (item) => (
                <ExtraProgramCard
                  key={item.id}
                  

                  variant={isMentee ? "mentee-application-card" : "mentor-application-card"}
                  title={item.title}
                  description={
                    item.description
                  }
                  image={item.image}
                  applicantsCount={item.applicantsCount}
deadline={formatDeadline(item.deadline)}
                  status={item.status}
                  className="w-full"
primaryButtonText={
  isMentee
    ? "View Details"
    : actionLoadingId === item.id
      ? "Working…"
      : "Manage Applicants"
}

                  secondaryButtonText={
                    isMentee
                      ? ""
                      : "Details"
                  }

                  onPrimaryClick={() => {
                    if (isMentee) {
                      if (!item.programId) {
                        toast.error("Program details are not available yet. Please refresh or restart backend.");
                        return;
                      }
                      goToProgramView(String(item.programId));
                    } else {
                      goToManageApplicants(item.id);
                    }
                  }}

                  onSecondaryClick={() => {
                    if (!isMentee) {
                      goToApplicationDetails(item.id);
                      return;
                    }

                    if (item.status === "Accepted") {
                      if (!item.programId) {
                        toast.error("Program details are not available yet. Please refresh or restart backend.");
                        return;
                      }
                      goToProgramView(String(item.programId));
                      return;
                    }

                    setWithdrawTargetId(item.id);
                  }}

                  // 🟢 VIEW (dropdown)
                  onViewApplicants={() => goToApplicationDetails(item.id)}

                  onEdit={item.status === "Closed" || isMentee ? undefined : () => openEditModal(item.id)}

                  onDelete={item.status === "Closed" || isMentee ? undefined : () => setProgramToDelete(item.id)}

                  onCancelApplying={() => {
                    void handleCancelApplying(item.id);
                  }}
                />
              )
            )}
          </div>
        )}

{isEditOpen && (
  <CreateProgramModal
    isOpen={isEditOpen}
    onClose={closeEditModal}
    programId={editingProgramId ?? undefined}
    initialValues={editingInitialValues}
    isInitialLoading={editLoading}  
    onSuccess={handleEditSuccess}

/>
)}

{isMentee && withdrawTargetId && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <h3 className="text-xl font-semibold text-[#1F2432']">
        Confirm Withdraw
      </h3>

      <p className="mt-3 text-sm text-[#5D6A85]">
        Are you sure you want to cancel apply for this program?
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setWithdrawTargetId(null)}
          disabled={isWithdrawing}
          className="h-10 rounded-xl border border-[#C4CAD7] px-4 text-sm font-semibold text-[#2E3547] hover:bg-[#F5F7FB] disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleConfirmWithdraw}
          disabled={isWithdrawing}
          className="h-10 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {isWithdrawing ? "Withdrawing..." : "Yes, Withdraw"}
        </button>
      </div>
    </div>
  </div>
)}

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
      </div>
    </Layout>
  );
};

export default ManageApplicantsPage;
