import { useAuth } from "../context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, ShieldCheck, User } from "lucide-react";

const roleIcon: Record<string, React.ReactNode> = {
  Admin: <ShieldCheck className="h-3.5 w-3.5" />,
  Staff: <Package className="h-3.5 w-3.5" />,
  Customer: <User className="h-3.5 w-3.5" />,
};

const roleVariant: Record<string, "default" | "secondary" | "outline"> = {
  Admin: "default",
  Staff: "secondary",
  Customer: "outline",
};

export function Dashboard() {
  const { user } = useAuth();
  const roles: string[] = user?.roles ?? [];
  const displayName = user?.fullName || user?.email || "User";

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here's an overview of your account.
        </p>
      </div>

      <Separator />

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Account card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Account</CardDescription>
            <CardTitle className="text-base truncate">{displayName}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </CardContent>
        </Card>

        {/* Roles card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Roles</CardDescription>
            <CardTitle className="text-base">Permissions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role) => (
                <Badge
                  key={role}
                  variant={roleVariant[role] ?? "outline"}
                  className="flex items-center gap-1"
                >
                  {roleIcon[role] ?? null}
                  {role}
                </Badge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">
                No roles assigned
              </span>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
