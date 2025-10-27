import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useState, useEffect } from "react";
import { Lock, User, Mail, Save } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Charger l'utilisateur connecté
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        const userData = parsed.user || parsed;
        setUser({
          name: `${userData.firstname || ""} ${userData.lastname || ""}`,
          email: userData.email,
          picture:
            userData.picture ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      } catch (err) {
        console.error("Erreur parsing user:", err);
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    // Simulation backend
    setTimeout(() => {
      setMessage("✅ Mot de passe mis à jour avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 p-10 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">
            Mon Profil
          </h1>

          {/*  Section informations utilisateur  */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 mb-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 transition hover:shadow-lg">
            <div className="flex-shrink-0">
              <img
                src={user?.picture}
                alt="Profil"
                className="w-28 h-28 rounded-full border border-gray-300 shadow-sm object-cover"
              />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
                <User size={20} className="text-blue-600" />
                {user?.name || "Utilisateur"}
              </h2>
              <p className="text-gray-500 flex items-center justify-center sm:justify-start gap-2 mt-2">
                <Mail size={16} className="text-blue-500" />
                {user?.email || "Email non disponible"}
              </p>

              <div className="mt-5">
                <p className="text-sm text-gray-500">
                  Vous pouvez modifier votre mot de passe ci-dessous. Si vous
                  avez des soucis de connexion, contactez un administrateur.
                </p>
              </div>
            </div>
          </div>

          {/*  Section changement de mot de passe  */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 transition hover:shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Lock className="text-blue-600" size={22} />
              Modifier mon mot de passe
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ancien mot de passe
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Entrez votre ancien mot de passe"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Entrez un nouveau mot de passe"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmez le nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirmez votre nouveau mot de passe"
                  className="w-full border border-gray-300 rounded-lg p-3 text-gray-700 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg shadow-md transition-all"
                >
                  <Save size={18} />
                  Mettre à jour le mot de passe
                </button>
              </div>

              {error && (
                <p className="text-red-600 text-center font-medium">
                  {error}
                </p>
              )}
              {message && (
                <p className="text-green-600 text-center font-medium">
                  {message}
                </p>
              )}
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
