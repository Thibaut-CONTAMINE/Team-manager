import { useEffect, useState } from "react";
import { Users, PlusCircle, Trash2, X, UserPlus, Edit3 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  getTeams,
  getTeamById,
  createTeam,
  deleteTeam,
} from "../api/teamService";
import { getAllUsers } from "../api/userService";
import api from "../api/apiClient";
import toast from "react-hot-toast";

export default function GestionEquipes() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTeam, setNewTeam] = useState({ name: "", description: "" });
  const [showForm, setShowForm] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetails, setTeamDetails] = useState({ manager: null, members: [] });
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [usersWithoutTeam, setUsersWithoutTeam] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [editTeam, setEditTeam] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await getTeams();
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setTeams(data);
    } catch (error) {
      console.error("Erreur chargement équipes :", error);
      toast.error("Erreur lors du chargement des équipes");
    } finally {
      setLoading(false);
    }
  };

  // Création équipe
  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      toast.error("Le nom de l’équipe est obligatoire");
      return;
    }

    try {
      await createTeam(newTeam);
      toast.success("Équipe créée avec succès !");
      setNewTeam({ name: "", description: "" });
      setShowForm(false);
      fetchTeams();
    } catch (error) {
      console.error("Erreur ajout équipe :", error);
      toast.error("Erreur lors de la création de l'équipe");
    }
  };

  // Suppression équipe
  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette équipe ?")) return;

    try {
      setTeams((prev) => prev.filter((t) => t.id !== id));
      toast.success("Équipe supprimée avec succès !");
      await deleteTeam(id);
      setTimeout(fetchTeams, 500);
    } catch (error) {
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast.success("Équipe supprimée");
        fetchTeams();
      } else {
        console.error("Erreur suppression équipe :", error);
        toast.error("Erreur lors de la suppression de l'équipe");
      }
    }
  };

  // Détails d'une équipe
  const handleSelectTeam = async (teamId) => {
    setSelectedTeam(null);
    setLoadingDetails(true);

    try {
      const res = await getTeamById(teamId);
      setTeamDetails({
        ...res.data,
        manager: res.data.manager,
        members: res.data.members || [],
      });
      setSelectedTeam(teamId);
    } catch (error) {
      console.error("Erreur chargement détails équipe :", error);
      setTeamDetails({ manager: null, members: [] });
      toast.error("Erreur chargement des détails de l'équipe");
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setTeamDetails({ manager: null, members: [] });
  };

  // Suppression d’un membre = team: null
  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Retirer ce membre de l’équipe ?")) return;

    try {
      const res = await api.get(`/users/${userId}`);
      const userData = res.data;

      const payload = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        phone_number: userData.phone_number,
        role: userData.role?.id || userData.role_id,
        team: null,
        status: userData.status || "available",
        is_active: userData.is_active ?? true,
      };

      await api.put(`/users/${userId}`, payload);
      setTeamDetails((prev) => ({
        ...prev,
        members: prev.members.filter((m) => m.id !== userId),
      }));
      toast.success("Membre retiré de l’équipe !");
    } catch (error) {
      console.error("Erreur suppression membre :", error);
      toast.error("Erreur lors du retrait du membre");
    }
  };

  // Chargement des utilisateurs sans équipe
  const openAddMemberModal = async () => {
    setShowAddModal(true);
    try {
      const res = await getAllUsers();
      const allUsers = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];

      const noTeamUsers = allUsers.filter(
        (u) => !u.team || u.team === null || u.team_id === null
      );

      setUsersWithoutTeam(noTeamUsers);
    } catch (error) {
      console.error("Erreur chargement utilisateurs sans équipe :", error);
      toast.error("Erreur lors du chargement des utilisateurs sans équipe");
      setUsersWithoutTeam([]);
    }
  };

