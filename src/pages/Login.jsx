import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginUser } from "../api/authService";
import Logo from "../images/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const res = await loginUser(email, password);
      const token = res.data.access_token || res.data.token;

      if (!token) throw new Error("Token non reçu du serveur");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));

      window.location.href = "/";
    } catch (err) {
      console.error("Erreur connexion :", err);
      setError("Identifiants incorrects ou serveur injoignable");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);

      const allowedEmails = [
        "foupouamohamed4@gmail.com",
        "titiconta070@gmail.com",
      ];

      if (!allowedEmails.includes(decoded.email)) {
        setError("Accès refusé : cet utilisateur n'est pas autorisé.");
        return;
      }

      localStorage.setItem("token", credentialResponse.credential);
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
        })
      );

      window.location.href = "/";
    } catch (err) {
      console.error("Erreur OAuth Google :", err);
      setError("Erreur lors de la connexion Google");
    }
  };

  const handleGoogleError = () => {
    setError("Échec de la connexion avec Google");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      {/* Plugin glassmorphism */}
      <div className="relative backdrop-blur-lg bg-white/70 border border-gray-200 shadow-xl rounded-2xl p-8 w-[95%] max-w-md transition-all duration-300 animate-fade-in hover:shadow-2xl">
        <div className="flex flex-col items-center">
          <img src={Logo} alt="Logo" className="h-16 w-auto mb-6" />

          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Connexion
          </h2>

          <form className="space-y-5 w-full" onSubmit={handleSubmit}>
            {/* Email */}
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Adresse e-mail"
              className="w-full bg-white/60 border border-gray-300 text-gray-700 placeholder-gray-400 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              required
            />

            {/* Mot de passe */}
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPassword ? "text" : "password"}
                placeholder="Mot de passe"
                className="w-full bg-white/60 border border-gray-300 text-gray-700 placeholder-gray-400 p-3 rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition"
                required
              />
              <span
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible size={22} />
                ) : (
                  <AiOutlineEye size={22} />
                )}
              </span>
            </div>

            {/* Bouton connexion avec effet zoom */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-3 rounded-lg font-semibold transition-all transform ${
                loading
                  ? "bg-blue-300 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.03]"
              }`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
          </form>

          {/* Séparateur */}
          <div className="my-6 w-full flex items-center justify-center gap-2">
            <span className="border-b border-gray-300 w-1/4"></span>
            <span className="text-gray-400 text-sm">ou</span>
            <span className="border-b border-gray-300 w-1/4"></span>
          </div>

          {/* Google login */}
          <div className="w-full flex justify-center">
            <div className="bg-white rounded-lg border border-gray-200 shadow-md p-1">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
              />
            </div>
          </div>

          <p className="mt-6 text-xs text-gray-400">© 2025 PAR23 MSC</p>
        </div>
      </div>
    </div>
  );
}
