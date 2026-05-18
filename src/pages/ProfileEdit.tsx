import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Mail, Lock, Phone, CheckCircle, XCircle } from "lucide-react";
import {
  profileApi,
  ProfileResponse,
  UpdateNamePayload,
  UpdateEmailPayload,
  UpdatePasswordPayload,
  UpdatePhonePayload,
} from "@/api/api";

type AlertState = { type: "success" | "error"; message: string } | null;

function SectionAlert({ alert }: { alert: AlertState }) {
  if (!alert) return null;
  return (
    <div
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md mt-2 ${
        alert.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-destructive/10 text-destructive border border-destructive/20"
      }`}
    >
      {alert.type === "success" ? (
        <CheckCircle className="w-4 h-4 shrink-0" />
      ) : (
        <XCircle className="w-4 h-4 shrink-0" />
      )}
      {alert.message}
    </div>
  );
}

export default function ProfileEdit() {
  const { user } = useAuth();

  // Profile state
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Section loading & alert state
  const [nameLoading, setNameLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [phoneLoading, setPhoneLoading] = useState(false);

  const [nameAlert, setNameAlert] = useState<AlertState>(null);
  const [emailAlert, setEmailAlert] = useState<AlertState>(null);
  const [passwordAlert, setPasswordAlert] = useState<AlertState>(null);
  const [phoneAlert, setPhoneAlert] = useState<AlertState>(null);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await profileApi.get();
        console.log(res.data);
        setProfile(res.data);
        setFullName(res.data.fullName ?? "");
        setNewEmail(res.data.email ?? "");
        setPhoneNumber(res.data.phoneNumber ?? "");
      } catch {
        // silently fail; user will see empty fields
      } finally {
        setLoadingProfile(false);
      }
    })();
  }, []);

  const handleName = async () => {
    setNameLoading(true);
    setNameAlert(null);
    try {
      const payload: UpdateNamePayload = { fullName };
      const res = await profileApi.updateName(payload);
      setProfile((p) => (p ? { ...p, fullName: res.data.fullName } : p));
      setNameAlert({
        type: "success",
        message: res.data.message ?? "Name updated.",
      });
    } catch (e: any) {
      setNameAlert({
        type: "error",
        message: e.response?.data?.message ?? "Failed to update name.",
      });
    } finally {
      setNameLoading(false);
    }
  };

  const handleEmail = async () => {
    setEmailLoading(true);
    setEmailAlert(null);
    try {
      const payload: UpdateEmailPayload = {
        newEmail,
        currentPassword: emailPassword,
      };
      const res = await profileApi.updateEmail(payload);
      setProfile((p) => (p ? { ...p, email: res.data.email } : p));
      setEmailPassword("");
      setEmailAlert({
        type: "success",
        message: res.data.message ?? "Email updated.",
      });
    } catch (e: any) {
      setEmailAlert({
        type: "error",
        message: e.response?.data?.message ?? "Failed to update email.",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePassword = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: "error", message: "Passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    setPasswordAlert(null);
    try {
      const payload: UpdatePasswordPayload = {
        currentPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
      };
      const res = await profileApi.updatePassword(payload);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordAlert({
        type: "success",
        message: res.data.message ?? "Password updated.",
      });
    } catch (e: any) {
      setPasswordAlert({
        type: "error",
        message: e.response?.data?.message ?? "Failed to update password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhone = async () => {
    setPhoneLoading(true);
    setPhoneAlert(null);
    try {
      const payload: UpdatePhonePayload = { phoneNumber };
      const res = await profileApi.updatePhone(payload);
      setProfile((p) => (p ? { ...p, phoneNumber: res.data.phoneNumber } : p));
      setPhoneAlert({
        type: "success",
        message: res.data.message ?? "Phone updated.",
      });
    } catch (e: any) {
      setPhoneAlert({
        type: "error",
        message: e.response?.data?.message ?? "Failed to update phone.",
      });
    } finally {
      setPhoneLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
        <p className="text-muted-foreground">
          Manage your account details and security settings.
        </p>
      </div>

      <hr />

      {/* Current info banner */}
      <Card>
        <CardContent className="pt-4 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-muted text-2xl font-bold shrink-0">
            {profile?.fullName?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-semibold text-lg">{profile?.fullName}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            {profile?.phoneNumber && (
              <p className="text-sm text-muted-foreground">
                {profile.phoneNumber}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Update Name */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <User className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Full Name</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1">
              <label className="text-xs font-medium">Full Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name here"
              />
            </div>
            <SectionAlert alert={nameAlert} />
            <Button
              onClick={handleName}
              disabled={nameLoading}
              className="w-full"
            >
              {nameLoading ? "Saving..." : "Update Name"}
            </Button>
          </CardContent>
        </Card>

        {/* Update Phone */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Phone Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1">
              <label className="text-xs font-medium">Phone Number</label>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+977980000000"
              />
            </div>
            <SectionAlert alert={phoneAlert} />
            <Button
              onClick={handlePhone}
              disabled={phoneLoading}
              className="w-full"
            >
              {phoneLoading ? "Saving..." : "Update Phone"}
            </Button>
          </CardContent>
        </Card>

        {/* Update Email */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Email Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1">
              <label className="text-xs font-medium">New Email</label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="new@email.com"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium">Current Password</label>
              <Input
                type="password"
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="Confirm with current password"
              />
            </div>
            <SectionAlert alert={emailAlert} />
            <Button
              onClick={handleEmail}
              disabled={emailLoading}
              className="w-full"
            >
              {emailLoading ? "Saving..." : "Update Email"}
            </Button>
          </CardContent>
        </Card>

        {/* Update Password */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <CardTitle className="text-base">Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1">
              <label className="text-xs font-medium">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-xs font-medium">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            <SectionAlert alert={passwordAlert} />
            <Button
              onClick={handlePassword}
              disabled={passwordLoading}
              className="w-full"
            >
              {passwordLoading ? "Saving..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
