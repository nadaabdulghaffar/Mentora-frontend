import { useEffect, useState } from "react";
import Layout from "../../shared/components/Layout";
import WelcomeBanner from "./components/WelcomeBanner";
import SearchSection from "./components/SearchSection";
import SuggestedPrograms from "./components/SuggestedPrograms";
import RightSidebar from "./components/RightSidebar";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";



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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                <div className="lg:col-span-9 space-y-6">
                    <WelcomeBanner name={displayName} />
                    <SearchSection />
                    <SuggestedPrograms />

                </div>

                <div className="lg:col-span-3 space-y-6">
                    <RightSidebar />
                </div>

            </div>
        </Layout>
    );
};

export default DashboardPage;
