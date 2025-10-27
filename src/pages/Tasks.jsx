import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { ClipboardList, CheckCircle2, Loader2, Hourglass } from "lucide-react";
import { getUserById } from "../api/userService";
import api from "../api/apiClient";
import toast from "react-hot-toast";

// Helpers
const toSeconds = (yyyy_mm_dd) =>
  Math.floor(new Date(yyyy_mm_dd).getTime() / 1000);

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const pageSize = 10;

  const STATUS = [
    { key: "todo", title: "À faire" },
    { key: "waiting", title: "En attente" },
    { key: "in-progress", title: "En cours" },
    { key: "done", title: "Terminée" },
  ];

  useEffect(() => {
    const id =
      sessionStorage.getItem("userId") ||
      (localStorage.getItem("user") &&
        JSON.parse(localStorage.getItem("user")).user?.id);

    if (!id) {
      setLoading(false);
      return;
    }

    getUserById(id)
      .then((res) => {
        const userData = res.data;
        setUser(userData);
        setTasks(Array.isArray(userData.tasks) ? userData.tasks : []);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des tâches :", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo":
        return <ClipboardList className="text-gray-500" size={20} title="À faire" />;
      case "waiting":
        return <Hourglass className="text-orange-500" size={20} title="En attente" />;
      case "in-progress":
        return <Loader2 className="text-blue-500 animate-spin" size={20} title="En cours" />;
      case "done":
        return <CheckCircle2 className="text-green-600" size={20} title="Terminé" />;
      default:
        return <ClipboardList className="text-gray-400" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-200 text-gray-700";
      case "waiting":
        return "bg-orange-100 text-orange-700";
      case "in-progress":
        return "bg-blue-100 text-blue-700";
      case "done":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "todo":
        return "À faire";
      case "waiting":
        return "En attente";
      case "in-progress":
        return "En cours";
      case "done":
        return "Terminée";
      default:
        return "Inconnu";
    }
  };

  //  Drag & Drop
  const onDragStart = (taskId) => setDraggedTaskId(taskId);

  const onDropTo = async (statusKey) => {
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === statusKey) {
      setDraggedTaskId(null);
      return;
    }

    const previous = [...tasks];
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, status: statusKey } : t
    );
    setTasks(updated);

    try {
      const payload = {
        label: task.label,
        description: task.description,
        responsible:
          task.responsible && typeof task.responsible === "object"
            ? task.responsible.id
            : task.responsible
            ? parseInt(task.responsible)
            : user?.id || null, // garde le responsable actuel
        due_date: task.due_date
          ? typeof task.due_date === "number"
            ? task.due_date
            : toSeconds(task.due_date)
          : null,
        parent_task: task.parent_task ? parseInt(task.parent_task) : null,
        status: statusKey,
      };

      await api.put(`/tasks/${task.id}`, payload);
      toast.success(`Tâche déplacée vers "${getStatusLabel(statusKey)}"`);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de déplacer la tâche");
      setTasks(previous);
    } finally {
      setDraggedTaskId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Mes Tâches</h1>

          {loading ? (
            <p className="text-gray-500">Chargement de vos tâches...</p>
          ) : tasks.length === 0 ? (
            <p className="text-gray-500">
              {user
                ? "Aucune tâche ne vous est assignée pour le moment."
                : "Impossible de charger vos informations utilisateur."}
            </p>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow">
              {/* Colonnes des statuts */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STATUS.map((s) => {
                  const filtered = tasks.filter((t) => t.status === s.key);
                  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
                  const start = (page - 1) * pageSize;
                  const items = filtered.slice(start, start + pageSize);

                  return (
                    <div
                      key={s.key}
                      className="bg-gray-50 p-3 rounded-lg border border-gray-200 min-h-[60vh]"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropTo(s.key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-sm">{s.title}</h3>
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">
                          {filtered.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {items.map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => onDragStart(task.id)}
                            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition bg-white cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-800 truncate">
                                {task.label || "Tâche sans titre"}
                              </h3>
                              {getStatusIcon(task.status)}
                            </div>

                            <p className="text-gray-600 text-sm mb-3">
                              {task.description || "Aucune description"}
                            </p>

                            <div
                              className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {getStatusLabel(task.status)}
                            </div>

                            <div className="flex justify-between text-sm text-gray-500 mt-3">
                              <span>
                                {task.due_date
                                  ? new Date(task.due_date * 1000).toLocaleDateString("fr-FR")
                                  : "Pas de date"}
                              </span>
                              <span>
                                {task.responsible?.firstname
                                  ? `${task.responsible.firstname} ${task.responsible.lastname}`
                                  : ""}
                              </span>
                            </div>
                          </div>
                        ))}

                        {items.length === 0 && (
                          <p className="text-center text-gray-400 text-sm py-6">
                            Aucune tâche à cette page
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination globale */}
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from(
                  {
                    length: Math.max(
                      1,
                      Math.ceil(
                        Math.max(
                          ...STATUS.map(
                            (s) => tasks.filter((t) => t.status === s.key).length
                          )
                        ) / pageSize
                      )
                    ),
                  },
                  (_, i) => i + 1
                ).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 rounded border text-sm ${
                      p === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
