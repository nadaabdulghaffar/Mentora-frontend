import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Lightbulb, Paintbrush, Rocket } from "lucide-react";

type CommunityRow = {
    id: string;
    name: string;
    members: string;
    icon: LucideIcon;
    iconClass: string;
};

/** Opens this community page when user taps Join (dev: same as `/community/fullstack-wizards`). */
const JOIN_COMMUNITY_PATH = "/community/fullstack-wizards";

const COMMUNITIES: CommunityRow[] = [
    {
        id: "ai-creative",
        name: "AI Creative Collective",
        members: "1.2k members",
        icon: Lightbulb,
        iconClass: "bg-gradient-to-br from-indigo-500 to-purple-600",
    },
    {
        id: "ux-research",
        name: "UX Research Pioneers",
        members: "856 members",
        icon: Paintbrush,
        iconClass: "bg-gradient-to-br from-emerald-400 to-teal-600",
    },
    {
        id: "product-hunt",
        name: "Product Hunt Enthusiasts",
        members: "2.4k members",
        icon: Rocket,
        iconClass: "bg-gradient-to-br from-orange-400 to-amber-500",
    },
];

const RecommendedCommunitiesCard = () => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <h3 className="text-base font-bold text-slateInk md:text-lg">
                Recommended Communities
            </h3>
            <p className="mt-1 text-sm text-gray-500">
                Based on your interests in AI and Design
            </p>

            <ul className="mt-5 space-y-4">
                {COMMUNITIES.map(({ id, name, members, icon: Icon, iconClass }) => (
                    <li key={id}>
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white ${iconClass}`}
                                aria-hidden
                            >
                                <Icon className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-semibold text-slateInk">{name}</p>
                                <p className="text-xs text-gray-500">{members}</p>
                            </div>
                            <Link
                                to={JOIN_COMMUNITY_PATH}
                                className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-slateInk transition hover:bg-gray-50"
                            >
                                Join
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecommendedCommunitiesCard;
