import logo from "../../assets/images/logo.svg";
import {
    Home,
    Mail,
    Users,
    FileText,
    BookOpen,
    Calendar,
    ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";

const Sidebar = () => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<AuthUser | null>(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const local = authAPI.getCurrentUser();
        if (local) setUser(local);

        (async () => {
            try {
                const res = await authAPI.getMe();
                if (res.success && res.data) setUser(res.data);
            } catch (err) {
                // keep local user if present
                console.error('Sidebar: failed to refresh user', err);
            }
        })();
    }, []);

    return (
        <div className="fixed left-0 top-0 w-64 h-screen bg-white shadow-sm p-6 flex flex-col">

            {/* Top Section */}
            <div className="space-y-8 flex-1">
                <div className="mb-6">
                    <img
                        src={logo}
                        alt="Mentora Logo"
                        className="w-36 h-auto"
                    />
                </div>

                <nav className="space-y-7">
                    <SidebarItem icon={<Home size={24} />} label="Homepage" />
                    <SidebarItem icon={<Mail size={24} />} label="Messages" />
                    <SidebarItem icon={<Users size={24} />} label="Community" />
                    <SidebarItem icon={<FileText size={24} />} label="Applications" />
                    <SidebarItem icon={<BookOpen size={24} />} label="My Programs" />
                    <SidebarItem icon={<Calendar size={24} />} label="Calendar" />
                </nav>
            </div>

            {/* Profile Section */}
            <div className="relative border-t pt-4" ref={dropdownRef}>
                <div
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-gray-100 transition"
                >
                    <img
                        src={"https://randomuser.me/api/portraits/lego/1.jpg"}
                        alt="profile"
                        className="w-10 h-10 rounded-full object-cover"
                    />

                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slateInk">
                            {user ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}` : 'Guest'}
                        </p>
                        <p className="text-xs text-gray-400">
                            {user?.email ?? '—'}
                        </p>
                    </div>

                    <ChevronDown
                        size={60}
                        strokeWidth={7}
                        className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""
                            }`}
                    />
                </div>

                {/* Dropdown Menu */}
                {open && (
                    <div className="absolute bottom-14 left-0 w-full bg-white shadow-lg rounded-xl py-2 border">
                        <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                            Edit Profile
                        </button>
                        <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                            Logout
                        </button>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Sidebar;

/* Reusable Sidebar Item */
import type { ReactNode } from "react";

interface SidebarItemProps {
    icon: ReactNode;
    label: string;
}

const SidebarItem = ({ icon, label }: SidebarItemProps) => {
    return (
        <div className="flex items-center gap-3 text-gray-600 hover:text-primary
 cursor-pointer transition">
            {icon}
            <span className="text-base font-medium">{label}</span>
        </div>
    );
};
