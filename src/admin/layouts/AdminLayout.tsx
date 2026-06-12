import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-pane font-sans text-slateInk">
      {/* Sidebar - fixed width 64 (16rem = 256px) */}
      <AdminSidebar />
      
      {/* Main Content Area - pushed to the right to avoid overlapping the fixed sidebar */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen max-w-full">
        {/* Placeholder for future top header / breadcrumbs if needed */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
