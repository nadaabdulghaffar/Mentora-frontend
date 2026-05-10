import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ProgramCard from "../components/ProgramCard";
import Layout from "../shared/components/Layout";

type ExploreTab = "mentors" | "programs" | "communities" | "roadmaps";

interface ExploreItem {
  id: string;
  tab: ExploreTab;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  phases?: string;
  author?: {
    avatar: string;
    name: string;
  };
}

const exploreItems: ExploreItem[] = [
  {
    id: "mentor-1",
    tab: "mentors",
    title: "Elena Rodriguez",
    description: "Senior Product Designer at Meta focused on UX research and systems thinking.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80",
    tag: "UX RESEARCH",
    phases: "128 REVIEWS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Elena",
      name: "Senior Product Designer",
    },
  },
  {
    id: "mentor-2",
    tab: "mentors",
    title: "Amelia Shepherd",
    description: "Lead Designer at Klaviyo helping creators turn ideas into clear product journeys.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80",
    tag: "ACCESSIBILITY",
    phases: "314 RATINGS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Amelia",
      name: "Lead Designer",
    },
  },
  {
    id: "program-1",
    tab: "programs",
    title: "UX Research Fundamentals",
    description: "Master the art of user research with industry experts from top tech companies.",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",
    tag: "DESIGN",
    phases: "8 PHASES",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Moraa",
      name: "Moraa Zaki",
    },
  },
  {
    id: "program-2",
    tab: "programs",
    title: "Frontend Accelerator",
    description: "A practical mentorship track for React, TypeScript, and production UI delivery.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
    tag: "DEVELOPMENT",
    phases: "6 PHASES",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Omar",
      name: "Omar Adel",
    },
  },
  {
    id: "community-1",
    tab: "communities",
    title: "UI/UX Critique Circle",
    description: "Weekly design critiques, portfolio feedback, and practical product thinking sessions.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
    tag: "COMMUNITY",
    phases: "2.3K MEMBERS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Nour",
      name: "Hosted by Nour Team",
    },
  },
  {
    id: "community-2",
    tab: "communities",
    title: "Frontend Builders Hub",
    description: "A community for React developers sharing code reviews, interview prep, and job referrals.",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80",
    tag: "COMMUNITY",
    phases: "1.8K MEMBERS",
    author: {
      avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Yousef",
      name: "Hosted by Yousef",
    },
  },
  {
    id: "roadmap-1",
    tab: "roadmaps",
    title: "Brand Identity Architect",
    description: "Go beyond logos. Learn the psychological and strategic framework of iconic brands.",
    tag: "ROADMAP",
    phases: "5 PHASES",
  },
  {
    id: "roadmap-2",
    tab: "roadmaps",
    title: "Full-Stack Development Path",
    description: "Master the modern stack from React and Node to AWS deployment and CI/CD pipelines.",
    tag: "ROADMAP",
    phases: "9 PHASES",
  },
];

const experienceLevels = ["Junior", "Mid-Level", "Senior"] as const;
const specializationOptions = ["All Fields", "Design", "Frontend", "Backend"] as const;
const DEFAULT_SPECIALIZATION = "All Fields";
const DEFAULT_AVAILABLE_NOW = false;
const DEFAULT_WEEKENDS_ONLY = false;
const DEFAULT_EXPERIENCE_LEVEL = null;

