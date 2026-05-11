import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin, isStaff } = useAuth();
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/'}>
                  <Link to="/">Dashboard</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === '/parts'}>
                  <Link to="/parts">Parts</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {(isStaff || isAdmin) && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/sales'}>
                    <Link to="/sales">Sales</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === '/users'}>
                    <Link to="/users">Users</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarFooter>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            <button onClick={logout} className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-input hover:bg-accent transition">
              Logout
            </button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