// Ajout d’un membre à une équipe
const handleAddMember = async () => {
  if (!selectedUserId) {
    toast.error("Sélectionnez un utilisateur à ajouter");
    return;
  }

  try {
    // On récupère les infos de l'utilisateur sélectionné
    const res = await api.get(`/users/${selectedUserId}`);
    const userData = res.data;

    // On met à jour son équipe
    const payload = {
      firstname: userData.firstname,
      lastname: userData.lastname,
      email: userData.email,
      phone_number: userData.phone_number,
      role: userData.role?.id || userData.role_id,
      team: selectedTeam, 
      status: userData.status || "available",
      is_active: userData.is_active ?? true,
    };

    await api.put(`/users/${selectedUserId}`, payload);

    toast.success("Utilisateur ajouté à l’équipe !");
    setShowAddModal(false);
    setSelectedUserId("");
    handleSelectTeam(selectedTeam);
  } catch (error) {
    console.error("Erreur ajout membre :", error);
    toast.error("Erreur lors de l’ajout du membre");
  }
};


  // Ouverture mode édition
  const handleEditTeam = (team) => {
    setEditTeam({
      id: team.id,
      name: team.name,
      description: team.description || "",
      manager: team.manager?.id || 1,
    });
  };

  // Sauvegarde édition équipe
  const handleUpdateTeam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: editTeam.name,
        description: editTeam.description,
        manager: editTeam.manager || 1,
      };

      await api.put(`/teams/${editTeam.id}`, payload);
      toast.success("Équipe mise à jour avec succès !");
      setEditTeam(null);
      fetchTeams();
    } catch (error) {
      console.error("Erreur mise à jour équipe :", error);
      toast.error("Erreur lors de la mise à jour de l'équipe");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Gestion des Équipes</h1>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} />
              {showForm ? "Fermer" : "Nouvelle Équipe"}
            </button>
          </div>

          {/* Formulaire ajout */}
          {showForm && (
            <form onSubmit={handleAddTeam} className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l’équipe
                  </label>
                  <input
                    type="text"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    className="w-full border rounded-md p-2 focus:ring focus:ring-blue-200"
                    placeholder="Ex: Équipe Backend"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    className="w-full border rounded-md p-2 focus:ring focus:ring-blue-200"
                    placeholder="Ex: Gère les APIs et services"
                  />
                </div>
              </div>

              <div className="mt-4 text-right">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Ajouter
                </button>
              </div>
            </form>
          )}

          {/* Liste des équipes */}
          {loading ? (
            <p className="text-gray-500">Chargement des équipes...</p>
          ) : teams.length === 0 ? (
            <p className="text-gray-500">Aucune équipe trouvée.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team.id}
                  onClick={() => handleSelectTeam(team.id)}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 relative cursor-pointer"
                >
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditTeam(team);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      title="Modifier"
                    >
                      <Edit3 size={18} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTeam(team.id);
                      }}
                      className="text-gray-400 hover:text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <Users size={48} className="text-blue-600 mx-auto mb-3" />
                  <h2 className="text-lg font-semibold text-gray-800 text-center">{team.name}</h2>
                  <p className="text-gray-500 text-sm mt-1 text-center">
                    {team.description || "Aucune description"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* édition d'équipe */}
          {editTeam && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg relative">
                <button
                  onClick={() => setEditTeam(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                >
                  <X size={20} />
                </button>

                <h2 className="text-xl font-semibold text-blue-700 mb-4 text-center">
                  Modifier l’équipe
                </h2>

                <form onSubmit={handleUpdateTeam} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={editTeam.name}
                      onChange={(e) => setEditTeam({ ...editTeam, name: e.target.value })}
                      className="w-full border rounded-md p-2 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editTeam.description}
                      onChange={(e) => setEditTeam({ ...editTeam, description: e.target.value })}
                      className="w-full border rounded-md p-2 focus:ring focus:ring-blue-200"
                    />
                  </div>

                  <div className="text-right">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* détails d'équipe */}
          {selectedTeam && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
              <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative">
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                >
                  <X size={20} />
                </button>

                {loadingDetails ? (
                  <p className="text-gray-500 text-center">Chargement...</p>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold mb-2 text-blue-700 text-center">
                      {teamDetails.name}
                    </h2>
                    <p className="text-gray-500 text-center mb-4">
                      {teamDetails.description}
                    </p>

                    {teamDetails.manager && (
                      <div className="bg-blue-50 p-3 rounded-lg border mb-4">
                        <h3 className="font-semibold text-blue-700 text-sm mb-1">
                          Manager
                        </h3>
                        <p className="text-gray-700">
                          {teamDetails.manager.firstname} {teamDetails.manager.lastname}
                        </p>
                        <p className="text-gray-500 text-sm">{teamDetails.manager.email}</p>
                      </div>
                    )}

                    <h3 className="font-semibold mb-2 text-gray-700">Membres</h3>
                    {teamDetails.members.length > 0 ? (
                      <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 border text-left">Nom</th>
                            <th className="px-3 py-2 border text-left">Email</th>
                            <th className="px-3 py-2 border text-left">Statut</th>
                            <th className="px-3 py-2 border text-center w-16">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {teamDetails.members.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 border">
                                {m.firstname} {m.lastname}
                              </td>
                              <td className="px-3 py-2 border">{m.email}</td>
                              <td className="px-3 py-2 border">{m.status || "N/A"}</td>
                              <td className="px-3 py-2 border text-center">
                                <button
                                  onClick={() => handleRemoveMember(m.id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 text-sm text-center">
                        Aucun membre dans cette équipe.
                      </p>
                    )}

                    <div className="text-center mt-6">
                      <button
                        onClick={openAddMemberModal}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg mx-auto hover:bg-green-700 transition"
                      >
                        <UserPlus size={18} />
                        Ajouter une personne sans équipe
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/*  ajout membre */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-red-600"
                >
                  <X size={20} />
                </button>

                <h2 className="text-lg font-semibold text-blue-700 mb-4 text-center">
                  Ajouter un utilisateur sans équipe
                </h2>

                {usersWithoutTeam.length > 0 ? (
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full border rounded-md p-2 mb-4"
                  >
                    <option value="">Sélectionnez un utilisateur</option>
                    {usersWithoutTeam.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstname} {u.lastname} - {u.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-gray-500 text-center mb-4">
                    Aucun utilisateur sans équipe trouvé.
                  </p>
                )}

                <div className="text-center">
                  <button
                    onClick={handleAddMember}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
