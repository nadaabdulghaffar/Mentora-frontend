import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/Layout";
import WelcomeBanner from "../components/dashboard components/WelcomeBanner";
import MentorMentorshipProgramsSection from "../components/dashboard components/MentorMentorshipProgramsSection";
import MentorActiveApplicationsSection from "../components/dashboard components/MentorActiveApplicationsSection";
import SearchSection from "../components/dashboard components/SearchSection";
import RightSidebar from "../components/dashboard components/RightSidebar";
import { MENTOR_DASHBOARD_CHIPS } from "../constants/chatbotPrompts";
import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";

const MentorDashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true);
                setError(null);

                const cachedUser = authAPI.getCurrentUser();
                const token = localStorage.getItem('accessToken');

                if (cachedUser && token) {
                    setUser(cachedUser);
                } else {
                    console.warn('MentorDashboardPage - Missing auth data, redirecting to login');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, [navigate]);

    const displayName = user
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : 'Guest';

    if (loading) {
        return (
            <Layout>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="space-y-4 text-center">
                        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
                        <p className="text-gray-600">Loading mentor dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error && !user) {
        return (
            <Layout>
                <div className="flex min-h-screen items-center justify-center">
                    <div className="space-y-4 text-center">
                        <div className="text-4xl">⚠️</div>
                        <p className="font-semibold text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-12 lg:gap-12">

                <div className="space-y-4 md:space-y-6 lg:col-span-9 lg:space-y-8">
                    <WelcomeBanner
                        name={displayName}
                        tagline="Inspire, guide, and help shape the next generation of talent."
                    />
                    <SearchSection
                        title="Mento AI is here to help you guide the next generation"
                        placeholder="Ask about session planning, mentorship best practices, or your analytics..."
                        suggestionChips={MENTOR_DASHBOARD_CHIPS}
                    />
                    <MentorMentorshipProgramsSection />
                    <MentorActiveApplicationsSection />
                </div>

                <div className="space-y-4 md:space-y-6 lg:col-span-3 lg:space-y-8">
                    <RightSidebar upcomingTitle="Upcoming Sessions" />
                </div>

            </div>
        </Layout>
    );
};

export default MentorDashboardPage;
