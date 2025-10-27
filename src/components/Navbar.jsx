import { useState, useEffect, useRef } from "react";
import { CalendarClock, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUserById } from "../api/userService";
import Logo from "../images/logo.png";

export default function Navbar() {
  const navigate = useNavigate();
  const [now, setNow] = useState("");
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const updateClock = () => {
      setNow(
        new Date().toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Chargement utilisateur
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedUser || !token) return;

    try {
      const parsed = JSON.parse(storedUser);
      if (token.length > 300 && parsed.email) {
        setUser({
          name: parsed.name,
          email: parsed.email,
          picture: parsed.picture,
        });
        return;
      }

      if (parsed.user) {
        const dbUser = parsed.user;
        setUser({
          name: `${dbUser.firstname} ${dbUser.lastname}`,
          email: dbUser.email,
          picture:
            dbUser.picture ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
        return;
      }

      if (parsed.id) {
        getUserById(parsed.id)
          .then((res) => {
            const u = res.data;
            setUser({
              name: `${u.firstname} ${u.lastname}`,
              email: u.email,
              picture:
                u.picture ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            });
          })
          .catch((err) => {
            console.error("Erreur lors du chargement utilisateur :", err);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/login");
          });
      }
    } catch (err) {
      console.error("Erreur parsing user :", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [navigate]);

  // Gestion du clic en dehors du menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="flex justify-between items-center backdrop-blur-lg bg-white/70 border-b border-gray-200 shadow-sm px-6 py-3 sticky top-0 z-30 transition-all">

      {/* Centre : message de bienvenue */}
      <div className="hidden md:block text-gray-700 font-medium text-base animate-fade-in">
        {user ? (
          <div className="text-lg font-semibold">
            <span className="font-bold text-gray-800">Bienvenue&nbsp;</span>
            <span className="text-blue-600 font-semibold transition-all duration-300 hover:text-blue-700">
              {user.name}
            </span>
          </div>
        ) : (
          <span className="text-lg font-semibold text-gray-800">
            Bienvenue sur la plateforme
          </span>
        )}
      </div>

      {/* Droite : heure + profil */}
      <div className="flex items-center gap-6 relative" ref={menuRef}>
        {/* Horloge */}
        <div className="flex items-center text-gray-600">
          <CalendarClock size={18} className="mr-1 text-blue-600" />
          <span className="text-sm font-medium">{now}</span>
        </div>

        {/* Profil utilisateur */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 bg-white/50 border border-gray-200 rounded-full px-3 py-1.5 hover:bg-blue-50 hover:shadow transition-all"
            >
              <img
                src={user.picture}
                alt="Profil"
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-fade-in z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <User size={16} className="mr-2 text-blue-600" />
                  Profil
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
                >
                  <LogOut size={16} className="mr-2 text-red-600" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
