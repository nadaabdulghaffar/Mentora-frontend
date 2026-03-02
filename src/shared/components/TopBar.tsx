import { Bell, Menu, X, Home, Mail, Users, FileText, BookOpen, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Notification {
  id: number;
  text: string;
  time: string;
  isNew: boolean;
}

const TopBar = () => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    { icon: <Calendar size={24} />, label: "Calendar" },
  ];

  return (
    <div className="flex justify-between items-center gap-2 md:gap-3 lg:gap-6 mb-4 md:mb-6 lg:mb-8 relative">
      
      {/* Hamburger Menu - Mobile & Tablet Only */}
      <div className="xl:hidden" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-slateInk hover:text-primary transition p-2"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Navigation Drawer */}
        {menuOpen && (
          <div className="absolute left-0 top-12 w-64 md:w-72 bg-white rounded-2xl shadow-lg border p-4 md:p-6 z-50">
            <nav className="space-y-4">
              {navItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-gray-600 hover:text-primary cursor-pointer transition p-2 rounded-lg hover:bg-gray-50"
                >
                  {item.icon}
              <span className="text-sm md:text-base lg:text-lg font-medium">{item.label}</span>
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-6 ml-auto">
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

        {/* Find Mentorship Button */}
        <button className="bg-primary hover:bg-primary-dark text-white px-3 md:px-5 lg:px-7 py-2 md:py-2.5 rounded-xl font-medium text-sm md:text-base lg:text-lg transition">
          Find Mentorship
        </button>
      </div>
    </div>
  );
};

export default TopBar;