import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn, Input, Label } from "@/components/ui-primitives";
import { usersApi } from "@/lib/api/endpoints/users";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => usersApi.getCurrent().then((r) => r.data),
  });

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const updateProfile = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      usersApi.updateProfile(data).then((r) => r.data),
    onSuccess: () => toast.success("Profile updated"),
    onError: () => toast.error("Failed to update profile"),
  });

  const uploadAvatar = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file).then((r) => r.data),
    onSuccess: (res) => {
      if (res?.url) {
        setAvatarPreview(res.url);
      }
      toast.success("Avatar updated");
    },
    onError: () => toast.error("Failed to upload avatar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
      uploadAvatar.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </DashboardShell>
    );
  }

  const currentUser = (user as any)?.user || user;
  const userName = currentUser?.fullName || currentUser?.name || currentUser?.username || "";
  const userEmail = currentUser?.email || "";

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Account"
        title="Edit Profile"
        description="Update your personal information."
      />
      <Card title="Personal Information">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={
                  avatarPreview ??
                  currentUser?.avatar ??
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`
                }
                alt="Avatar"
                className="w-20 h-20 rounded-full bg-secondary object-cover"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <p className="font-medium">{userName || "User Profile"}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || userName}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || userEmail}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your@email.com"
            />
          </div>
          <Btn type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Btn>
        </form>
      </Card>
    </DashboardShell>
  );
}
