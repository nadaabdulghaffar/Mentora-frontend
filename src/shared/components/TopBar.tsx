import { Bell, Menu, X, Home, Mail, Users, FileText, BookOpen, Compass, Search } from "lucide-react";
import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";

const CreateProgramModal = lazy(() => import("../../components/create-program/CreateProgramModal"));

function CreateProgramFallback() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold text-slateInk mb-4">Create Mentorship Program</h2>
        <p className="text-gray-600 mb-6">Loading create program modal…</p>
        <div className="inline-block bg-gray-100 text-gray-600 px-6 py-2 rounded-xl font-medium">Please wait</div>
      </div>
    </div>
  );
}

interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

const TopBar = () => {
  const navigate = useNavigate();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [headerSearch, setHeaderSearch] = useState("");

  const notifications: Notification[] = [
    {
      id: 1,
      text: "You have a new mentorship request",
      time: "2 mins ago",
      isNew: true,
    },
    {
      id: 2,
      text: "Your session with Sara is tomorrow",
      time: "1 hour ago",
      isNew: false,
    },
  ];

  const hasNew = notifications.some((n) => n.isNew);

  // Close notification when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // load current user to determine role
  useEffect(() => {
    const local = authAPI.getCurrentUser();
    if (local) setUser(local);

    (async () => {
      try {
        const res = await authAPI.getMe();
        if (res.success && res.data) setUser(res.data);
      } catch (err) {
        // ignore
      }
    })();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { icon: <Home size={24} />, label: "Homepage" },
    { icon: <Mail size={24} />, label: "Messages" },
    { icon: <Users size={24} />, label: "Community" },
    { icon: <FileText size={24} />, label: "Applications" },
    { icon: <BookOpen size={24} />, label: "My Programs" },
    { icon: <Compass size={24} />, label: "Explore" },
  ];

  return (
    <div className="relative mb-4 grid w-full grid-cols-1 gap-3 md:mb-6 lg:mb-8 lg:grid-cols-12 lg:items-center lg:gap-12">
      {/* Same width as main column (e.g. WelcomeBanner below: lg:col-span-9) */}
      <div className="flex min-w-0 items-center gap-2 md:gap-3 lg:col-span-9">
        {/* Hamburger Menu - Mobile & Tablet Only */}
        <div className="shrink-0 xl:hidden" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-slateInk transition hover:text-primary"
            type="button"
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {menuOpen && (
            <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border bg-white p-4 shadow-lg md:w-72 md:p-6">
              <nav className="space-y-4">
                {navItems.map((item, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      if (item.label === 'Applications') {
                        navigate('/applications');
                        setMenuOpen(false);
                      }
                    }}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-gray-600 transition hover:bg-gray-50 hover:text-primary"
                  >
                    {item.icon}
                    <span className="text-sm font-medium md:text-base lg:text-lg">{item.label}</span>
                  </div>
                ))}
              </nav>
            </div>
          )}
        </div>

        <form
          role="search"
          className="relative min-w-0 w-full flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            const q = headerSearch.trim();
            navigate(
              q ? `/search-mentorship?q=${encodeURIComponent(q)}` : "/search-mentorship"
            );
          }}
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="search"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder={
              user?.role?.toLowerCase() === "mentor"
                ? "Search resources, mentees, or programs..."
                : "Search mentors, programs…"
            }
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm text-slateInk shadow-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 md:py-2.5 md:pl-11 md:text-base"
            aria-label={
              user?.role?.toLowerCase() === "mentor"
                ? "Search resources, mentees, and programs"
                : "Search mentors and programs"
            }
          />
        </form>
      </div>

      {/* Right: notifications + CTA (aligned with sidebar column) */}
      <div className="flex shrink-0 items-center justify-end gap-2 md:gap-3 lg:col-span-3 lg:gap-6">
        {/* Notification */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative text-slateInk hover:text-primary transition"
          >
            <Bell size={22} />

            {/* Red Dot only if new */}
            {hasNew && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-3 w-72 md:w-80 lg:w-96 bg-white rounded-2xl shadow-lg border p-4 md:p-6 space-y-3 z-50">
              <h4 className="font-semibold text-sm md:text-base lg:text-lg text-slateInk">
                Notifications
              </h4>

              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-xl cursor-pointer transition ${
                      notification.isNew
                        ? "bg-purple-50"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p className="text-sm font-medium text-slateInk">
                      {notification.text}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Find/Create Mentorship Button */}
        <button
          onClick={() => {
            if (user?.role?.toLowerCase() === 'mentor') {
              console.log('TopBar: opening create program modal');
              setIsCreateProgramOpen(true);
            } else {
              navigate('/search-mentorship');
            }
          }}
          className="bg-primary hover:bg-primary-dark text-white px-3 md:px-5 lg:px-7 py-2 md:py-2.5 rounded-xl font-medium text-sm md:text-base lg:text-lg transition"
        >
          {user?.role?.toLowerCase() === 'mentor' ? 'Create Program' : 'Find Mentorship'}
        </button>
      </div>

      {isCreateProgramOpen && (
        <Suspense fallback={<CreateProgramFallback />}>
          <CreateProgramModal isOpen={isCreateProgramOpen} onClose={() => setIsCreateProgramOpen(false)} />
        </Suspense>
      )}
    </div>
  );
};

export default TopBar;