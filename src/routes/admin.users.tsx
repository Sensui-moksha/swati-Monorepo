import { createFileRoute } from "@tanstack/react-router";
import { useAdminUsers } from "@/lib/api/hooks";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers();
  const users = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Users</h1>
        <p className="text-sm text-muted-foreground">{data?.meta?.total ?? users.length} registered users</p>
      </div>
      <Card title="All users">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-secondary rounded animate-pulse" />)}</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr className="border-b border-rule"><th className="text-left py-2">Name</th><th className="text-left">Email</th><th className="text-left">Role</th><th className="text-left">Joined</th><th className="text-left">Status</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-rule/60 hover:bg-secondary/30">
                  <td className="py-3">{u.name}</td>
                  <td className="text-muted-foreground">{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td className="text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><StatusBadge status={u.emailVerified ? "Active" : "Pending"} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
