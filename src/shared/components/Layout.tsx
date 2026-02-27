import type { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface Props {
    children: ReactNode;
}

const Layout = ({ children }: Props) => {
    return (
        <div className="min-h-screen bg-[#F5F6FA] flex">
            <Sidebar />

            <main className="flex-1 ml-72 p-6 ">
                {children}
            </main>

        </div>
    );
};

export default Layout;
