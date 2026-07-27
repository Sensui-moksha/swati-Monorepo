import { createFileRoute } from "@tanstack/react-router";
import { useAdminUsers } from "@/lib/api/hooks";
import { adminApi } from "@/lib/api/endpoints/adminApi";
import { Card, StatusBadge } from "./admin.index";
import { Btn, Input, Label } from "@/components/ui-primitives";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useAdminUsers();
  const users = data?.data ?? [];

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({
    id: "",
    email: "",
    username: "",
    fullName: "",
    password: "",
    role: "user",
  });

  const createUserMutation = useMutation({
    mutationFn: (newUserData: any) => adminApi.createUser(newUserData),
    onSuccess: () => {
      toast.success("User created successfully");
      setModalMode(null);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to create user"),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, updateData }: { id: string; updateData: any }) => adminApi.updateUser(id, updateData),
    onSuccess: () => {
      toast.success("User updated successfully");
      setModalMode(null);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || err?.message || "Failed to update user"),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      isActive ? adminApi.deactivateUser(id) : adminApi.activateUser(id),
    onSuccess: (_, variables) => {
      toast.success(variables.isActive ? "User suspended" : "User activated");
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const handleOpenCreate = () => {
    setFormData({
      id: "",
      email: "",
      username: "",
      fullName: "",
      password: "Password123!",
      role: "user",
    });
    setModalMode("create");
  };

  const handleOpenEdit = (user: any) => {
    const id = user._id || user.id;
    setFormData({
      id,
      email: user.email || "",
      username: user.username || "",
      fullName: user.fullName || user.name || "",
      password: "",
      role: user.role || "user",
    });
    setModalMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "create") {
      if (!formData.email || !formData.username || !formData.password) {
        toast.error("Please fill in email, username, and password");
        return;
      }
      createUserMutation.mutate({
        email: formData.email,
        username: formData.username,
        fullName: formData.fullName || formData.username,
        password: formData.password,
        role: formData.role,
      });
    } else if (modalMode === "edit") {
      updateUserMutation.mutate({
        id: formData.id,
        updateData: {
          fullName: formData.fullName,
          email: formData.email,
          role: formData.role,
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl">Users Management</h1>
          <p className="text-sm text-muted-foreground">{data?.meta?.total ?? users.length} registered users in database</p>
        </div>
        <Btn onClick={handleOpenCreate}>+ Create New User</Btn>
      </div>

      {/* User Create/Edit Form Card */}
      {modalMode && (
        <Card title={modalMode === "create" ? "Create New User" : `Edit User: ${formData.fullName || formData.username}`}>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={modalMode === "edit"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
                >
                  <option value="user">User / Reader</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>

            {modalMode === "create" && (
              <div className="space-y-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Btn type="submit" disabled={createUserMutation.isPending || updateUserMutation.isPending}>
                {createUserMutation.isPending || updateUserMutation.isPending ? "Saving..." : modalMode === "create" ? "Create User" : "Update User"}
              </Btn>
              <Btn type="button" variant="outline" onClick={() => setModalMode(null)}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      <Card title="All Registered Users">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-secondary rounded animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase text-muted-foreground bg-secondary/50 border-b border-rule">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rule/60">
                {users.map((u: any) => {
                  const id = u._id || u.id;
                  const isActive = u.isActive ?? true;

                  return (
                    <tr key={id || u.email} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium">{u.fullName || u.name || u.username || "User"}</div>
                        <div className="text-xs text-muted-foreground">@{u.username || "user"}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.role || "user"} />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={isActive ? "Active" : "Suspended"} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Btn size="sm" variant="outline" onClick={() => handleOpenEdit(u)}>
                            Edit
                          </Btn>
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatusMutation.mutate({ id, isActive })}
                            className={isActive ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"}
                          >
                            {isActive ? "Suspend" : "Activate"}
                          </Btn>
                          <Btn
                            size="sm"
                            variant="outline"
                            onClick={() => setUserToDelete(u)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {userToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-paper border border-rule rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-rule pb-3">
                <h3 className="font-serif text-lg font-semibold text-destructive">Confirm Deletion</h3>
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  className="text-muted-foreground hover:text-foreground text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-foreground">
                Are you sure you want to delete user <span className="font-semibold">{userToDelete.email || userToDelete.username}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <Btn variant="outline" onClick={() => setUserToDelete(null)}>
                  Cancel
                </Btn>
                <Btn
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    const userId = userToDelete.id || userToDelete._id;
                    deleteUserMutation.mutate(userId, {
                      onSuccess: () => setUserToDelete(null),
                      onError: () => setUserToDelete(null),
                    });
                  }}
                  disabled={deleteUserMutation.isPending}
                >
                  {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
                </Btn>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
