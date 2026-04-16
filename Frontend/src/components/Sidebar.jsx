import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Code,
  TerminalSquare,
  User,
  BarChart,
  TrendingUp   // ✅ Progress icon
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-[#0B1220] min-h-screen p-5 border-r border-gray-800 flex flex-col justify-between">

      {/* 🔹 TOP */}
      <div>

        {/* 🔹 LOGO */}
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-lg text-white">
            ⚡
          </div>
          <div>
            <h1 className="text-white font-semibold text-lg">TalentFlow</h1>
            <p className="text-gray-400 text-xs">HR Portal</p>
          </div>
        </div>

        {/* 🔹 MENU */}
        <div className="space-y-3 text-sm">

          {/* ===== RECRUITMENT ===== */}
          <p className="text-gray-500 text-xs uppercase tracking-wider">
            Recruitment
          </p>

          <NavItem
            to="/"
            icon={<LayoutDashboard size={16} />}
            text="Dashboard"
            active={isActive("/")}
          />

          <NavItem
            to="/candidates"
            icon={<FileText size={16} />}
            text="Resumes"
            active={isActive("/candidates")}
          />

          {/* ✅ NEW: PROGRESS PAGE */}
          <NavItem
            to="/progress"
            icon={<TrendingUp size={16} />}
            text="Progress"
            active={isActive("/progress")}
          />

          {/* ===== ROUNDS ===== */}
          <p className="text-gray-500 mt-6 text-xs uppercase tracking-wider">
            Rounds
          </p>

          <NavItem
            to="/aptitude"
            icon={<CheckSquare size={16} />}
            text="Aptitude"
            active={isActive("/aptitude")}
          />

          <NavItem
            to="/technical"
            icon={<Code size={16} />}
            text="Technical"
            active={isActive("/technical")}
          />

          <NavItem
            to="/coding"
            icon={<TerminalSquare size={16} />}
            text="Coding"
            active={isActive("/coding")}
          />

          <NavItem
            to="/hr-round"
            icon={<User size={16} />}
            text="HR Round"
            active={isActive("/hr-round")}
          />

          {/* ===== REPORTS ===== */}
          <p className="text-gray-500 mt-6 text-xs uppercase tracking-wider">
            Reports
          </p>

          <NavItem
            to="/analytics"
            icon={<BarChart size={16} />}
            text="Analytics"
            active={isActive("/analytics")}
          />

        </div>
      </div>

      {/* 🔹 PROFILE */}
      <div className="flex items-center gap-3 mt-6 p-3 bg-[#111827] rounded-xl border border-gray-800">
        <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white">
          SA
        </div>
        <div>
          <p className="text-sm text-white font-medium">Sneha Agarwal</p>
          <p className="text-xs text-gray-400">HR Manager</p>
        </div>
      </div>

    </div>
  );
}

/* 🔥 NAV ITEM */
function NavItem({ to, icon, text, active }) {
  return (
    <Link to={to}>
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
          active
            ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        {icon}
        <span>{text}</span>
      </div>
    </Link>
  );
}