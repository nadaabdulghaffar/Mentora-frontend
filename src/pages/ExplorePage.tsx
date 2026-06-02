import React, { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ProgramCard from "../components/ProgramCard";
import { exploreRoadmaps } from "../services/exploreRoadmapService";
import Layout from "../shared/components/Layout";
import { getProgramView } from "../services/programService";
import { exploreCommunities, joinCommunity, leaveCommunity } from "../services/communityService";
import { mapCommunitiesResponse } from "./community/mappers/community.mapper";
import { exploreMentors, explorePrograms } from "../services/exploreService";
import { getRoadmapView } from "../services/roadmapService";
import {
  exploreRoadmapToListItem,
  formatRoadmapExplorePhases,
  loadRoadmapDomainNameMaps,
} from "../utils/roadmapDisplayUtils";

type ExploreTab = "mentors" | "programs" | "communities" | "roadmaps";

interface ExploreItem {
  id: string;
  tab: ExploreTab;
  title: string;
  description: string;
  image?: string;
  tag?: string;
  phases?: string;
  isJoined?: boolean;
  isApplied?: boolean;
  author?: { avatar: string; name: string };
}

const EXPLORE_TAB_VALUES: ExploreTab[] = ["mentors", "programs", "communities", "roadmaps"];

function parseTabFromSearch(value: string | null): ExploreTab | null {
  if (!value) return null;
  return EXPLORE_TAB_VALUES.includes(value as ExploreTab) ? (value as ExploreTab) : null;
}

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ExploreTab>(() => parseTabFromSearch(searchParams.get("tab")) ?? "mentors");
  const [query, setQuery] = useState(() => searchParams.get("q")?.trim() ?? "");

  const [communityItems, setCommunityItems] = useState<ExploreItem[]>([]);
  const [mentorItems, setMentorItems] = useState<ExploreItem[]>([]);
  const [programItems, setProgramItems] = useState<ExploreItem[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<ExploreItem[]>([]);
  const [mentorLoading, setMentorLoading] = useState(false);
  const [programLoading, setProgramLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState(false);

  // track previous tab to detect initial activation of the roadmaps tab
  const prevTabRef = useRef<ExploreTab | null>(null);

  // debounce
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const parsed = parseTabFromSearch(searchParams.get("tab"));
    if (parsed) setActiveTab(parsed);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab !== "communities") return;

    let mounted = true;
    const load = async () => {
      try {
        const resp = await exploreCommunities(debouncedQuery);
        const mapped = mapCommunitiesResponse(resp).map((c) => ({
          id: c.id,
          tab: "communities" as const,
          title: c.name,
          description: c.description,
          image: c.cover,
          tag: "COMMUNITY",
          phases: `${c.memberCount.toLocaleString()} MEMBERS`,
          isJoined: c.isJoined,
          author: { avatar: c.avatar, name: "Community" },
        }));

        if (mounted) setCommunityItems(mapped);
      } catch (err) {
        console.error("Failed to load communities", err);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    if (activeTab !== "mentors") return;

    let mounted = true;
    const load = async () => {
      setMentorLoading(true);
      try {
        const res = await exploreMentors(debouncedQuery);
        const mapped = res.map((m) => ({
          id: String(m.mentorId),
          tab: "mentors" as const,
          title: m.fullName,
          description: m.bio ?? "",
          image: m.profileImageUrl ? (m.profileImageUrl.startsWith("http") ? m.profileImageUrl : (import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(/\/api\/?$/, "") + (m.profileImageUrl.startsWith("/") ? m.profileImageUrl : "/" + m.profileImageUrl)) : undefined,
          tag: m.domainName?.toUpperCase?.() ?? "MENTOR",
          phases: m.rating ? `${Number(m.rating).toFixed(1)} ★` : undefined,
        }));

        if (mounted) setMentorItems(mapped);
      } catch (err) {
        console.error("Failed to load mentors", err);
      } finally {
        if (mounted) setMentorLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    if (activeTab !== "programs") return;

    let mounted = true;
    const load = async () => {
      setProgramLoading(true);
      try {
        const res = await explorePrograms(debouncedQuery);
        const apiRoot = (import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(/\/api\/?$/, "");
        const defaultImage = "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80";

        const mapped = await Promise.all(
          res.map(async (p) => {
            let isApplied = false;

            try {
              const view = await getProgramView(p.id);
              isApplied = Boolean(view.isApplied);
            } catch (err) {
              console.error(`Failed to load program state for ${p.id}`, err);
            }

            return {
              id: String(p.id),
              tab: "programs" as const,
              title: p.title,
              description: p.description,
              image: defaultImage,
              tag: p.domainName?.toUpperCase?.() ?? "PROGRAM",
              phases: p.subDomainName ? p.subDomainName.toUpperCase() : p.mentorName,
              isApplied,
              author: {
                avatar: p.mentorProfileImageUrl
                  ? (p.mentorProfileImageUrl.startsWith("http")
                      ? p.mentorProfileImageUrl
                      : `${apiRoot}${p.mentorProfileImageUrl.startsWith("/") ? p.mentorProfileImageUrl : "/" + p.mentorProfileImageUrl}`)
                  : `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(p.mentorName)}`,
                name: p.mentorName,
              },
            };
          })
        );

        if (mounted) setProgramItems(mapped);
      } catch (err) {
        console.error("Failed to load programs", err);
      } finally {
        if (mounted) setProgramLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [activeTab, debouncedQuery]);

  useEffect(() => {
    if (activeTab !== "roadmaps") return;
    // If the user *just switched* to the roadmaps tab, load all roadmaps
    // (ignore current search). Subsequent changes to `debouncedQuery` will
    // re-run this effect and filter normally.
    const prevTab = prevTabRef.current;
    let mounted = true;
    const load = async () => {
      setRoadmapLoading(true);
      try {
        const searchToUse = prevTab !== 'roadmaps' ? '' : debouncedQuery;
        const res = await exploreRoadmaps(searchToUse);
        const maps = await loadRoadmapDomainNameMaps();

        const apiRoot = (import.meta.env.VITE_API_URL ?? "http://localhost:5069/api").replace(/\/api\/?$/, "");

        const mapped = await Promise.all(
          res.map(async (r) => {
            let mentorName = "";
            let mentorAvatar: string | undefined = undefined;
            try {
              const view = await getRoadmapView(r.roadmapId);
              mentorName = view?.mentorName ?? "";
              mentorAvatar = view?.profilePictureUrl
                ? (view.profilePictureUrl.startsWith("http")
                    ? view.profilePictureUrl
                    : `${apiRoot}${view.profilePictureUrl.startsWith("/") ? view.profilePictureUrl : "/" + view.profilePictureUrl}`)
                : undefined;
            } catch (err) {
              // ignore per-item errors
            }

            const listItem = exploreRoadmapToListItem(r, maps);

            return {
              id: String(r.roadmapId),
              tab: "roadmaps" as const,
              title: r.title,
              description: r.description,
              image: mentorAvatar,
              tag: undefined,
              phases: formatRoadmapExplorePhases(listItem),
              author: { avatar: mentorAvatar ?? `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(mentorName || r.title)}`, name: mentorName || "Unknown" },
            };
          })
        );

        if (mounted) setRoadmapItems(mapped);
      } catch (err) {
        console.error("Failed to load roadmaps", err);
      } finally {
        if (mounted) setRoadmapLoading(false);
        prevTabRef.current = 'roadmaps';
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [activeTab, debouncedQuery]);


  const handleTabChange = (tab: ExploreTab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    }, { replace: true });
  };

  const handleClearFilters = () => {
    setQuery("");
  };

  const exploreItemsSource = useMemo(() => {
    return activeTab === "communities"
      ? communityItems
      : activeTab === "mentors"
      ? mentorItems
      : activeTab === "programs"
      ? programItems
      : activeTab === "roadmaps"
      ? roadmapItems
      : [];
  }, [activeTab, communityItems, mentorItems, programItems, roadmapItems]);
  

  const filteredItems = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return exploreItemsSource.filter((it) => {
      if (q.length === 0) return true;
      return `${it.title} ${it.description}`.toLowerCase().includes(q);
    });
  }, [exploreItemsSource, debouncedQuery]);

  return (
    <Layout>
      <section className="w-full pb-8 pt-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#191D2B] md:text-5xl">Find your expert guide.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-[#6D7386] md:text-base">Connect with top mentors and exclusive programs tailored for today's creators.</p>
        </div>

        <div className="mx-auto mt-7 flex w-full max-w-3xl items-center rounded-2xl border border-[#E2E5EE] bg-white px-4 py-2 shadow-sm">
          <Search size={18} className="text-[#A3A9B8]" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search mentors, topics, or resources..." className="flex-1 bg-transparent px-3 py-2 text-sm text-[#2D3344] outline-none placeholder:text-[#B6BDCC]" />
          <button type="button" className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:bg-primary-dark">Explore</button>
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
                <select className="w-full rounded-xl border border-[#DFE3ED] bg-white px-3 py-2.5 text-[#5D657A] outline-none">
                  <option>All Fields</option>
                </select>
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-5 inline-flex rounded-xl bg-[#ECEEF3] p-1">
              <button type="button" onClick={() => handleTabChange('mentors')} className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === 'mentors' ? 'bg-white text-[#202637] shadow-sm' : 'text-[#6A7288]'}`}>Mentors</button>
              <button type="button" onClick={() => handleTabChange('programs')} className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === 'programs' ? 'bg-white text-[#202637] shadow-sm' : 'text-[#6A7288]'}`}>Programs</button>
              <button type="button" onClick={() => handleTabChange('communities')} className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === 'communities' ? 'bg-white text-[#202637] shadow-sm' : 'text-[#6A7288]'}`}>Communities</button>
              <button type="button" onClick={() => handleTabChange('roadmaps')} className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${activeTab === 'roadmaps' ? 'bg-white text-[#202637] shadow-sm' : 'text-[#6A7288]'}`}>Roadmaps</button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {activeTab === 'mentors' && mentorLoading ? (
                <div className="col-span-3 flex items-center justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" /></div>
              ) : activeTab === 'programs' && programLoading ? (
                <div className="col-span-3 flex items-center justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" /></div>
              ) : activeTab === 'roadmaps' && roadmapLoading ? (
                <div className="col-span-3 flex items-center justify-center py-12"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" /></div>
              ) : filteredItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D2D8E6] bg-white p-10 text-center text-[#6F778E]">No results found for this search. Try another keyword.</div>
              ) : (
                filteredItems.map((item) => (
                  <ProgramCard
                    key={item.id}
                    variant={item.tab === 'roadmaps' ? 'simple-button' : 'dual-buttons'}
                    image={item.image}
                    tag={item.tag}
                    phases={item.phases}
                    title={item.title}
                    description={item.description}
                    author={item.author}
                    primaryButtonText={
                      item.tab === 'mentors'
                        ? 'See Full Profile'
                        : item.tab === 'programs'
                        ? item.isApplied
                          ? 'Join classroom'
                          : 'Apply'
                        : item.tab === 'communities'
                        ? item.isJoined
                          ? 'Leave Community'
                          : 'Join Community'
                        : item.tab === 'roadmaps'
                        ? 'View Roadmap'
                        : 'Apply'
                    }
                    secondaryButtonText={
                      item.tab === 'mentors'
                        ? 'Message'
                        : item.tab === 'programs'
                        ? 'Details'
                        : item.tab === 'communities'
                        ? 'Preview'
                        : 'Details'
                    }
                    onPrimaryClick={async () => {
                      if (item.tab === 'communities') {
                        try {
                          if (item.isJoined) {
                            await leaveCommunity(item.id);
                            setCommunityItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, isJoined: false } : c)));
                          } else {
                            await joinCommunity(item.id);
                            setCommunityItems((prev) => prev.map((c) => (c.id === item.id ? { ...c, isJoined: true } : c)));
                          }
                        } catch (err) {
                          console.error('Failed to update community membership', err);
                        }
                      } else if (item.tab === 'mentors') {
                        navigate(`/profile/${item.id}`);
                      } else if (item.tab === 'programs') {
                        if (item.isApplied) {
                          navigate(`/classroom/${item.id}`);
                        } else {
                          navigate(`/applications/${item.id}?apply=1`);
                        }
                      } else if (item.tab === 'roadmaps') {
                        navigate(`/roadmap/${item.id}`);
                      }
                    }}
                    onSecondaryClick={() => {
                      if (item.tab === 'communities') navigate(`/community/${item.id}`);
                      if (item.tab === 'programs') navigate(`/applications/${item.id}`);
                      if (item.tab === 'roadmaps') navigate(`/roadmap/${item.id}`);
                    }}
                    hideHeaderImage={item.tab === 'roadmaps'}
                    className="h-full"
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ExplorePage;
