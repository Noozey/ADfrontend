import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { Dashboard } from "./pages/Dashboard";
import { PartsPage } from "./pages/PartsPage";
import { UsersPage } from "./pages/UsersPage";
import { SalesPage } from "./pages/SalesPage";
import { Layout } from "./components/Layout";
import "./style.css";
import FinancialReport from "./pages/Financial";
import ProfileEdit from "./pages/ProfileEdit";

function ProtectedRoute({
  children,
  roles,
}: {
  children: any;
  roles?: string[];
}) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.some((role) => user.roles.includes(role)))
    return <Navigate to="/" />;
  return <Layout>{children}</Layout>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parts"
            element={
              <ProtectedRoute>
                <PartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <SalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financialreport"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <FinancialReport />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfileEdit />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
