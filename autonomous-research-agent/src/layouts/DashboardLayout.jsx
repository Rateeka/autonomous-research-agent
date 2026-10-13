import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ProtectedRoute from "../components/ProtectedRoute";

function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[#080c14] text-slate-100 font-sans overflow-hidden">
        {/* Modern Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
          {/* Top Header Navbar */}
          <Navbar />

          {/* Page Container */}
          <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#0b0f19]/30 relative z-10">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default DashboardLayout;