import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ProgramCard from "../ProgramCard";
import { getMyPublishedPrograms } from "../../services/programService";

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

        if (mounted) {
          setPrograms(recentItems.slice(0, 3));
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
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-[#1F2533] md:text-lg lg:text-xl">
          Your Programs
        </h3>
        <Link to="/my-programs" className="text-sm font-medium text-primary">
          View all
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
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
                variant="progress"
                image={imageUrl}
                tag={p.domainName?.toUpperCase?.() ?? "PROGRAM"}
                title={p.title}
                description={p.description}
                progress={0}
                primaryButtonText="Join classroom"
                onPrimaryClick={() => navigate(`/classroom/${p.programId}`)}
                className="h-full"
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MentorMentorshipProgramsSection;
