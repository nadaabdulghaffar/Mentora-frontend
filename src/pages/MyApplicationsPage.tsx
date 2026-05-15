import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../shared/components/Layout";
import ExtraProgramCard from "../components/ExtraProgramCard";
import CreateProgramModal from "../components/create-program/CreateProgramModal";
import { fetchProgramById } from "../services/programService";
import type { CreateProgramFormData } from "../components/create-program/types";

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

const mentorApplicationsMock: MyApplicationItem[] = [
  {
    id: "1",
    title: "Frontend React Bootcamp",
    description:
      "Teach students modern React, component architecture, hooks, routing and deployment workflows.",
    applicantsCount: 26,
    deadline: "30 Apr 2026",
    status: "Open",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "UI/UX Research Program",
    description:
      "Guide mentees through research methods, usability testing, wireframing and portfolio case studies.",
    applicantsCount: 14,
    deadline: "10 May 2026",
    status: "Closed",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop",
  },
];

const menteeApplicationsMock: MyApplicationItem[] = [
  {
    id: "1",
    title: "Frontend React Bootcamp",
    description:
      "Learn modern React, component architecture, hooks, routing and deployment workflows.",
    status: "Accepted",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "2",
    title: "UI/UX Research Program",
    description:
      "Master research methods, usability testing, wireframing and portfolio case studies.",
    status: "Under Review",
    image:
      "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "3",
    title: "Backend Foundations",
    description:
      "Build strong backend fundamentals with APIs, databases and clean architecture.",
    status: "Rejected",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  },
];

const ManageApplicantsPage = () => {
  const navigate = useNavigate();

  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const local =
          authAPI.getCurrentUser();

        if (local && mounted) {
          setUser(local);
        }

        const res =
          await authAPI.getMe();

        if (
          res.success &&
          res.data &&
          mounted
        ) {
          setUser(res.data);
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
  }, []);

  const mentorName = user
    ? `${user.firstName} ${
        user.lastName ?? ""
      }`
    : "Mentor";

  const userRole = String(user?.role || "").toLowerCase();
  const isMentee = userRole === "mentee";

  const [mentorApplications] =
    useState<MyApplicationItem[]>(mentorApplicationsMock);

  const [menteeApplications, setMenteeApplications] =
    useState<MyApplicationItem[]>(menteeApplicationsMock);

  const applications = isMentee ? menteeApplications : mentorApplications;

  /* =========================
     🔥 NAVIGATION (FIXED)
  ========================= */

  // 🟢 View Application
  const goToApplicationDetails = (id: string) =>
    navigate(`/applications/${id}`, {
      state: {
        mentorName,
        programId: id,
      },
    });

  // 🔵 Manage Applicants
  const goToManageApplicants = (id: string) =>
    navigate(`/applications/${id}/manage`, {
      state: {
        mentorName,
        programId: id,
      },
    });

  const goToClassroom = () =>
    navigate("/classroom");

  const goToProgramView = (id: string) =>
    navigate(`/applications/${id}`);

  const handleCancelApplying = (id: string) => {
    setMenteeApplications((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [editingInitialValues, setEditingInitialValues] = useState<Partial<CreateProgramFormData> | null>(null);

  const openEditModal = async (programId: string) => {
    setEditingProgramId(Number(programId));
    setIsEditOpen(true);

    try {
      const res = await fetchProgramById(Number(programId));
      if (res && res.success && res.data) {
        // Map backend shape to form initial values (best-effort)
        const d = res.data as any;
        const mapped: Partial<CreateProgramFormData> = {
          title: String(d.title ?? ""),
          description: String(d.description ?? ""),
          domainId: Number(d.domainId ?? 0),
          subDomainId: Number(d.subDomainId ?? 0),
          targetLevel: Number(d.targetLevel ?? 0),
          educationLevel: Number(d.educationLevel ?? 0),
          capacity: Number(d.capacity ?? 1),
          duration: String(d.duration ?? ""),
          availability: String(d.availability ?? ""),
          technologies: Array.isArray(d.technologies) ? d.technologies.map((t: any) => ({ technologyId: Number(t.technologyId), requiredExperienceLevel: Number(t.requiredExperienceLevel) })) : [],
          roadmapId: d.roadmapId ?? null,
          questions: Array.isArray(d.questions) ? d.questions.map((q: any) => ({ questionText: String(q.questionText ?? ""), answerType: String(q.answerType ?? "Paragraph"), maxSelections: q.maxSelections ?? null, options: q.options ?? [] })) : [],
          deadline: String(d.deadline ?? ""),
        };

        setEditingInitialValues(mapped);
      }
    } catch (err) {
      console.error("Failed to load program for editing", err);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingProgramId(null);
    setEditingInitialValues(null);
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
        {/* Header */}
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

        {/* Empty */}
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
                  id={item.id} // 🔥 مهم للدروب داون

                  variant={isMentee ? "mentee-application-card" : "mentor-application-card"}
                  title={item.title}
                  description={
                    item.description
                  }
                  image={item.image}
                  applicantsCount={item.applicantsCount}
                  deadline={item.deadline}
                  status={item.status}
                  className="w-full"
                  primaryButtonText={
                    isMentee
                      ? item.status === "Accepted"
                        ? "Join Classroom"
                        : "View Program"
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

                  // 🟢 VIEW (dropdown)
                  onViewApplicants={() => goToApplicationDetails(item.id)}

                  onEdit={() => openEditModal(item.id)}

                  onUnpublish={() =>
                    console.log(
                      "Unpublish",
                      item.id
                    )
                  }

                  onCancelApplying={() =>
                    handleCancelApplying(item.id)
                  }
                />
              )
            )}
          </div>
        )}
        {isEditOpen && (
          <CreateProgramModal isOpen={isEditOpen} onClose={closeEditModal} programId={editingProgramId ?? undefined} initialValues={editingInitialValues} />
        )}
      </div>
    </Layout>
  );
};

export default ManageApplicantsPage;
