import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/Layout";
import ProgramCard from "../components/ProgramCard";
import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";

import {
  getMyPublishedPrograms,
  getMyApplications,
  getProgramView,
} from "../services/programService";
import { classroomService } from "../services/classroomService";



type MyProgramItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
  phases: string;
  subDomainName?: string;
  image?: string;
  mentorName?: string;
  mentorAvatar?: string;
  progress?: number;
};

const apiRoot = (import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(/\/api\/?$/, "");

const resolveImageUrl = (rawUrl?: string | null): string | undefined => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return undefined;
  }

  if (rawUrl.startsWith("http")) {
    return rawUrl;
  }

  return `${apiRoot}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
};


const MyProgramsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<MyProgramItem[]>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const handleUpdate = () => {
      setRefreshCount((c) => c + 1);
    };
    window.addEventListener("mentora:programs-updated", handleUpdate);
    return () => window.removeEventListener("mentora:programs-updated", handleUpdate);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveUser = async () => {
      if (!authAPI.isAuthenticated()) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

const localUser = authAPI.getCurrentUser();

if (localUser && isMounted) {
  setUser(localUser);
}

      try {
        const response = await authAPI.getMe();
        if (response.success && response.data) {
          localStorage.setItem("user", JSON.stringify(response.data));
          if (isMounted) {
            setUser(response.data);
            const role = String(response.data.role).toLowerCase();

if (role === "mentor") {
  const programsRes = await getMyPublishedPrograms();

  if (programsRes.success && programsRes.data) {
    const initialMapped = programsRes.data.items.map((p: any) => {
      const programId = p.programId ?? p.ProgramId;
      if (!programId) console.error("ProgramId is missing in API response for Mentor published programs:", p);
      return {
        id: String(programId),
        title: p.title,
        description: p.description,
        tag: p.domainName?.toUpperCase?.() ?? "PROGRAM",
        phases: p.subDomainName ?? p.SubDomainName ?? p.subdomainName ?? "SUB-DOMAIN",
        subDomainName: p.subDomainName ?? p.SubDomainName ?? p.subdomainName,
        image: resolveImageUrl(p.programImageUrl),
        progress: 0,
      };
    });

    if (isMounted) {
      setPrograms(initialMapped);
      setLoading(false); // Stop loading immediately
    }

    // Lazy load progress
    programsRes.data.items.forEach(async (p: any) => {
      const programId = p.programId ?? p.ProgramId;
      if (programId) {
        try {
          const dashboardRes = await classroomService.getClassroomDashboard(programId);
          if (dashboardRes?.success && dashboardRes.data) {
            const progress = dashboardRes.data.averageRoadmapCompletion || 0;
            if (isMounted) {
              setPrograms((prev) =>
                prev.map((prog) => (prog.id === String(programId) ? { ...prog, progress } : prog))
              );
            }
          }
        } catch {
          // Ignore
        }
      }
    });
  }
} else {
  const appsRes = await getMyApplications();

  if (appsRes.success && appsRes.data) {
    const accepted = appsRes.data.items.filter((a: any) => a.status === "Accepted");

    const initialMapped = accepted.map((a: any) => {
      const programId = Number(a.programId ?? a.ProgramId ?? 0);
      if (!programId || programId <= 0) console.error("ProgramId is missing in API response for Mentee applications:", a);

      const compactDescription = String(a.programDescription ?? "").replace(/\s+/g, " ").trim().slice(0, 110);
      let subDomainName = a.subDomainName ?? a.SubDomainName ?? a.subdomainName;

      return {
        id: String(programId),
        title: a.programTitle,
        description: compactDescription,
        tag: a.mentorDomain?.toUpperCase?.() ?? "PROGRAM",
        phases: subDomainName ?? "SUB-DOMAIN",
        subDomainName,
        image: resolveImageUrl(a.programImageUrl),
        mentorName: a.mentorName,
        mentorAvatar: resolveImageUrl(a.mentorProfilePicture),
        progress: 0,
      };
    });

    if (isMounted) {
      setPrograms(initialMapped);
      setLoading(false); // Stop loading immediately
    }

    // Lazy load progress and program view
    accepted.forEach(async (a: any) => {
      const programId = Number(a.programId ?? a.ProgramId ?? 0);
      if (programId > 0) {
        let updatedSubDomainName;
        let updatedMentorName;
        let updatedMentorAvatar;
        let updatedImage;
        let updatedProgress;

        try {
          const view = await getProgramView(programId);
          updatedSubDomainName = view?.subDomainName;
          updatedMentorName = view?.mentorName;
          updatedMentorAvatar = view?.profilePictureUrl;
          updatedImage = resolveImageUrl(view?.programImageUrl);
        } catch {
          // Ignore
        }

        try {
          const completionRes = await classroomService.getClassroomCompletion(programId);
          if (completionRes?.success && completionRes.data?.students) {
            const mentee = completionRes.data.students.find((s: any) => s.studentId === response.data?.userId);
            if (mentee) {
              updatedProgress = mentee.overallCompletionPercent || 0;
            }
          }
        } catch {
          // Ignore
        }

        if (isMounted && (updatedSubDomainName || updatedMentorName || updatedMentorAvatar || updatedImage || updatedProgress !== undefined)) {
          setPrograms((prev) =>
            prev.map((prog) => {
              if (prog.id === String(programId)) {
                return {
                  ...prog,
                  phases: updatedSubDomainName || prog.phases,
                  subDomainName: updatedSubDomainName || prog.subDomainName,
                  mentorName: updatedMentorName || prog.mentorName,
                  mentorAvatar: updatedMentorAvatar ? resolveImageUrl(updatedMentorAvatar) : prog.mentorAvatar,
                  image: updatedImage || prog.image,
                  progress: updatedProgress !== undefined ? updatedProgress : prog.progress,
                };
              }
              return prog;
            })
          );
        }
      }
    });
  }
}
            setLoading(false);
          }
          return;
        }
      } catch (error) {
        console.error("MyProgramsPage: failed to resolve user", error);
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    resolveUser();

    return () => {
      isMounted = false;
    };
  }, [navigate, refreshCount]);

  const role = user?.role?.toLowerCase();
  const isMentor = role === "mentor";

  const title = "Your Programs";
  const subtitle =
    "Monitor your mentorship requests and program enrollments here. Manage your path to mastery all in one place.";

 


  if (loading) {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-[42px] font-bold leading-tight text-[#1F2432]">{title}</h1>
          <p className="mt-2 max-w-4xl text-xl text-[#5B6474]">{subtitle}</p>
        </div>

        {programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#C8CDD9] bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-[#2A3042]">No programs yet</h2>
            <p className="mt-2 text-[#7B869C]">
              {isMentor
                ? "Once you create programs, they will appear here."
                : "Accepted programs will appear here after your applications are approved."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                variant="simple-button"
                tag={program.tag}
                phases={program.phases}
                image={program.image}
                title={program.title}
                description={program.description}
                progress={program.progress}
                author={
                  !isMentor
                    ? {
                        name: program.mentorName ?? "Mentor",
                        avatar:
                          program.mentorAvatar ?? "",
                      }
                    : undefined
                }
                primaryButtonText="Join classroom"
                className="w-full max-w-none"
                onPrimaryClick={() => {
                navigate(`/classroom/${program.id}`, {
  state: {
    role,
  },
});
                }}
              />
            ))}
          </div>
        )}
      </div>

    </Layout>
  );
};

export default MyProgramsPage;
