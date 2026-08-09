import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn, Input, Label } from "@/components/ui-primitives";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints/auth";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/security")({
  component: AccountSecurityPage,
});

function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const changePassword = useMutation({
    mutationFn: () =>
      authApi
        .changePassword({
          currentPassword,
          newPassword,
          newPasswordConfirm,
        })
        .then((r) => r.data),
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to change password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      toast.error("New passwords do not match");
      return;
    }
    changePassword.mutate();
  };

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Account"
        title="Security"
        description="Manage password and account security settings."
      />
      <div className="space-y-6 max-w-lg">
        <Card title="Change Password">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPasswordConfirm">Confirm New Password</Label>
              <Input
                id="newPasswordConfirm"
                type="password"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Btn type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </Btn>
          </form>
        </Card>

        <Card title="Active Sessions & Security">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-rule/50">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">Logged in via Web Browser</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                Active
              </span>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-3">
                If you suspect unauthorized access, you can log out from all other active sessions.
              </p>
              <Btn
                variant="outline"
                size="sm"
                onClick={() =>
                  authApi
                    .revokeAllSessions()
                    .then(() => toast.success("Revoked all other sessions"))
                }
              >
                Log out other sessions
              </Btn>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
