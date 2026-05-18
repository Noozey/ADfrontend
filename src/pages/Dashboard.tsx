import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StaffDashboard from "./StaffDashboard";

export function Dashboard() {
  const { user } = useAuth();
  const isStaffOrAdmin = user?.roles?.some((r) => r === "Staff" || r === "Admin");

  const userInfo = (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Your Roles</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {user?.roles?.map((role) => (
              <Badge key={role} variant={role === "Admin" ? "destructive" : role === "Staff" ? "default" : "secondary"}>{role}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle></CardHeader>
        <CardContent><p className="text-lg font-semibold">{user?.email}</p></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium text-muted-foreground">Full Name</CardTitle></CardHeader>
        <CardContent><p className="text-lg font-semibold">{user?.name}</p></CardContent>
      </Card>
    </div>
  );

  if (isStaffOrAdmin) {
    return <StaffDashboard userInfo={userInfo} />;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your vehicles, appointments, and more.</p>
      </div>
      {userInfo}
      <p className="text-muted-foreground">Select a page from the sidebar to get started.</p>
    </div>
  );
}
