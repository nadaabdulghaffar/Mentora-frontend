import { Link, useNavigate } from "react-router-dom";
import ProgramCard from "../ProgramCard";

const PROGRAM_IMAGE =
  "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80";

const MentorMentorshipProgramsSection = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-[#1F2533] md:text-lg lg:text-xl">
          Your Programs
        </h3>
        
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {[0, 1, 2].map((i) => (
          <ProgramCard
            key={i}
            variant="progress"
            image={PROGRAM_IMAGE}
            tag="DESIGN"
            title="UX Research Fundamentals"
            description="Master the art of user research with industry experts from top tech companies."
            progress={88}
            primaryButtonText="Join class"
            onPrimaryClick={() => navigate("/classroom")}
            className="h-full"
          />
        ))}
      </div>
    </div>
  );
};

export default MentorMentorshipProgramsSection;
