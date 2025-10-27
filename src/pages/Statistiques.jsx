import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { jsPDF } from "jspdf";

export default function Statistiques() {
  const [period, setPeriod] = useState("mois");

  const monthlyData = {
    tachesEffectuees: 85,
    tachesEnAttente: 15,
    absences: 4,
    heuresTravaillees: 184,
  };

  const weeklyData = {
    tachesEffectuees: 20,
    tachesEnAttente: 5,
    absences: 1,
    heuresTravaillees: 45,
  };

  const data = period === "mois" ? monthlyData : weeklyData;

  const chartData = [
    { name: "Tâches effectuées", valeur: data.tachesEffectuees },
    { name: "Tâches en attente", valeur: data.tachesEnAttente },
    { name: "Absences", valeur: data.absences },
    { name: "Heures travaillées", valeur: data.heuresTravaillees },
  ];

  // Fonction export CSV
  const exportToCSV = () => {
    const headers = ["Indicateur, Valeur"];
    const rows = chartData.map((item) => `${item.name}, ${item.valeur}`);
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `rapport-statistiques-${period}.csv`;
    link.click();
  };

  // Fonction export PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Rapport de Statistiques", 14, 20);
    doc.setFontSize(12);
    doc.text(`Période : ${period === "mois" ? "Mois" : "Semaine"}`, 14, 30);

    // Tableau des données
    let y = 45;
    chartData.forEach((item) => {
      doc.text(`${item.name} : ${item.valeur}`, 20, y);
      y += 10;
    });

    doc.save(`rapport-statistiques-${period}.pdf`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Statistiques</h1>

          <div className="bg-white p-6 rounded-lg shadow">
            {/* Ligne avec texte + toggle période */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                Vue d’ensemble des performances, absences et heures travaillées pour la période sélectionnée.
              </p>

              {/* Toggle switch Mois / Semaine */}
              <div className="flex border rounded-md overflow-hidden text-sm shadow-sm">
                <button
                  onClick={() => setPeriod("mois")}
                  className={`px-4 py-1 transition-colors duration-200 ${
                    period === "mois"
                      ? "bg-gray-200 text-gray-800 font-semibold"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Mois
                </button>
                <button
                  onClick={() => setPeriod("semaine")}
                  className={`px-4 py-1 transition-colors duration-200 border-l ${
                    period === "semaine"
                      ? "bg-gray-200 text-gray-800 font-semibold"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Semaine
                </button>
              </div>
            </div>

            {/* Cartes d’indicateurs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 border rounded-lg text-center flex flex-col justify-center">
                <h2 className="font-semibold">Tâches effectuées</h2>
                <p className="text-green-600 text-2xl mt-2">
                  {data.tachesEffectuees}%
                </p>
              </div>

              <div className="p-4 border rounded-lg text-center flex flex-col justify-center">
                <h2 className="font-semibold">Tâches en attente</h2>
                <p className="text-yellow-600 text-2xl mt-2">
                  {data.tachesEnAttente}%
                </p>
              </div>

              <div className="p-4 border rounded-lg text-center flex flex-col justify-center">
                <h2 className="font-semibold">Heures travaillées</h2>
                <p className="text-blue-600 text-2xl mt-2">
                  {data.heuresTravaillees} h
                </p>
              </div>

              <div className="p-4 border rounded-lg text-center flex flex-col justify-center">
                <h2 className="font-semibold">Absences</h2>
                <p className="text-red-600 text-2xl mt-2">
                  {data.absences} jours
                </p>
              </div>
            </div>

            {/* Graphique en barres */}
            <div className="h-[350px] mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="valeur"
                    fill="#345eb2"
                    barSize={45}
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Boutons d’export */}
            <div className="flex justify-end gap-3">
              <button
                onClick={exportToCSV}
                className="bg-blue-100 text-blue-700 border border-blue-500 px-4 py-2 rounded-md hover:bg-blue-200 transition"
              >
                Exporter en CSV
              </button>

              <button
                onClick={exportToPDF}
                className="bg-red-100 text-red-700 border border-red-500 px-4 py-2 rounded-md hover:bg-red-200 transition"
              >
                Exporter en PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
