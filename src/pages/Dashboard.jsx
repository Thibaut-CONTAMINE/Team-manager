import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import api from "../api/apiClient";

export default function Dashboard() {
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [presences, setPresences] = useState([]);
  const [joursTravailles, setJoursTravailles] = useState(0);
  const [heuresTravailles, setHeuresTravailles] = useState("0h00min");
  const [liveTime, setLiveTime] = useState("");
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    let userEmail = "";

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        userEmail = user.email || user.user?.email || "";
        if (userEmail) setEmail(userEmail);
      } catch (err) {
        console.error("Erreur lors du parsing de l'utilisateur :", err);
      }
    }

    const now = new Date();
    const dateLocale = now.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setDate(dateLocale);

    if (userEmail) {
      fetchPresences(userEmail);
    }
  }, []);

  // Fonction principale
  const fetchPresences = async (email) => {
    try {
      // 1️Récupération utilisateur
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

      if (!user?.id) return;

      // Récupérer les pointages utilisateur
      const res = await api.get(`/pointings?user=${user.id}`);
      const pointings = Array.isArray(res.data) ? res.data : [];

      // Limite sur 7 derniers jours
      const today = new Date();
      const last7Days = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7Days.push(d.toISOString().split("T")[0]);
      }

      // Grouper par jour
      const grouped = {};
      pointings.forEach((p) => {
        const d = new Date(p.date * 1000);
        const key = d.toISOString().split("T")[0];
        if (!grouped[key]) grouped[key] = { arrival: null, departure: null };
        if (p.type === "arrival") grouped[key].arrival = p.date;
        if (p.type === "departure") grouped[key].departure = p.date;
      });

      // Calcul heures + timer live
      let jours = 0;
      let totalHeures = 0;
      let liveStart = null;

      const data = last7Days.map((day) => {
        const entry = grouped[day] || {};
        const formattedDate = new Date(day).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        // Calcul heures travaillées
        let heures = 0;
        if (entry.arrival && entry.departure) {
          const start = new Date(entry.arrival * 1000);
          const end = new Date(entry.departure * 1000);
          heures = (end - start) / (1000 * 60 * 60);
          if (heures > 0) totalHeures += heures;
          jours++;
        } else if (entry.arrival && !entry.departure && day === today.toISOString().split("T")[0]) {
          // arrivée sans départ → timer live
          liveStart = entry.arrival;
          jours++;
        }

        return {
          date: formattedDate,
          arrival: entry.arrival,
          departure: entry.departure,
          status: entry.arrival || entry.departure ? "Présent" : "Absent",
        };
      });

      setPresences(data);
      setJoursTravailles(jours);

      // Format heures totales
      const heures = Math.floor(totalHeures);
      const minutes = Math.round((totalHeures - heures) * 60);
      const formatted = minutes === 0 ? `${heures}h` : `${heures}h${minutes.toString().padStart(2, "0")}min`;
      setHeuresTravailles(formatted);

      // Démarre le timer si on est arrivé sans départ
      if (liveStart) {
        setTimerActive(true);
        const interval = setInterval(() => {
          const diff = Date.now() - liveStart * 1000;
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff / (1000 * 60)) % 60);
          const seconds = Math.floor((diff / 1000) % 60);
          setLiveTime(
            `${hours}h${minutes.toString().padStart(2, "0")}min${seconds
              .toString()
              .padStart(2, "0")}s`
          );
        }, 1000);
        return () => clearInterval(interval);
      } else {
        setTimerActive(false);
      }

    } catch (error) {
      console.error("Erreur lors du chargement des présences :", error);
    }
  };

  const qrValue = email
    ? `http://10.127.86.196:5173/scan-success?email=${encodeURIComponent(email)}`
    : "Chargement...";

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 space-y-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
            <p className="text-gray-500 text-sm mt-1">
              Résumé de votre activité du{" "}
              <span className="font-medium text-gray-700">{date}</span>
            </p>
          </div>

          {/* Statistiques principales */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col justify-center items-center text-center">
              <Calendar size={36} className="text-blue-600 mb-2" />
              <p className="text-gray-500">Jours travaillés / semaine</p>
              <p className="text-3xl font-bold text-blue-700">{joursTravailles}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md flex flex-col justify-center items-center text-center">
              <Clock size={36} className="text-blue-600 mb-2" />
              <p className="text-gray-500">Heures travaillées / semaine</p>
              <p className="text-3xl font-bold text-blue-700">{heuresTravailles}</p>

              {/* Timer en direct */}
              {timerActive && (
                <p className="text-sm text-green-600 mt-1">
                  En cours : {liveTime}
                </p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center text-center">
              <span className="font-medium text-gray-700 mb-2">Mon QR Code</span>
              {email ? (
                <>
                  <QRCodeCanvas value={qrValue} size={150} />
                  <p className="mt-2 text-sm text-gray-500">{email}</p>
                </>
              ) : (
                <p className="text-gray-400">Chargement...</p>
              )}
            </div>
          </div>

          {/* Présences */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={20} className="text-green-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Mes présences récentes
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm text-gray-700">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b text-left">Date</th>
                    <th className="px-4 py-2 border-b text-left">Heure d'arrivée</th>
                    <th className="px-4 py-2 border-b text-left">Heure de départ</th>
                    <th className="px-4 py-2 border-b text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {presences.length > 0 ? (
                    presences.map((p, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2 border-b">{p.date}</td>
                        <td className="px-4 py-2 border-b">
                          {p.arrival
                            ? new Date(p.arrival * 1000).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="px-4 py-2 border-b">
                          {p.departure
                            ? new Date(p.departure * 1000).toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td
                          className={`px-4 py-2 border-b font-medium ${
                            p.status === "Présent"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {p.status}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-gray-400 italic"
                      >
                        Aucune présence enregistrée récemment
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
