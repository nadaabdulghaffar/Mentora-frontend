import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface Props {
    children: ReactNode;
    showTopBar?: boolean;
}

const Layout = ({ children, showTopBar = true }: Props) => {
    return (
        <div className="min-h-screen bg-[#F5F6FA] flex">
            <div className="hidden xl:block">
                <Sidebar />
            </div>

            <main className="flex-1 xl:ml-72 p-4 md:p-6 lg:p-8">
                {showTopBar && <TopBar />}
                {children}
            </main>

        </div>
    );
};

export default Layout;
