import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

export default function Reports() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <h1 className="text-2xl font-bold">Rapports</h1>
          <p>Génération et téléchargement de rapports CSV/PDF (à implémenter)</p>
        </div>
      </div>
    </div>
  );
}