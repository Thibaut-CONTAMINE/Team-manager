import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Team from "./pages/Team";
import Reports from "./pages/Reports";
import Tasks from "./pages/Tasks";
import Absences from "./pages/Absences";
import ScanSuccess from "./pages/ScanSuccess";
import Administration from "./pages/Administration";
import GestionEquipes from "./pages/GestionEquipes";
import Statistiques from "./pages/Statistiques";
import Agenda from "./pages/Agenda";
import GestionTaches from "./pages/GestionTaches";

// Composants
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

export default function App() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.role?.name) setUserRole(parsed.role.name.toLowerCase());
        else if (parsed.user?.role?.name)
          setUserRole(parsed.user.role.name.toLowerCase());
        else setUserRole("employee");
      } catch (e) {
        console.error("Erreur parsing utilisateur :", e);
        setUserRole("employee");
      }
    } else {
      setUserRole("employee");
    }
  }, []);

  if (!userRole) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Chargement de l’application...
      </div>
    );
  }

  return (
    <>
      {/* Ajout du Toaster global */}
            <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "10px",
            padding: "12px 16px",
            color: "#fff",
            fontWeight: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          success: {
            style: {
              background: "#16a34a",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#16a34a",
            },
          },
          error: {
            style: {
              background: "#dc2626",
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#dc2626",
            },
          },
        }}
      />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <Team />
            </ProtectedRoute>
          }
        />
        <Route path="/scan-success" element={<ScanSuccess />} />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/absences"
          element={
            <ProtectedRoute>
              <Absences />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agenda"
          element={
            <ProtectedRoute>
              <Agenda />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistiques"
          element={
            <ProtectedRoute>
              <Statistiques />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-management"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["manager", "admin"]} userRole={userRole}>
                <GestionEquipes />
              </RoleRoute>
            </ProtectedRoute>
          }
          
        />
        <Route
          path="/gestion-taches"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["manager", "admin"]} userRole={userRole}>
                <GestionTaches />
              </RoleRoute>
            </ProtectedRoute>
          }
          
        />
        <Route
          path="/administration"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]} userRole={userRole}>
                <Administration />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
