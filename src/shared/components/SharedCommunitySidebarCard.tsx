import React from 'react';
import SectionTitle from "../../components/SectionTitle";
import ViewAllLink from "../../components/ViewAllLink";

export type SidebarCommunityItem = {
    id: string;
    name: string;
    avatarUrl?: string;
};

type SharedCommunitySidebarCardProps = {
    title: string;
    communities: SidebarCommunityItem[];
    isLoading?: boolean;
    isError?: boolean;
    emptyMessage: React.ReactNode;
    actionText: string;
    onActionClick: (id: string) => void;
    footerLinkTo?: string;
    footerLinkText?: string;
    onRetry?: () => void;
    hideImage?: boolean;
};

const CommunityAvatar = ({ url, name }: { url?: string; name: string }) => {
    const [error, setError] = React.useState(false);
    
    React.useEffect(() => {
        setError(false);
    }, [url]);

    if (!url || error) {
        return (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        );
    }
    return (
        <img src={url} alt={name} className="h-full w-full object-cover" onError={() => setError(true)} />
    );
};

export const SharedCommunitySidebarCard: React.FC<SharedCommunitySidebarCardProps> = ({
    title,
    communities,
    isLoading,
    isError,
    emptyMessage,
    actionText,
    onActionClick,
    footerLinkTo,
    footerLinkText,
    onRetry,
    hideImage = false
}) => {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <SectionTitle className="mb-4">{title}</SectionTitle>

            {isLoading ? (
                <div className="flex flex-col space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-16 w-full"></div>
                    ))}
                </div>
            ) : isError ? (
                <div className="text-center py-6 text-gray-500 text-sm flex flex-col items-center gap-2">
                    <p>Failed to load communities.</p>
                    {onRetry && (
                        <button onClick={onRetry} className="text-primary hover:underline font-semibold">
                            Retry
                        </button>
                    )}
                </div>
            ) : communities.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                    {emptyMessage}
                </div>
            ) : (
                <div className="flex flex-col space-y-4">
                    {communities.map((community) => (
                        <div key={community.id} className="flex items-center gap-3">
                            {!hideImage && (
                                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center">
                                    <CommunityAvatar url={community.avatarUrl} name={community.name} />
                                </div>
                            )}
                            <div className="flex flex-col flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-[#1F2432] truncate" title={community.name}>
                                    {community.name}
                                </h4>
                            </div>
                            <button
                                onClick={() => onActionClick(community.id)}
                                className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary bg-[#F4F0FF] hover:bg-primary hover:text-white transition"
                            >
                                {actionText}
                            </button>
                        </div>
                    ))}
                    
                    {footerLinkTo && footerLinkText && (
                        <div className="pt-3 mt-1 border-t border-gray-100 w-full">
                            <ViewAllLink to={footerLinkTo} text={footerLinkText} className="w-full" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
