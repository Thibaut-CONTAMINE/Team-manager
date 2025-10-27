import { useEffect, useMemo, useState } from "react";
import {
  PlusCircle,
  Edit3,
  Trash2,
  CalendarDays,
  User,
  X,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import api from "../api/apiClient";
import { getAllTasks } from "../api/taskService";

// Helpers
const toSeconds = (yyyy_mm_dd) =>
  Math.floor(new Date(yyyy_mm_dd).getTime() / 1000);
const fromSecondsToInput = (secs) =>
  new Date((typeof secs === "number" ? secs * 1000 : secs))
    .toISOString()
    .split("T")[0];

const STATUS = [
  { key: "todo", title: "À faire" },
  { key: "waiting", title: "En attente" },
  { key: "in-progress", title: "En cours" },
  { key: "done", title: "Terminée" },
];

const statusLabel = (s) =>
  s === "done"
    ? "Terminée"
    : s === "in-progress"
    ? "En cours"
    : s === "waiting"
    ? "En attente"
    : "À faire";

const badgeClass = (s) =>
  s === "done"
    ? "bg-green-100 text-green-700"
    : s === "in-progress"
    ? "bg-blue-100 text-blue-700"
    : s === "waiting"
    ? "bg-orange-100 text-orange-700"
    : "bg-gray-100 text-gray-700";

export default function GestionTaches() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);

  // Modale de détail
  const [selectedTask, setSelectedTask] = useState(null);
  const [detail, setDetail] = useState(null);

  // Pagination 
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Création tâche
  const [newTask, setNewTask] = useState({
    label: "",
    description: "",
    responsible: "",
    due_date: "",
    parent_task: "",
    status: "todo",
  });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [tRes, uRes] = await Promise.all([getAllTasks(), api.get("/users")]);
      setTasks(Array.isArray(tRes.data) ? tRes.data : []);
      setUsers(uRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erreur de chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const parentCandidates = useMemo(() => tasks, [tasks]);

  // Création
  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        label: newTask.label,
        description: newTask.description,
        responsible: parseInt(newTask.responsible),
        due_date: toSeconds(newTask.due_date),
        parent_task: newTask.parent_task ? parseInt(newTask.parent_task) : null,
        status: newTask.status,
      };
      await api.post("/tasks", payload);
      toast.success("Tâche créée");
      setShowForm(false);
      setNewTask({
        label: "",
        description: "",
        responsible: "",
        due_date: "",
        parent_task: "",
        status: "todo",
      });
      fetchInitial();
    } catch (e) {
      console.error(e);
      toast.error("Création impossible");
    }
  };

  // Suppression
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      toast.success("Tâche supprimée");
      setTasks((prev) => prev.filter((t) => t.id !== id));
      closeDetails();
    } catch (e) {
      console.error(e);
      toast.error("Suppression impossible");
    }
  };

  // Ouvrir modale détail
  const openDetails = (task) => {
    setSelectedTask(task);
    setDetail({
      id: task.id,
      label: task.label || "",
      description: task.description || "",
      responsible: task.responsible?.id || "",
      due_date: task.due_date ? fromSecondsToInput(task.due_date) : "",
      parent_task: task.parent_task || "",
      status: task.status || "todo",
    });
  };

  const closeDetails = () => {
    setSelectedTask(null);
    setDetail(null);
  };

  // Sauvegarde modale
  const saveDetails = async (e) => {
    e?.preventDefault?.();
    if (!detail) return;
    try {
      const payload = {
        label: detail.label,
        description: detail.description,
        responsible: parseInt(detail.responsible),
        due_date: detail.due_date ? toSeconds(detail.due_date) : null,
        parent_task: detail.parent_task ? parseInt(detail.parent_task) : null,
        status: detail.status,
      };
      await api.put(`/tasks/${detail.id}`, payload);
      toast.success("Tâche mise à jour");
      closeDetails();
      fetchInitial();
    } catch (e) {
      console.error(e);
      toast.error("Mise à jour impossible");
    }
  };

  // Drag & Drop
  const onDragStart = (taskId) => setDraggedTaskId(taskId);

  const onDropTo = async (statusKey) => {
    if (!draggedTaskId) return;
    const task = tasks.find((t) => t.id === draggedTaskId);
    if (!task || task.status === statusKey) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistic update
    const previous = tasks;
    const updated = tasks.map((t) => (t.id === task.id ? { ...t, status: statusKey } : t));
    setTasks(updated);

    try {
      const payload = {
        label: task.label,
        description: task.description,
        responsible: task.responsible?.id || task.responsible,
        due_date:
          typeof task.due_date === "number"
            ? task.due_date
            : toSeconds(fromSecondsToInput(task.due_date)),
        parent_task: task.parent_task ? parseInt(task.parent_task) : null,
        status: statusKey,
      };
      await api.put(`/tasks/${task.id}`, payload);
      toast.success(`Statut: ${statusLabel(statusKey)}`);
    } catch (e) {
      console.error(e);
      toast.error("Impossible de changer le statut");
      setTasks(previous);
    } finally {
      setDraggedTaskId(null);
    }
  };

  // Sous-tâches
  const subTasks = useMemo(
    () => (selectedTask ? tasks.filter((t) => t.parent_task === selectedTask.id) : []),
    [selectedTask, tasks]
  );

  // Pagination par colonne
  const Column = ({ status }) => {
    const all = tasks.filter((t) => t.status === status.key);
    const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
    const start = (page - 1) * pageSize;
    const items = all.slice(start, start + pageSize);


    return (
      <div
        className="bg-gray-50 rounded-lg p-3 border border-gray-200 min-h-[70vh] flex flex-col"
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => onDropTo(status.key)}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{status.title}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
            {all.length}
          </span>
        </div>

        <div className="space-y-3 flex-1">
          {items.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={() => onDragStart(task.id)}
              onClick={() => openDetails(task)}
              className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow transition"
            >
              <div className="flex items-start justify-between">
                <p className="font-medium text-gray-800">{task.label}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${badgeClass(
                    task.status
                  )}`}
                >
                  {statusLabel(task.status)}
                </span>
              </div>

              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {task.description || "Pas de description"}
              </p>

              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  <span>
                    {task.responsible?.firstname
                      ? `${task.responsible.firstname} ${task.responsible.lastname}`
                      : "Non assigné"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays size={14} />
                  <span>
                    {task.due_date
                      ? new Date(task.due_date * 1000).toLocaleDateString("fr-FR")
                      : "Aucune date"}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center text-xs text-gray-400 py-6">
              Aucune tâche à cette page
            </div>
          )}
        </div>

      </div>
    );
  };

  // Ajout rapide d’une sous-tâche dans la modale
  const [quickSub, setQuickSub] = useState({
    label: "",
    due_date: "",
    responsible: "",
  });
  const addSubtask = async (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    try {
      const payload = {
        label: quickSub.label || "Sous-tâche",
        description: "",
        due_date: quickSub.due_date
          ? toSeconds(quickSub.due_date)
          : toSeconds(fromSecondsToInput(new Date())),
        responsible: quickSub.responsible
          ? parseInt(quickSub.responsible)
          : selectedTask.responsible?.id || users[0]?.id || 1,
        parent_task: selectedTask.id,
        status: "todo",
      };
      await api.post("/tasks", payload);
      toast.success("Sous-tâche ajoutée");
      setQuickSub({ label: "", due_date: "", responsible: "" });
      fetchInitial();
    } catch (e) {
      console.error(e);
      toast.error("Ajout sous-tâche impossible");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Gestion des Tâches</h1>
            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} />
              {showForm ? "Fermer" : "Nouvelle tâche"}
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAddTask}
              className="bg-white p-4 rounded-lg shadow mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Titre de la tâche"
                  value={newTask.label}
                  onChange={(e) =>
                    setNewTask({ ...newTask, label: e.target.value })
                  }
                  className="border rounded p-2"
                  required
                />

                <select
                  value={newTask.responsible}
                  onChange={(e) =>
                    setNewTask({ ...newTask, responsible: e.target.value })
                  }
                  className="border rounded p-2"
                  required
                >
                  <option value="">Attribuer à</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstname} {u.lastname}
                    </option>
                  ))}
                </select>

                <input2
                  type="date"
                  value={newTask.due_date}
                  onChange={(e) =>
                    setNewTask({ ...newTask, due_date: e.target.value })
                  }
                  className="border rounded p-2"
                  required
                />

                <select
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                  className="border rounded p-2"
                >
                  <option value="todo">À faire</option>
                  <option value="waiting">En attente</option>
                  <option value="in-progress">En cours</option>
                  <option value="done">Terminée</option>
                </select>

                <select
                  value={newTask.parent_task}
                  onChange={(e) =>
                    setNewTask({ ...newTask, parent_task: e.target.value })
                  }
                  className="border rounded p-2"
                >
                  <option value="">Aucune tâche parent</option>
                  {parentCandidates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Description (optionnelle)"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  className="border rounded p-2 md:col-span-3"
                />
              </div>

              <div className="text-right mt-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {STATUS.map((s) => (
                <Column key={s.key} status={s} />
              ))}
            </div>
            
          )}
          {/* Pagination globale */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from(
            {
              length: Math.max(
                1,
                Math.ceil(
                  Math.max(
                    ...STATUS.map((s) => tasks.filter((t) => t.status === s.key).length)
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
      </div>

      {detail && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="relative w-full max-w-5xl mx-4">
            <div className="bg-white backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl overflow-hidden">
              <button
                onClick={closeDetails}
                className="absolute top-4 right-4 bg-white/50 hover:bg-white/70 rounded-full p-2 shadow"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                {/* Colonne principale */}
                <form
                  onSubmit={saveDetails}
                  className="lg:col-span-2 p-6 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Edit3 size={18} className="text-blue-600" />
                    <h3 className="font-semibold text-lg text-gray-800">
                      Détail de la tâche
                    </h3>
                  </div>

                  <input
                    className="w-full border rounded-lg p-3 text-lg font-semibold bg-white/60"
                    value={detail.label}
                    onChange={(e) =>
                      setDetail({ ...detail, label: e.target.value })
                    }
                    placeholder="Titre"
                    required
                  />

                  <div>
                    <label className="text-sm text-gray-600">Description</label>
                    <textarea
                      className="w-full border rounded-lg p-3 bg-white/60 mt-1"
                      rows={4}
                      value={detail.description}
                      onChange={(e) =>
                        setDetail({
                          ...detail,
                          description: e.target.value,
                        })
                      }
                      placeholder="Ajouter une description…"
                    />
                  </div>



                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(detail.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>

                {/* Colonne des métadonnées */}
                <div className="border-l border-white/40 p-6 space-y-4 bg-white/20">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Attribuer à
                    </p>
                    <select
                      className="mt-1 w-full border rounded-lg p-2 bg-white/60"
                      value={detail.responsible}
                      onChange={(e) =>
                        setDetail({ ...detail, responsible: e.target.value })
                      }
                      required
                    >
                      <option value="">Attribuer à</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.firstname} {u.lastname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Date
                    </p>
                    <input
                      type="date"
                      className="mt-1 w-full border rounded-lg p-2 bg-white/60"
                      value={detail.due_date || ""}
                      onChange={(e) =>
                        setDetail({ ...detail, due_date: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Statut
                    </p>
                    <select
                      className="mt-1 w-full border rounded-lg p-2 bg-white/60"
                      value={detail.status}
                      onChange={(e) =>
                        setDetail({ ...detail, status: e.target.value })
                      }
                    >
                      <option value="todo">À faire</option>
                      <option value="waiting">En attente</option>
                      <option value="in-progress">En cours</option>
                      <option value="done">Terminée</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Tâche parente
                    </p>
                    <select
                      className="mt-1 w-full border rounded-lg p-2 bg-white/60"
                      value={detail.parent_task || ""}
                      onChange={(e) =>
                        setDetail({ ...detail, parent_task: e.target.value })
                      }
                    >
                      <option value="">Aucune</option>
                      {parentCandidates
                        .filter((t) => t.id !== detail.id)
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
