import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaHome,
  FaSearch,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaUserShield,
  FaTerminal,
  FaUser,
  FaRobot
} from "react-icons/fa";

function Sidebar() {
  const { logout, role } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const allowedMenus = [
    {
      title: "Dashboard",
      icon: <FaHome size={18} />,
      path: "/dashboard"
    },
    {
      title: "Research",
      icon: <FaSearch size={17} />,
      path: "/research"
    },
    {
      title: "History",
      icon: <FaHistory size={17} />,
      path: "/history"
    },
    ...(role === "admin"
      ? [
          {
            title: "Admin Settings",
            icon: <FaCog size={17} />,
            path: "/admin/settings"
          },
          {
            title: "User Management",
            icon: <FaUserShield size={17} />,
            path: "/admin/users"
          },
          {
            title: "System Logs",
            icon: <FaTerminal size={17} />,
            path: "/admin/logs"
          }
        ]
      : [
          {
            title: "Settings",
            icon: <FaCog size={18} />,
            path: "/settings"
          }
        ]),
    {
      title: "Profile",
      icon: <FaUser size={17} />,
      path: "/profile"
    }
  ];

  return (
    <aside className="w-64 bg-[#0a0d16] border-r border-slate-800/60 text-slate-300 min-h-screen flex flex-col justify-between select-none">
      
      <div>
        {/* Brand/Logo */}
        <div className="py-6 px-6 border-b border-slate-800/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <FaRobot className="text-xl text-white animate-pulse-glow" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white leading-none font-sans">
              Aetheria <span className="text-indigo-400 font-semibold">AI</span>
            </h2>
            <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">
              Research Platform
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="mt-6 px-3 space-y-1.5">
          {allowedMenus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative group
                ${
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border-l-[3px] border-indigo-500 shadow-inner"
                    : "hover:bg-slate-800/40 hover:text-white"
                }`
              }
            >
              <span className="transition-transform group-hover:scale-110">
                {menu.icon}
              </span>
              <span>{menu.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-slate-800/40">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition duration-200"
        >
          <FaSignOutAlt size={16} />
          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
}

export default Sidebar;