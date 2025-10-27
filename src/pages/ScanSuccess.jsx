import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import api from "../api/apiClient";
import toast from "react-hot-toast";

export default function ScanSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const email = searchParams.get("email");

  // Empêche l'appel multiple
  const hasScanned = useRef(false);

  useEffect(() => {
    const registerPointing = async () => {
      if (!email) {
        setStatus("error");
        setMessage("QR code invalide : aucun email détecté.");
        return;
      }

      try {
        // Récupération de l'utilisateur via son email
        let userRes;
        try {
          userRes = await api.get(`/users?email=${encodeURIComponent(email)}`);
        } catch {
          const allUsers = await api.get("/users");
          userRes = { data: allUsers.data };
        }

        const userList = Array.isArray(userRes.data)
          ? userRes.data
          : [userRes.data];
        const user = userList.find(
          (u) => u.email?.toLowerCase() === email.toLowerCase()
        );

        if (!user?.id) {
          setStatus("error");
          setMessage("Utilisateur non trouvé pour cet email.");
          return;
        }

        // Envoi du pointage
        const payload = { user: user.id };

        const res = await api.post("/pointings", payload);

        // Interprétation de la réponse
        if (res.data?.type === "arrival") {
          setStatus("success");
          setMessage("Heure d’arrivée enregistrée");
        } else if (res.data?.type === "departure") {
          setStatus("success");
          setMessage("Heure de départ enregistrée");
        } else {
          setStatus("success");
          setMessage("Pointage enregistré avec succès");
        }
      } catch (error) {
        if (error.status == 422) {
          setStatus("error");
          setMessage("Pointage déjà effectué pour aujourd’hui.\nEn cas d'erreur veuillez contacter un administrateur.");
          toast.error("Pointage déjà effectué !");
        } else {
          console.error("Erreur API pointage :", error );
          setStatus("error");
          setMessage("Erreur lors du pointage, veuillez réessayer.");
          toast.error("Erreur réseau ou API");
        } 
      }
    };

    // Empêche les doubles appels
    if (hasScanned.current || !email) return;
    hasScanned.current = true;
    registerPointing();
  }, [email]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md">
        {status === "loading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification du pointage...</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="text-green-600 mx-auto" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mt-3">
              {message}
            </h2>
          </>
        )}

        {status === "done" && (
          <>
            <CheckCircle2 className="text-blue-600 mx-auto" size={48} />
            <h2 className="text-lg font-semibold text-gray-700 mt-3">
              {message}
            </h2>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="text-red-600 mx-auto" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mt-3">
              {message}
            </h2>
          </>
        )}
      </div>
    </div>
  );
}
