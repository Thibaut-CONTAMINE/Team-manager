import { useEffect, useState } from "react";
import { PlusCircle, Edit3, Trash2, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { getAllUsers, createUser, updateUser, deleteUser } from "../api/userService";
import { getTeams } from "../api/teamService";
import toast from "react-hot-toast";

export default function Administration() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [roles, setRoles] = useState([
    { id: 1, name: "Employé" },
    { id: 2, name: "Manager" },
    { id: 3, name: "Admin" },
  ]);

  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [newUser, setNewUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    team_id: "",
    role_id: "",
    picture: "",
    file: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(20);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [userRes, teamRes] = await Promise.all([getAllUsers(), getTeams()]);
      const extractData = (res) =>
        Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
      setUsers(extractData(userRes));
      setTeams(extractData(teamRes));
    } catch (error) {
      console.error("Erreur chargement données :", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(users.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const handlePrevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  const handleImageUpload = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (isEdit) {
        setEditingUser({ ...editingUser, picture: imageUrl, file });
      } else {
        setNewUser({ ...newUser, picture: imageUrl, file });
      }
    }
  };

const handleAddUser = async (e) => {
  e.preventDefault();

  const { firstname, lastname, email, password, role_id, team_id, phone_number } = newUser;

  if (!firstname || !lastname || !email || !password || !role_id)
    return alert("Veuillez remplir tous les champs obligatoires (nom, prénom, email, mot de passe, rôle)");

  try {
    const payload = {
      firstname,
      lastname,
      email,
      password,
      role: Number(role_id),
      team: team_id ? Number(team_id) : null,
      phone_number: phone_number || "",
      status: newUser.status || "available",
      is_active: newUser.is_active ?? true,
    };

    await createUser(payload);
    fetchAllData();
    setNewUser({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      team_id: "",
      role_id: "",
      picture: "",
      file: null,
      phone_number: "",
      status: "available",
      is_active: true,
    });
    setShowUserForm(false);
    toast.success(" Utilisateur ajouté avec succès !");
  } catch (error) {
    console.error("Erreur création utilisateur :", error);
    toast.error("Erreur lors de la création de l'utilisateur");

  }
};


  const handleEditUser = (user) => setEditingUser({ ...user });

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, editingUser);
      fetchAllData();
      setEditingUser(null);
    } catch (error) {
      console.error("Erreur mise à jour utilisateur :", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      try {
        await deleteUser(id);
        fetchAllData();
      } catch (error) {
        console.error("Erreur suppression utilisateur :", error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Administration</h1>
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} />
              {showUserForm ? "Fermer" : "Nouvel utilisateur"}
            </button>
          </div>

          {/* Formulaire ajout utilisateur */}
              {showUserForm && (
                <form onSubmit={handleAddUser} className="bg-white p-6 rounded-lg shadow mb-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-800">Ajouter un utilisateur</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={newUser.firstname}
                      onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })}
                      className="border rounded p-2"
                    />

                    <input
                      type="text"
                      placeholder="Nom"
                      value={newUser.lastname}
                      onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })}
                      className="border rounded p-2"
                    />

                    <input
                      type="email"
                      placeholder="Email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="border rounded p-2"
                    />

                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="border rounded p-2"
                    />

                    <input
                      type="text"
                      placeholder="Numéro de téléphone"
                      value={newUser.phone_number || ""}
                      onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                      className="border rounded p-2"
                    />

                    {/* Sélecteur rôle */}
                    <select
                      value={newUser.role_id}
                      onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                      className="border rounded p-2"
                    >
                      <option value="">Rôle</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>

                    {/* Sélecteur équipe */}
                    <select
                      value={newUser.team_id}
                      onChange={(e) => setNewUser({ ...newUser, team_id: e.target.value })}
                      className="border rounded p-2"
                    >
                      <option value="">Équipe</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    {/* Statut */}
                    <select
                      value={newUser.status || "available"}
                      onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                      className="border rounded p-2"
                    >
                      <option value="available">Disponible</option>
                      <option value="unavailable">Indisponible</option>
                    </select>

                    {/* Actif */}
                    <div className="flex items-center gap-2 border rounded p-2">
                      <label className="text-sm font-medium text-gray-700">Actif</label>
                      <input
                        type="checkbox"
                        checked={newUser.is_active ?? true}
                        onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                        className="h-4 w-4 accent-blue-600"
                      />
                    </div>

                    {/* Image */}
                    <div className="flex flex-col items-center justify-center border rounded p-2">
                      {newUser.picture ? (
                        <img
                          src={newUser.picture}
                          alt="Preview"
                          className="w-16 h-16 rounded-full object-cover mb-2 border"
                        />
                      ) : (
                        <div className="text-gray-500 text-sm mb-2">Aucune image</div>
                      )}
                      <label className="flex items-center gap-2 cursor-pointer text-blue-600">
                        <Upload size={16} />
                        <span>Choisir</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e)}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="text-right mt-6">
                    <button
                      type="submit"
                      className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              )}

          {/* Tableau utilisateurs */}
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <p className="text-gray-600">
                  Page {currentPage} sur {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <span>Afficher :</span>
                  <select
                    value={usersPerPage}
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border rounded p-1"
                  >
                    <option value="20">20</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span>utilisateurs</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-x-auto mb-6">
                <table className="min-w-full border border-gray-200 text-sm table-fixed">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-2 py-2 text-center w-20">Image</th>
                      <th className="border px-4 py-2">Prénom</th>
                      <th className="border px-4 py-2">Nom</th>
                      <th className="border px-3 py-2 text-center w-80">Email</th>
                      <th className="border px-4 py-2">Rôle</th>
                      <th className="border px-4 py-2">Équipe</th>
                      <th className="border px-3 py-2 text-center w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="border px-2 py-2 text-center">
                          <img
                            src={
                              user.picture ||
                              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            }
                            alt="Profil"
                            className="w-10 h-10 rounded-full mx-auto object-cover border"
                          />
                        </td>
                        <td className="border px-4 py-2 text-center truncate">{user.firstname}</td>
                        <td className="border px-4 py-2 text-center truncate">{user.lastname}</td>
                        <td className="border px-4 py-2 text-center truncate w-80">{user.email}</td>
                        <td className="border px-4 py-2 text-center">
                          {user.role?.name || "Non défini"}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          {user.team?.name || "Aucune"}
                        </td>
                        <td className="border px-2 py-2 text-center w-32">
                          <div className="flex justify-center items-center gap-5">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit3 size={24} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-center items-center gap-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-full ${
                    currentPage === 1
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-gray-700 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-full ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </>
          )}

          {/* Édition utilisateur */}
          {editingUser && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-xl w-[520px]">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        Modifier {editingUser.firstname} {editingUser.lastname}
      </h2>

      <div className="space-y-4">
        {/* Image */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={
              editingUser.picture ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profil"
            className="w-24 h-24 rounded-full border object-cover mb-2 shadow-sm"
          />
          <label className="flex items-center gap-2 cursor-pointer text-blue-600 hover:underline">
            <Upload size={16} />
            <span>Changer la photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
              className="hidden"
            />
          </label>
        </div>

        {/* Champs texte */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Prénom :</label>
          <input
            type="text"
            value={editingUser.firstname || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, firstname: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Nom :</label>
          <input
            type="text"
            value={editingUser.lastname || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, lastname: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Email :</label>
          <input
            type="email"
            value={editingUser.email || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, email: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Téléphone :</label>
          <input
            type="text"
            value={editingUser.phone_number || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, phone_number: e.target.value })
            }
            className="border rounded p-2 flex-1"
          />
        </div>

        {/* Sélecteurs */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Rôle :</label>
          <select
            value={editingUser.role_id || editingUser.role?.id || ""}
            onChange={(e) =>
              setEditingUser({
                ...editingUser,
                role_id: Number(e.target.value),
              })
            }
            className="border rounded p-2 flex-1"
          >
            <option value="">Sélectionner un rôle</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Équipe :</label>
          <select
            value={editingUser.team_id || editingUser.team?.id || ""}
            onChange={(e) =>
              setEditingUser({ ...editingUser, team_id: Number(e.target.value) })
            }
            className="border rounded p-2 flex-1"
          >
            <option value="">Sélectionner une équipe</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statut */}
        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Statut :</label>
          <select
            value={editingUser.status || "available"}
            onChange={(e) =>
              setEditingUser({ ...editingUser, status: e.target.value })
            }
            className="border rounded p-2 flex-1"
          >
            <option value="available">Disponible</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="w-32 text-gray-700 font-medium">Actif :</label>
          <input
            type="checkbox"
            checked={editingUser.is_active || false}
            onChange={(e) =>
              setEditingUser({ ...editingUser, is_active: e.target.checked })
            }
            className="h-5 w-5 accent-blue-600"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setEditingUser(null)}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Annuler
        </button>
        <button
          onClick={async () => {
            try {
              const payload = {
                firstname: editingUser.firstname,
                lastname: editingUser.lastname,
                email: editingUser.email,
                phone_number: editingUser.phone_number,
                role: Number(editingUser.role_id || editingUser.role?.id),
                team: Number(editingUser.team_id || editingUser.team?.id),
                status: editingUser.status || "available",
                is_active: editingUser.is_active ?? true,
              };

              await updateUser(editingUser.id, payload);
              fetchAllData();
              setEditingUser(null);
              toast.success("Données de l'utilisateur mises à jour !");
            } catch (error) {
              console.error("Erreur mise à jour utilisateur :", error);
              toast.error("Erreur lors de la mise à jour");
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Enregistrer
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
