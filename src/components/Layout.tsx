import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isStaff, isCustomer } = useAuth();
  const location = useLocation();

  return (
    <div className="flex h-screen w-full">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <h2 className="text-lg font-bold px-3">Vehicle Parts</h2>
          </SidebarHeader>
          <Separator />
          <SidebarGroup>
            <SidebarMenu>
              {isCustomer && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/my-vehicles"}>
                      <Link to="/my-vehicles">My Vehicles</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/buy-parts"}>
                      <Link to="/buy-parts">Buy Parts</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/my-invoices"}>
                      <Link to="/my-invoices">Invoices</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/book-appointment"}>
                      <Link to="/book-appointment">Book Appointment</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/my-appointments"}>
                      <Link to="/my-appointments">Appointments</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/request-part"}>
                      <Link to="/request-part">Request Part</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/my-requests"}>
                      <Link to="/my-requests">My Requests</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={location.pathname === "/reviews"}>
                      <Link to="/reviews">Reviews</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
              {!isCustomer && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                    <Link to="/">Dashboard</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/profile"}>
                  <Link to="/Profile">Profile</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/parts"}
                  >
                    <Link to="/parts">Parts</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/customers/register"}
                  >
                    <Link to="/customers/register">Register Customer</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/customers"}
                  >
                    <Link to="/customers">Customers</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/sales"}
                  >
                    <Link to="/sales">Sales</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/appointments"}
                  >
                    <Link to="/appointments">Appointments</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/invoices"}
                  >
                    <Link to="/invoices">Invoices</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/vendors"}
                  >
                    <Link to="/vendors">Vendors</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/users"}
                  >
                    <Link to="/users">Users</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/customerreports"}
                  >
                    <Link to="/customerreports">Customers</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === "/financialreport"}
                  >
                    <Link to="/financialreport">Finance</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarFooter>
            <p className="text-sm text-muted-foreground break-words">
              {user?.email}
            </p>
            <button
              onClick={logout}
              className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-input hover:bg-accent transition"
            >
              Logout
            </button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
