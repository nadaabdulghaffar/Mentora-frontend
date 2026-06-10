import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProgramCard from "../ProgramCard";
import { getMyPublishedPrograms } from "../../services/programService";
import { classroomService } from "../../services/classroomService";

const MentorMentorshipProgramsSection = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getMyPublishedPrograms();
        // Expecting envelope with { success, data: { items: ProgramViewDto[] } }
        const items = res?.data?.items ?? [];
        const recentItems = [...items].sort((a: any, b: any) => {
          const aId = Number(a?.programId ?? 0);
          const bId = Number(b?.programId ?? 0);
          return bId - aId;
        });

        const top3 = recentItems.slice(0, 3);
        const mapped = await Promise.all(
          top3.map(async (p: any) => {
            let progress = 0;
            try {
              const dashRes = await classroomService.getClassroomDashboard(p.programId);
              if (dashRes?.success && dashRes.data) {
                progress = dashRes.data.averageRoadmapCompletion || 0;
              }
            } catch {
              // Ignore if no dashboard exists yet
            }
            return { ...p, progress };
          })
        );

        if (mounted) {
          setPrograms(mapped);
        }
      } catch (err: any) {
        console.error("Failed to load mentor programs", err);
        if (mounted) setError("Failed to load programs");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
        <h2 className="text-[22px] font-bold text-[#1F2432]">
          Your Programs
        </h2>
        <Link 
          to="/my-programs" 
          className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-[14px] font-semibold hover:bg-primary/20 transition"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      ) : error ? (
        <div className="py-8 text-center text-sm text-red-600">{error}</div>
      ) : programs.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-600">No programs published yet</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 px-6 pb-6 pt-4 md:px-8 md:pb-8 md:pt-6">
          {programs.map((p: any) => {
            const apiRoot = (import.meta.env.VITE_API_URL ?? 'http://localhost:5069/api').replace(/\/api\/?$/, '');
            const imageUrl = p.programImageUrl
              ? p.programImageUrl.startsWith('http')
                ? p.programImageUrl
                : `${apiRoot}${p.programImageUrl.startsWith('/') ? p.programImageUrl : '/' + p.programImageUrl}`
              : undefined;

            return (
              <ProgramCard
                key={p.programId}
                variant="simple-button"
                image={imageUrl}
                tag={p.domainName?.toUpperCase?.() ?? "PROGRAM"}
                phases={p.subDomainName ?? p.SubDomainName ?? p.subdomainName ?? "SUB-DOMAIN"}
                title={p.title}
                description={p.description}
                progress={p.progress || 0}
                primaryButtonText="Join classroom"
                onPrimaryClick={() => navigate(`/classroom/${p.programId}`)}
                className="h-full w-full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentorMentorshipProgramsSection;
