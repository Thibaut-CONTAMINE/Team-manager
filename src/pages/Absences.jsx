import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { CalendarDays, FileText, Clock } from "lucide-react";

export default function Absences() {
  const absences = [
    { id: 1, type: "Congé payé", start: "01/10/2025", end: "05/10/2025", status: "Validé" },
    { id: 2, type: "Arrêt maladie", start: "12/09/2025", end: "14/09/2025", status: "Justifié" },
    { id: 3, type: "Congé parental", start: "15/11/2025", end: "30/11/2025", status: "En attente" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Validé":
        return "text-green-700 bg-green-100";
      case "Justifié":
        return "text-blue-700 bg-blue-100";
      default:
        return "text-yellow-700 bg-yellow-100";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4 text-gray-800">Mes Absences</h1>

          <div className="bg-white rounded-lg shadow p-4">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50 text-left text-gray-600">
                <tr>
                  <th className="p-3">Type</th>
                  <th className="p-3">Date de début</th>
                  <th className="p-3">Date de fin</th>
                  <th className="p-3">Statut</th>
                </tr>
              </thead>
              <tbody>
                {absences.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 flex items-center gap-2">
                      <CalendarDays size={16} className="text-blue-600" /> {a.type}
                    </td>
                    <td className="p-3">{a.start}</td>
                    <td className="p-3">{a.end}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
