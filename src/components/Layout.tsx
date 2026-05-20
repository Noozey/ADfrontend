import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/sidebar";
import { useLowStockCount } from "@/hooks/useLowStockCount";
import {
  LayoutDashboard,
  CarFront,
  ShoppingBag,
  ReceiptText,
  CalendarClock,
  ClipboardList,
  MessageSquareText,
  Users,
  Wrench,
  BadgeDollarSign,
  Truck,
  FileText,
  Bell,
  UserCog,
  UserCircle2,
} from "lucide-react";

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  activePaths?: string[];
  end?: boolean;
  badge?: React.ReactNode;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isStaff, isCustomer } = useAuth();
  const location = useLocation();
  const lowStockCount = useLowStockCount(isAdmin);

  const isActive = (to: string, activePaths: string[] = [], exact = false) =>
    exact
      ? location.pathname === to || activePaths.includes(location.pathname)
      : location.pathname === to ||
        activePaths.some(
          (path) =>
            location.pathname === path ||
            location.pathname.startsWith(`${path}/`),
        );

  const overviewItems: NavItem[] = isCustomer
    ? [
        { to: "/my-vehicles", label: "My Vehicles", icon: <CarFront className="h-4 w-4" /> },
        { to: "/profile", label: "Profile", icon: <UserCircle2 className="h-4 w-4" />, end: true },
      ]
    : [
        { to: "/", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, end: true },
        { to: "/profile", label: "Profile", icon: <UserCircle2 className="h-4 w-4" />, end: true },
      ];

  const customerItems: NavItem[] = [
    { to: "/buy-parts", label: "Buy Parts", icon: <ShoppingBag className="h-4 w-4" /> },
    { to: "/my-invoices", label: "Invoices", icon: <ReceiptText className="h-4 w-4" /> },
    { to: "/book-appointment", label: "Book Appointment", icon: <CalendarClock className="h-4 w-4" /> },
    { to: "/my-appointments", label: "Appointments", icon: <ClipboardList className="h-4 w-4" /> },
    { to: "/request-part", label: "Request Part", icon: <Wrench className="h-4 w-4" /> },
    { to: "/my-requests", label: "My Requests", icon: <FileText className="h-4 w-4" /> },
    { to: "/reviews", label: "Reviews", icon: <MessageSquareText className="h-4 w-4" /> },
  ];

  const operationsItems: NavItem[] = [
    { to: "/sales", label: "Sales", icon: <BadgeDollarSign className="h-4 w-4" /> },
    { to: "/appointments", label: "Appointments", icon: <CalendarClock className="h-4 w-4" /> },
    { to: "/invoices", label: "Invoices", icon: <ReceiptText className="h-4 w-4" /> },
    { to: "/parts", label: "Parts", icon: <Wrench className="h-4 w-4" /> },
    { to: "/customers", label: "Customers", icon: <Users className="h-4 w-4" />, activePaths: ["/customers/register"] },
    { to: "/customers/register", label: "Register Customer", icon: <UserCog className="h-4 w-4" /> },
    { to: "/reviews/all", label: "Reviews", icon: <MessageSquareText className="h-4 w-4" /> },
    { to: "/customerreports", label: "Customer Reports", icon: <FileText className="h-4 w-4" /> },
  ];

  const adminItems: NavItem[] = [
    { to: "/part-requests", label: "Part Requests", icon: <ClipboardList className="h-4 w-4" /> },
    { to: "/vendors", label: "Vendors", icon: <Truck className="h-4 w-4" /> },
    { to: "/users", label: "Users", icon: <Users className="h-4 w-4" /> },
    { to: "/purchase", label: "Purchase", icon: <ShoppingBag className="h-4 w-4" /> },
    { to: "/financialreport", label: "Finance", icon: <BadgeDollarSign className="h-4 w-4" /> },
    {
      to: "/notification",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      badge: lowStockCount > 0 ? lowStockCount : null,
    },
  ];

  const renderItem = (item: NavItem) => (
    <SidebarMenuItem key={item.to}>
      <SidebarMenuButton
        asChild
        isActive={isActive(item.to, item.activePaths ?? [], item.end)}
      >
        <Link to={item.to} className="flex w-full items-center justify-between gap-3">
          <span className="flex items-center gap-3">
            {item.icon}
            {item.label}
          </span>
          {item.badge ? (
            <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
              {item.badge}
            </span>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <div className="flex h-screen w-full">
      <Sidebar>
        <SidebarContent>
          <SidebarHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-base font-semibold leading-none">Vehicle Parts</h2>
                <p className="mt-1 text-xs text-muted-foreground">Service and inventory hub</p>
              </div>
            </div>
          </SidebarHeader>

          <Separator />

          <div className="flex-1 overflow-y-auto py-2">
            <SidebarGroup>
              <SidebarGroupLabel>Overview</SidebarGroupLabel>
              <SidebarMenu>{overviewItems.map(renderItem)}</SidebarMenu>
            </SidebarGroup>

            {isCustomer && (
              <SidebarGroup>
                <SidebarGroupLabel>Customer</SidebarGroupLabel>
                <SidebarMenu>{customerItems.map(renderItem)}</SidebarMenu>
              </SidebarGroup>
            )}

            {(isStaff || isAdmin) && (
              <SidebarGroup>
                <SidebarGroupLabel>Operations</SidebarGroupLabel>
                <SidebarMenu>{operationsItems.map(renderItem)}</SidebarMenu>
              </SidebarGroup>
            )}

            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarMenu>{adminItems.map(renderItem)}</SidebarMenu>
              </SidebarGroup>
            )}
          </div>

          <SidebarFooter>
            <div className="rounded-lg border border-border bg-background/70 p-3 shadow-sm">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-1 break-words text-sm font-medium">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-input px-3 py-2 text-sm transition hover:bg-accent"
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
