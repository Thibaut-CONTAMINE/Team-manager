import { useEffect, useState } from "react";
import { Users, Briefcase } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getTeamById } from "../api/teamService";
import { getUserById } from "../api/userService";

export default function Team() {
  const [team, setTeam] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = sessionStorage.getItem("userId") || localStorage.getItem("user") && JSON.parse(localStorage.getItem("user")).user?.id;

    if (!id) {
      setLoading(false);
      return;
    }

    // Récupération de l’utilisateur connecté
    getUserById(id)
      .then((res) => {
        const userData = res.data;
        setUser(userData);

        // Récupération de l’équipe associée
        if (userData.team?.id) {
          return getTeamById(userData.team.id);
        } else {
          return null;
        }
      })
      .then((teamRes) => {
        if (teamRes && teamRes.data) setTeam(teamRes.data);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement de l'équipe :", err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Mon Équipe</h1>

          {loading ? (
            <p className="text-gray-500">Chargement de votre équipe...</p>
          ) : !team ? (
            <p className="text-gray-500">
              {user
                ? "Vous n'êtes actuellement dans aucune équipe."
                : "Impossible de charger vos informations."}
            </p>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Informations sur l’équipe */}
              <div className="flex items-center gap-4 mb-6">
                <Users size={48} className="text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {team.name}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {team.description || "Aucune description disponible"}
                  </p>
                </div>
              </div>

              {/* Manager */}
              {team.manager && (
                <>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">
                    Manager
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="font-medium text-blue-800">
                      {team.manager.firstname} {team.manager.lastname}
                    </p>
                    <p className="text-sm text-gray-600">
                      {team.manager.email}
                    </p>
                  </div>
                </>
              )}

              {/* Membres */}
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Membres de l’équipe
              </h3>

              {team.members && team.members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      className="border rounded-lg p-4 text-center shadow-sm hover:shadow-md transition"
                    >
                      <Users size={40} className="text-blue-600 mx-auto mb-2" />
                      <h4 className="font-semibold text-gray-800">
                        {member.firstname} {member.lastname}
                      </h4>
                      <div className="flex items-center justify-center text-gray-600 text-sm mt-1">
                        <Briefcase size={14} className="mr-1" />
                        {member.role?.name || "Employé"}
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        {member.email}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">
                  Aucun membre trouvé dans cette équipe.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
