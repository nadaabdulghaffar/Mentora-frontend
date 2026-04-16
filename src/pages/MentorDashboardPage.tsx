import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../shared/components/Layout";
import WelcomeBanner from "../components/dashboard components/WelcomeBanner";
import MentorStatsSection from "../components/dashboard components/MentorStatsSection";
import SearchSection from "../components/dashboard components/SearchSection";
import RightSidebar from "../components/dashboard components/RightSidebar";
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

                // Load cached user from localStorage only
                const cachedUser = authAPI.getCurrentUser();
                const token = localStorage.getItem('accessToken');
                console.log('MentorDashboardPage - Cached user:', cachedUser, 'token present:', !!token);
                
                if (cachedUser && token) {
                    setUser(cachedUser);
                } else {
                    // No cached user or no token available
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-600">Loading mentor dashboard...</p>
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
                    <MentorStatsSection />

                </div>

                <div className="lg:col-span-3 space-y-4 md:space-y-6 lg:space-y-8">
                    <RightSidebar />
                </div>

            </div>
        </Layout>
    );
};

export default MentorDashboardPage;
