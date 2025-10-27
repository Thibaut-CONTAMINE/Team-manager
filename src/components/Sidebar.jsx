import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  Menu,
  LogOut,
  Settings,
  BarChart2,
  CalendarClock,
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import useAuth from "../hooks/useAuth";
import Logo from "../images/logo.png";

export default function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const { user, role } = useAuth();

  // Déconnexion sécurisée
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          "http://10.127.86.164:8000/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  // --- Rôle normalisé
  const normalizedRole = useMemo(() => {
    if (user?.role?.name) return user.role.name.toLowerCase();
    if (user?.user?.role?.name) return user.user.role.name.toLowerCase();
    if (typeof role === "object" && role?.name) return role.name.toLowerCase();
    if (typeof role === "string") return role.toLowerCase();
    return "employee";
  }, [user, role]);

  const navItems = [
    { name: "Tableau de bord", path: "/", icon: <LayoutDashboard size={18} />, roles: ["employee", "manager", "admin"] },
    { name: "Mes Tâches", path: "/tasks", icon: <ClipboardList size={18} />, roles: ["employee", "manager", "admin"] },
    { name: "Mes Absences", path: "/absences", icon: <Calendar size={18} />, roles: ["employee", "manager", "admin"] },
    { name: "Mon Équipe", path: "/team", icon: <Users size={18} />, roles: ["employee", "manager", "admin"] },
    { name: "Mon Agenda", path: "/agenda", icon: <CalendarClock size={18} />, roles: ["employee", "manager", "admin"] },
    { name: "Statistiques", path: "/statistiques", icon: <BarChart2 size={18} />, roles: ["employee", "manager", "admin"] },
    { name: "Gestion des Équipes", path: "/team-management", icon: <Users size={18} />, roles: ["manager", "admin"] },
    { name: "Gestion des Tâches", path: "/gestion-taches", icon: <Users size={18} />, roles: ["manager", "admin"] },
    { name: "Administration", path: "/administration", icon: <Settings size={18} />, roles: ["admin"] },
  ];

  const visibleItems =
    normalizedRole === "admin"
      ? navItems
      : navItems.filter((item) => item.roles.includes(normalizedRole));

  const sidebarWidth = open ? 224 : 70;

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-screen backdrop-blur-md bg-white/60 border-r border-gray-200 shadow-lg transition-all duration-300 ${
          open ? "w-56" : "w-16"
        } flex flex-col z-40`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {open && (
            <img
              src={Logo}
              alt="Logo"
              className="h-9 transition-transform duration-300 hover:scale-105"
            />
          )}
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded-lg hover:bg-gray-200 transition"
          >
            <Menu size={20} className="text-primary" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-4 overflow-y-auto px-1">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {item.icon}
              {open && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <footer className="p-4 border-t border-gray-200 text-xs text-gray-500">
          {open && (
            <div className="flex flex-col gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
              <p className="text-center opacity-70 text-[11px]">By PAR23 MSC</p>
            </div>
          )}
        </footer>
      </aside>

      <div
        className="transition-all duration-300"
        style={{ marginLeft: `${sidebarWidth}px` }}
      ></div>
    </>
  );
}
