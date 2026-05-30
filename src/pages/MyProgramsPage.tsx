import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/Layout";
import ProgramCard from "../components/ProgramCard";
import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";

import {
  getMyPublishedPrograms,
  getMyApplications,
} from "../services/programService";



type MyProgramItem = {
  id: string;
  title: string;
  description: string;
  tag: string;
  phases: string;
  image?: string;
  mentorName?: string;
  mentorAvatar?: string;
  progress?: number;
};


const MyProgramsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<MyProgramItem[]>([]);

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
            const role =
  String(response.data.role).toLowerCase();
  console.log("ROLE =", role);
console.log("USER =", response.data);

if (role === "mentor") {
  const programsRes =
    await getMyPublishedPrograms();

  if (
    programsRes.success &&
    programsRes.data
  ) {
    const mapped =
      programsRes.data.items.map(
        (p: any) => ({
          id: String(p.programId),

          title: p.title,

          description:
            p.description,

          tag:
            p.domainName?.toUpperCase?.() ??
            "PROGRAM",

          phases: "8 Phases",

          image: p.programImageUrl
            ? `http://localhost:5069${p.programImageUrl}`
            : undefined,

          progress: 0,
        })
      );

    if (isMounted) {
      setPrograms(mapped);
    }
  }
} else {
  const appsRes =
    await getMyApplications();
    console.log("APPLICATIONS RESPONSE", appsRes);

  if (
    appsRes.success &&
    appsRes.data
  ) {
    const accepted =
      appsRes.data.items.filter(
        (a: any) =>
          a.status === "Accepted"
      );

    const mapped =
      accepted.map((a: any) => ({
        id: String(a.applicationId),

        title: a.programTitle,

        description:
          a.programDescription,

        tag:
          a.mentorDomain?.toUpperCase?.() ??
          "PROGRAM",

        phases: "8 Phases",

        image: a.programImageUrl
          ? `http://localhost:5069${a.programImageUrl}`
          : undefined,

        mentorName:
          a.mentorName,

        mentorAvatar:
          a.mentorProfilePicture,

        progress: 0,
      }));

    if (isMounted) {
      setPrograms(mapped);
    }
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
  }, [navigate]);

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
          <div className="flex flex-wrap gap-10 md:gap-10">
            {programs.map((program) => (
              <ProgramCard
                key={program.id}
                variant="simple-button"
                tag={program.tag}
                phases={program.phases}
                title={program.title}
                description={program.description}
                progress={program.progress}
                author={
                  !isMentor
                    ? {
                        name: program.mentorName ?? "Mentor",
                        avatar:
                          program.mentorAvatar ??
                          "https://randomuser.me/api/portraits/lego/1.jpg",
                      }
                    : undefined
                }
                primaryButtonText="Join classroom"
                className="w-full max-w-[340px] md:max-w-[360px]"
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
