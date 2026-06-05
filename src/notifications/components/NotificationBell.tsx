import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import authAPI from "../../services/authService";
import { useUnreadNotificationCount } from "../hooks";
import { NotificationDropdown } from "./NotificationDropdown";

function formatUnreadBadge(count: number): string {
  return count > 99 ? "99+" : String(count);
}

function getAriaLabel(
  isOpen: boolean,
  isLoading: boolean,
  isError: boolean,
  unreadCount: number
): string {
  if (isError) {
    return "Notifications unavailable";
  }

  if (isLoading && unreadCount === 0) {
    return "Loading notifications";
  }

  if (unreadCount > 0) {
    return `Notifications, ${unreadCount} unread`;
  }

  return isOpen ? "Notifications, menu open" : "Notifications";
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useUnreadNotificationCount({
    enabled: authAPI.isAuthenticated(),
  });

  const unreadCount = data ?? 0;
  const showBadge = unreadCount > 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative text-slateInk transition hover:text-primary"
        aria-label={getAriaLabel(open, isLoading, isError, unreadCount)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={22} aria-hidden />
        {showBadge && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-none text-white md:h-5 md:min-w-5 md:text-xs">
            {formatUnreadBadge(unreadCount)}
          </span>
        )}
      </button>

      {open && <NotificationDropdown onClose={() => setOpen(false)} />}
    </div>
  );
}
