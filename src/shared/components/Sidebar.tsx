import logo from "../../assets/images/logo.svg";
import mentoRobot from "../../assets/images/Gemini_Generated_Image_oov0p2oov0p2oov0 1.png";
import {
    Home,
  Compass,
    Mail,
    Users,
    FileText,
    BookOpen,
    Layers3,
    ChevronDown,
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ProfileAvatar } from "../../components/profile";
import { refreshOwnProfile } from "../../pages/profile/profileService";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";

const Sidebar = () => {
    const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const exploreTab = searchParams.get("tab");
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const userRole = user?.role?.toLowerCase();

  const sidebarDisplayName = useMemo(() => {
    if (!user) {
      return 'Guest';
    }
    return `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`;
  }, [user]);

  const goHome = () => {
    navigate(userRole === 'mentor' ? '/mentor/dashboard' : '/dashboard');
  };

  const goToMyPrograms = () => {
    navigate('/my-programs');
  };

  const goToMyRoadmaps = () => {
    navigate('/my-roadmaps');
  };

  const goToExplore = () => {
    navigate('/search-mentorship');
  };

  const goToMessages = () => {
    navigate('/messages');
  };

  const goToCommunity = () => {
    navigate('/community');
  };

  const goToApplications = () => {
    navigate('/applications');
  };

  const goToMentoAI = () => {
    navigate("/mento-ai");
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

            try {
                const profile = await refreshOwnProfile();
                if (profile) {
                    setProfilePictureUrl(
                        profile.profilePicturePath || profile.avatarUrl || null
                    );
                }
            } catch (err) {
                console.error('Sidebar: failed to load profile avatar', err);
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
                      active={
                        location.pathname === "/search-mentorship" &&
                        exploreTab !== "programs"
                      }
                    />
                    <SidebarItem
                      icon={<Mail size={24} />}
                      label="Messages"
                      onClick={goToMessages}
                      active={location.pathname === '/messages'}
                    />
                    {userRole === "mentee" && (
                      <SidebarItem
                        icon={
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#A8E6CF]">
                            <img
                              src={mentoRobot}
                              alt=""
                              className="h-full w-full object-contain"
                            />
                          </span>
                        }
                        label="Mento AI"
                        onClick={goToMentoAI}
                        active={location.pathname === "/mento-ai"}
                      />
                    )}
                    <SidebarItem 
                      icon={<Users size={24} />} 
                      label="Community"
                      onClick={goToCommunity}
                      active={location.pathname === '/community'}
                    />
                    <SidebarItem
                      icon={<FileText size={24} />}
                      label="Applications"
                      onClick={goToApplications}
                      active={location.pathname.startsWith('/applications')}
                    />
                  <SidebarItem
                    icon={<BookOpen size={24} />}
                    label="My Programs"
                    onClick={goToMyPrograms}
                    active={location.pathname === '/my-programs'}
                  />

                  {userRole === 'mentor' && (
                    <SidebarItem
                      icon={<Layers3 size={24} />}
                      label="My Roadmaps"
                      onClick={goToMyRoadmaps}
                      active={
                        location.pathname === '/my-roadmaps' ||
                        location.pathname.startsWith('/roadmap/')
                      }
                    />
                  )}
                   
                </nav>
            </div>

{/* Profile Section — tap row to open profile; chevron opens account menu */}
<div className="relative border-t border-gray-200 pt-4 mt-6" ref={dropdownRef}>
  <div className="flex items-center gap-1">
    <button
      type="button"
      className="flex min-w-0 flex-1 items-center gap-3 rounded-xl py-1.5 pl-0 pr-1 text-left transition hover:bg-gray-50"
      onClick={() => {
        navigate('/profile');
        setOpen(false);
      }}
    >
      <ProfileAvatar
        pictureUrl={profilePictureUrl}
        name={sidebarDisplayName}
        alt=""
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-sm font-semibold text-[#2E2A47]">
          {sidebarDisplayName}
        </p>
        <p className="truncate text-xs text-gray-400">{user?.email ?? '—'}</p>
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
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
        onClick={() => {
          navigate('/profile');
          setOpen(false);
        }}
      >
        My profile
      </button>
      <button
        type="button"
        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-100"
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
