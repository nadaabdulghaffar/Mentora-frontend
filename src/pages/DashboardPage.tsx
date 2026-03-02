import { useEffect, useState } from "react";
import Layout from "../shared/components/Layout";
import WelcomeBanner from "../components/dashboard components/WelcomeBanner";
import SearchSection from "../components/dashboard components/SearchSection";
import SuggestedPrograms from "../components/dashboard components/SuggestedPrograms";
import RightSidebar from "../components/dashboard components/RightSidebar";
import authAPI from "../services/authService";
import type { AuthUser } from "../types/api";



const DashboardPage = () => {
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        // Load cached user from localStorage first
        const local = authAPI.getCurrentUser();
        if (local) setUser(local);

        // Then try to refresh from server
        ;(async () => {
            try {
                const res = await authAPI.getMe();
                if (res.success && res.data) {
                    setUser(res.data);
                }
            } catch (err) {
                // ignore - keep local user if any
                console.error('Failed to fetch current user', err);
            }
        })();
    }, []);

    const displayName = user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Guest';

    return (
        <Layout>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 lg:gap-12">

                <div className="lg:col-span-9 space-y-4 md:space-y-6 lg:space-y-8">
                    <WelcomeBanner name={displayName} />
                    <SearchSection />
                    <SuggestedPrograms />

                </div>

                <div className="lg:col-span-3 space-y-4 md:space-y-6 lg:space-y-8">
                    <RightSidebar />
                </div>

            </div>
        </Layout>
    );
};

export default DashboardPage;
