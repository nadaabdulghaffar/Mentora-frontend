import logo from "../../assets/images/logo.svg";
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  BookOpen,
  Layers3,
  Globe,
  ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ProfileAvatar } from "../../components/profile";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  const sidebarDisplayName = useMemo(() => {
    if (!user) {
      return 'Admin';
    }
    return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
  }, [user]);

  // Navigation handlers
  const goDashboard = () => navigate('/admin/dashboard');
  const goUsers = () => navigate('/admin/users');
  const goModeration = () => navigate('/admin/moderation');
  const goPrograms = () => navigate('/admin/programs');
  const goCommunities = () => navigate('/admin/communities');
  const goRoadmaps = () => navigate('/admin/roadmaps');

  // Close dropdown when clicking outside
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

  // Fetch user data
  useEffect(() => {
    const local = authAPI.getCurrentUser();
    if (local) setUser(local);

    (async () => {
      try {
        const res = await authAPI.getMe();
        if (res.success && res.data) setUser(res.data);
      } catch (err) {
        console.error('AdminSidebar: failed to refresh user', err);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('AdminSidebar: logout failed', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white shadow-sm p-6 flex flex-col z-20">

      {/* Top Section */}
      <div className="space-y-8 flex-1">
        <div className="mb-6">
          <img
            src={logo}
            alt="Mentora Logo"
            className="w-36 h-auto"
          />
        </div>

        <nav className="space-y-1.5 mt-2">
          <SidebarItem
            icon={<LayoutDashboard size={26} />}
            label="Dashboard"
            onClick={goDashboard}
            active={location.pathname === '/admin/dashboard' || location.pathname === '/admin'}
          />
          <SidebarItem
            icon={<Users size={26} />}
            label="Users"
            onClick={goUsers}
            active={location.pathname.startsWith('/admin/users')}
          />
          <SidebarItem
            icon={<ShieldAlert size={26} />}
            label="Moderation"
            onClick={goModeration}
            active={location.pathname.startsWith('/admin/moderation')}
          />
          <SidebarItem
            icon={<BookOpen size={26} />}
            label="Programs"
            onClick={goPrograms}
            active={location.pathname.startsWith('/admin/programs')}
          />
          <SidebarItem
            icon={<Globe size={26} />}
            label="Communities"
            onClick={goCommunities}
            active={location.pathname.startsWith('/admin/communities')}
          />
          <SidebarItem
            icon={<Layers3 size={26} />}
            label="Roadmaps"
            onClick={goRoadmaps}
            active={location.pathname.startsWith('/admin/roadmaps')}
          />
        </nav>
      </div>

      {/* Profile Section */}
      <div className="relative border-t border-gray-200 pt-4 mt-6" ref={dropdownRef}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1.5 pl-0 pr-1 text-left transition hover:bg-gray-50"
            onClick={() => setOpen((v) => !v)}
          >
            <ProfileAvatar
              pictureUrl={null}
              name={sidebarDisplayName}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-semibold text-[#2E2A47]">
                {sidebarDisplayName}
              </p>
              <p className="truncate text-xs text-gray-400 font-medium">Administrator</p>
            </div>
          </button>
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-expanded={open}
            aria-label="Account menu"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((v) => !v);
            }}
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {open && (
          <div className="absolute bottom-12 left-0 z-10 w-full rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100 font-medium"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminSidebar;

/* Reusable Sidebar Item (Matches existing visual consistency) */
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
      className={`group flex w-full items-center justify-between px-4 py-3 cursor-pointer rounded-xl transition-all duration-200 ease-in-out ${
        active 
          ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
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
      <div className="flex items-center gap-3">
        {icon}
        <span className={`text-[17px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
      </div>
    </div>
  );
};
