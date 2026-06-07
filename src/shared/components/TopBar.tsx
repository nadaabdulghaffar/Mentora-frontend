import { Menu, X, Home, Mail, Users, FileText, BookOpen, Compass, Search } from "lucide-react";
import { useEffect, useRef, useState, Suspense, lazy } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationBell } from "../../notifications";
import authAPI from "../../services/authService";
import type { AuthUser } from "../../types/api";
import type { CreateProgramFormData } from "../../components/create-program/types";

const CreateProgramModal = lazy(() => import("../../components/create-program/CreateProgramModal"));

const PENDING_CREATE_PROGRAM_DRAFT_KEY = "mentora:create-program-draft";

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

const TopBar = () => {
  const navigate = useNavigate();
const location = useLocation();
const [menuOpen, setMenuOpen] = useState(false);
const [isCreateProgramOpen, setIsCreateProgramOpen] = useState(false);

const [pendingCreateProgramValues, setPendingCreateProgramValues] =
  useState<Partial<CreateProgramFormData> | null>(null);

const [pendingCreateProgramStep, setPendingCreateProgramStep] = useState(1);

const [shouldHydrateCreateProgramDraft, setShouldHydrateCreateProgramDraft] =
  useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [headerSearch, setHeaderSearch] = useState("");

  // ── Render diagnostics ────────────────────────────────────
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.log(`[TopBar] RENDER #${renderCountRef.current}`);

  useEffect(() => {
    console.log("[TopBar] MOUNT");
    return () => { console.log("[TopBar] UNMOUNT"); };
  }, []);
  // ───────────────────────────────────────────────────

  useEffect(() => {
    const shouldReopenCreateProgram = Boolean((location.state as { reopenCreateProgram?: boolean } | null)?.reopenCreateProgram);

    if (!shouldReopenCreateProgram) {
      return;
    }

    const rawDraft = sessionStorage.getItem(PENDING_CREATE_PROGRAM_DRAFT_KEY);

    if (rawDraft) {
      try {
        const draft = JSON.parse(rawDraft) as Partial<CreateProgramFormData> & { currentStep?: number };
        const { currentStep: storedStep, ...rest } = draft;
        setPendingCreateProgramValues(rest);
        setPendingCreateProgramStep(draft.currentStep && draft.currentStep > 0 ? draft.currentStep : 3);
      } catch {
        setPendingCreateProgramValues(null);
        setPendingCreateProgramStep(3);
      }
    } else {
      setPendingCreateProgramValues(null);
      setPendingCreateProgramStep(3);
    }

    setShouldHydrateCreateProgramDraft(true);
    setIsCreateProgramOpen(true);
  }, [location.state]);



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
        <NotificationBell />

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
          <CreateProgramModal
            isOpen={isCreateProgramOpen}
            onClose={() => {
              setIsCreateProgramOpen(false);
              setShouldHydrateCreateProgramDraft(false);
            }}
            initialValues={shouldHydrateCreateProgramDraft ? pendingCreateProgramValues : null}
            initialStep={shouldHydrateCreateProgramDraft ? pendingCreateProgramStep : 1}
          />
        </Suspense>
      )}
    </div>
  );
};

export default TopBar;