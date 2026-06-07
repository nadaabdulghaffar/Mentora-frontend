import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/Layout";
import WelcomeBanner from "../components/dashboard components/WelcomeBanner";
import SearchSection from "../components/dashboard components/SearchSection";
import SuggestedPrograms from "../components/dashboard components/SuggestedPrograms";
import MentorsMatch from "../components/dashboard components/MentorsMatch";
import RightSidebar from "../components/dashboard components/RightSidebar";
import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";
import {
  useEffectRunDiagnostics,
  usePageLifecycleDiagnostics,
  withLoadingDiagnostics,
} from "../utils/pageDiagnosticLogger";

const PAGE_NAME = "DashboardPage";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    usePageLifecycleDiagnostics(PAGE_NAME);
    useEffectRunDiagnostics(PAGE_NAME, "loadUser", [navigate]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true);
                setError(null);

                await withLoadingDiagnostics(PAGE_NAME, "user", async () => {
                // Load cached user from localStorage first
                const cachedUser = authAPI.getCurrentUser();
                const token = localStorage.getItem('accessToken');
                console.log(`[${PAGE_NAME}] Cached user present=${Boolean(cachedUser)} token present=${Boolean(token)}`);
                
                if (cachedUser && token) {
                    setUser(cachedUser);
                    // if mentor, redirect automatically
                    if (cachedUser.role?.toLowerCase() === 'mentor') {
                        console.log(`[${PAGE_NAME}] User is mentor — redirecting`);
                        navigate('/mentor/dashboard');
                        return;
                    }
                } else {
                    // No cached user or no token available
                    console.warn(`[${PAGE_NAME}] Missing auth data — redirecting to login`);
                    navigate('/login');
                    return;
                }
                });
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error && !user) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <div className="text-4xl">⚠️</div>
                        <p className="text-red-600 font-semibold">{error}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">

                <div className="lg:col-span-9 space-y-4 md:space-y-6 lg:space-y-8">
                    <WelcomeBanner name={displayName} />
                    <SearchSection />
                    <SuggestedPrograms />
                    <MentorsMatch />

                </div>

                <div className="lg:col-span-3 space-y-4 md:space-y-6 lg:space-y-8">
                    <RightSidebar />
                </div>

            </div>
        </Layout>
    );
};

export default DashboardPage;
