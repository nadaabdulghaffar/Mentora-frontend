import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

const TopBar = () => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex justify-end items-center gap-6 mb-6 relative">
      
      {/* Notification */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="relative text-slateInk hover:text-primary transition"
        >
          <Bell size={22} />

          {/* Red Dot only if new */}
          {hasNew && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-lg border p-4 space-y-3 z-50">
            <h4 className="font-semibold text-slateInk">
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

      {/* Find Mentorship Button */}
      <button className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-xl font-medium transition">
        Find Mentorship
      </button>
    </div>
  );
};

export default TopBar;