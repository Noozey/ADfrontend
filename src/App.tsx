import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage, RegisterPage } from "./pages/AuthPages";
import { Dashboard } from "./pages/Dashboard";
import { PartsPage } from "./pages/PartsPage";
import { CustomersPage } from "./pages/CustomersPage";
import { CustomerRegistrationPage } from "./pages/CustomerRegistrationPage";
import { VendorsPage } from "./pages/VendorsPage";
import { UsersPage } from "./pages/UsersPage";
import { SalesPage } from "./pages/SalesPage";
import { Layout } from "./components/Layout";
import "./style.css";
import FinancialReport from "./pages/Financial";
import CustomerReports from "./pages/CustomerReports";
import PartRequestsPage from "./pages/PartRequestsPage";
import InvoicesPage from "./pages/InvoicesPage";
import ManageAppointments from "./pages/ManageAppointments";
import { MyVehiclesPage } from "./pages/customer/MyVehiclesPage";
import { BuyPartsPage } from "./pages/customer/BuyPartsPage";
import { MyInvoicesPage } from "./pages/customer/MyInvoicesPage";
import { BookAppointmentPage } from "./pages/customer/BookAppointmentPage";
import { MyAppointmentsPage } from "./pages/customer/MyAppointmentsPage";
import { RequestPartPage } from "./pages/customer/RequestPartPage";
import { MyRequestsPage } from "./pages/customer/MyRequestsPage";
import { ReviewsPage } from "./pages/customer/ReviewsPage";
import ProfileEdit from "./pages/ProfileEdit";
import { LowStockNotifications } from "./pages/LowStockNotification";
import { VendorPurchasePage } from "./pages/PurchaseInvoice";

function ProtectedRoute({
  children,
  roles,
}: {
  children: any;
  roles?: string[];
}) {
  const { user, isAuthenticated, isCustomer, isStaff, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && user && !roles.some((role) => user.roles.includes(role))) {
    if (isCustomer) return <Navigate to="/my-vehicles" />;
    if (isStaff) return <Navigate to="/sales" />;
    return <Navigate to="/users" />;
  }
  return <Layout>{children}</Layout>;
}

function HomeRedirect() {
  const { isAuthenticated, isCustomer } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isCustomer) return <Navigate to="/my-vehicles" />;
  return <Dashboard />;
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
                <HomeRedirect />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-vehicles"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <MyVehiclesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buy-parts"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <BuyPartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-invoices"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <MyInvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-appointments"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <MyAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/request-part"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <RequestPartPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <MyRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews"
            element={
              <ProtectedRoute roles={["Customer"]}>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parts"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <PartsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <CustomersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers/register"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <CustomerRegistrationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendors"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <VendorsPage />
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
            path="/customerreports"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <CustomerReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/part-requests"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <PartRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute roles={["Staff", "Admin"]}>
                <ManageAppointments />
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
            path="/purchase"
            element={
              <ProtectedRoute roles={["Admin"]}>
                <VendorPurchasePage />
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
          <Route
            path="/notification"
            element={
              <ProtectedRoute>
                <LowStockNotifications />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
