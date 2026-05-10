import logo from "../../assets/images/logo.svg";
import {
    Home,
  Compass,
    Mail,
    Users,
    FileText,
    BookOpen,
    ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";

const Sidebar = () => {
    const navigate = useNavigate();
  const location = useLocation();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
  const userRole = user?.role?.toLowerCase();

  const goHome = () => {
    navigate(userRole === 'mentor' ? '/mentor/dashboard' : '/dashboard');
  };

  const goToMyPrograms = () => {
    navigate('/my-programs');
  };

  const goToExplore = () => {
    navigate('/search-mentorship');
  };

  const goToMessages = () => {
    navigate('/messages');
  };

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

    const handleLogout = async () => {
        try {
            await authAPI.logout();
        } catch (err) {
            console.error('Sidebar: logout failed', err);
        } finally {
            navigate('/login');
        }
    };

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
                  <SidebarItem
                    icon={<Home size={24} />}
                    label="Homepage"
                    onClick={goHome}
                    active={location.pathname === '/dashboard' || location.pathname === '/mentor/dashboard'}
                  />
                    <SidebarItem
                      icon={<Compass size={24} />}
                      label="Explore"
                      onClick={goToExplore}
                      active={location.pathname === '/search-mentorship'}
                    />
                    <SidebarItem
                      icon={<Mail size={24} />}
                      label="Messages"
                      onClick={goToMessages}
                      active={location.pathname === '/messages'}
                    />
                    <SidebarItem icon={<Users size={24} />} label="Community" />
                    <SidebarItem icon={<FileText size={24} />} label="Applications" />
                  <SidebarItem
                    icon={<BookOpen size={24} />}
                    label="My Programs"
                    onClick={goToMyPrograms}
                    active={location.pathname === '/my-programs'}
                  />
                </nav>
            </div>

{/* Profile Section */}
<div className="relative border-t border-gray-200 pt-4 mt-6" ref={dropdownRef}>
  <div
    onClick={() => setOpen(!open)}
    className="flex items-center gap-3 cursor-pointer group"
  >
    {/* Avatar */}
    <img
      src="https://randomuser.me/api/portraits/lego/1.jpg"
      alt="profile"
      className="w-9 h-9 rounded-full object-cover"
    />

    {/* Name + Email */}
    <div className="flex-1 leading-tight">
      <p className="text-sm font-semibold text-[#2E2A47]">
        {user
          ? `${user.firstName}${user.lastName ? " " + user.lastName : ""}`
          : "Guest"}
      </p>

      <p className="text-xs text-gray-400">
        {user?.email ?? "—"}
      </p>
    </div>

    {/* Chevron */}
    <ChevronDown
      size={18}
      className={`text-gray-400 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    />
  </div>

  {/* Dropdown */}
  {open && (
    <div className="absolute bottom-12 left-0 w-full bg-white shadow-lg rounded-xl py-2 border border-gray-100">
      <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
        Edit Profile
      </button>
      <button
        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
        onClick={handleLogout}
        type="button"
      >
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
  onClick?: () => void;
  active?: boolean;
}

const SidebarItem = ({ icon, label, onClick, active = false }: SidebarItemProps) => {
    return (
    <div
      className={`flex items-center gap-3 cursor-pointer transition ${
        active ? 'text-primary' : 'text-gray-600 hover:text-primary'
      }`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
            {icon}
            <span className="text-base font-medium">{label}</span>
        </div>
    );
};