const ExplorePage = () => {
  const [activeTab, setActiveTab] = useState<ExploreTab>("mentors");
  const [query, setQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<(typeof specializationOptions)[number]>(DEFAULT_SPECIALIZATION);
  const [availableNow, setAvailableNow] = useState(DEFAULT_AVAILABLE_NOW);
  const [weekendsOnly, setWeekendsOnly] = useState(DEFAULT_WEEKENDS_ONLY);
  const [selectedExperienceLevel, setSelectedExperienceLevel] = useState<(typeof experienceLevels)[number] | null>(DEFAULT_EXPERIENCE_LEVEL);

  const handleClearFilters = () => {
    setSelectedSpecialization(DEFAULT_SPECIALIZATION);
    setAvailableNow(DEFAULT_AVAILABLE_NOW);
    setWeekendsOnly(DEFAULT_WEEKENDS_ONLY);
    setSelectedExperienceLevel(DEFAULT_EXPERIENCE_LEVEL);
  };

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return exploreItems.filter((item) => {
      if (item.tab !== activeTab) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return `${item.title} ${item.description}`.toLowerCase().includes(normalizedQuery);
    });
  }, [activeTab, query]);

  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">Find your expert guide.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">
            Connect with top mentors and exclusive programs tailored for today&apos;s creators.
          </p>
        </div>

        <div className="mx-auto mt-7 flex w-full max-w-3xl items-center rounded-2xl border border-[#E2E5EE] bg-white px-4 py-2 shadow-sm">
          <Search size={18} className="text-[#A3A9B8]" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search mentors, topics, or resources..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-[#2D3344] outline-none placeholder:text-[#B6BDCC]"
          />
          <button type="button" className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">
            Explore
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-2xl bg-[#F3F4F7] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#222838]">Filters</h2>
              <button type="button" onClick={handleClearFilters} className="text-sm font-medium text-primary">Clear all</button>
            </div>

            <div className="space-y-5 text-sm">
              <div>
                <p className="mb-2 font-medium text-[#262D3F]">Specialization</p>
                <select
                  value={selectedSpecialization}
                  onChange={(event) => setSelectedSpecialization(event.target.value as (typeof specializationOptions)[number])}
                  className="w-full rounded-xl border border-[#DFE3ED] bg-white px-3 py-2.5 text-[#5D657A] outline-none"
                >
                  {specializationOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <p className="mb-2 font-medium text-[#262D3F]">Availability</p>
                <label className="mb-2 flex items-center gap-2 text-[#5D657A]">
                  <input
                    type="checkbox"
                    checked={availableNow}
                    onChange={(event) => setAvailableNow(event.target.checked)}
                    className="h-4 w-4 rounded border-[#C8CEDB]"
                  />
                  Available now
                </label>
                <label className="flex items-center gap-2 text-[#5D657A]">
                  <input
                    type="checkbox"
                    checked={weekendsOnly}
                    onChange={(event) => setWeekendsOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-[#C8CEDB]"
                  />
                  Weekends only
                </label>
              </div>

              <div>
                <p className="mb-2 font-medium text-[#262D3F]">Experience Level</p>
                <div className="flex flex-wrap gap-2">
                  {experienceLevels.map((level) => {
                    const isSelected = selectedExperienceLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setSelectedExperienceLevel(level)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-white text-[#626B81] hover:bg-[#ECEEF3]"
                        }`}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 inline-flex rounded-xl bg-[#ECEEF3] p-1">
              <button
                type="button"
                onClick={() => setActiveTab("mentors")}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "mentors" ? "bg-white text-[#202637] shadow-sm" : "text-[#6A7288]"
                }`}
              >
                Mentors
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("programs")}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "programs" ? "bg-white text-[#202637] shadow-sm" : "text-[#6A7288]"
                }`}
              >
                Programs
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("communities")}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "communities" ? "bg-white text-[#202637] shadow-sm" : "text-[#6A7288]"
                }`}
              >
                Communities
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("roadmaps")}
                className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                  activeTab === "roadmaps" ? "bg-white text-[#202637] shadow-sm" : "text-[#6A7288]"
                }`}
              >
                Roadmaps
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredItems.map((item) => (
                <ProgramCard
                  key={item.id}
                  variant={item.tab === "roadmaps" ? "simple-button" : "dual-buttons"}
                  image={item.image}
                  tag={item.tag}
                  phases={item.phases}
                  title={item.title}
                  description={item.description}
                  author={item.author}
                  primaryButtonText={
                    item.tab === "mentors"
                      ? "See Full Profile"
                      : item.tab === "communities"
                        ? "Join Community"
                        : item.tab === "roadmaps"
                          ? "View Roadmap"
                          : "Apply"
                  }
                  secondaryButtonText={item.tab === "mentors" ? "Message" : item.tab === "communities" ? "Preview" : "Details"}
                  className="h-full"
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="rounded-2xl border border-dashed border-[#D2D8E6] bg-white p-10 text-center text-[#6F778E]">
                No results found for this search. Try another keyword.
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExplorePage;
