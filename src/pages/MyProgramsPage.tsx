import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/Layout";
import ProgramCard from "../components/ProgramCard";
import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";

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

const mentorProgramsMock: MyProgramItem[] = [
  {
    id: "m-1",
    title: "UX Research Fundamentals",
    description: "Master the art of user research with industry experts from top tech companies.",
    tag: "DESIGN",
    phases: "8 Phases",
    progress: 72,
  },
  {
    id: "m-2",
    title: "Business Strategy Fundamentals",
    description: "Master the art of business strategy with industry experts from top tech companies.",
    tag: "BUSINESS",
    phases: "8 Phases",
    progress: 38,
  },
];

const menteeProgramsMock: MyProgramItem[] = [
  {
    id: "t-1",
    title: "UX Research Fundamentals",
    description: "Master the art of user research with industry experts from top tech companies.",
    tag: "DESIGN",
    phases: "8 Phases",
    mentorName: "Mona Zaki",
    mentorAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    progress: 88,
  },
  {
    id: "t-2",
    title: "Business Strategy Fundamentals",
    description: "Master the art of business strategy with industry experts from top tech companies.",
    tag: "BUSINESS",
    phases: "8 Phases",
    mentorName: "Ahmed Samir",
    mentorAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
    progress: 24,
  },
];

const MyProgramsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

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
      if (localUser) {
        if (isMounted) {
          setUser(localUser);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authAPI.getMe();
        if (response.success && response.data) {
          localStorage.setItem("user", JSON.stringify(response.data));
          if (isMounted) {
            setUser(response.data);
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

  // TODO: Replace mock with backend endpoint when available.
  // Mentor expected: GET /api/programs/my-created
  // Mentee expected: GET /api/programs/my-accepted
  const programs = useMemo(() => {
    return isMentor ? mentorProgramsMock : menteeProgramsMock;
  }, [isMentor]);

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
                  navigate('/classroom', {
                    state: {
                      programId: program.id,
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
