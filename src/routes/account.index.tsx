import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, KpiCard, Btn } from "@/components/ui-primitives";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/endpoints/users";
import { profileApi } from "@/lib/api/endpoints/profile";

export const Route = createFileRoute("/account/")({
  component: AccountIndexPage,
});

function AccountIndexPage() {
  const { data: userResponse, isLoading: isLoadingUser } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => usersApi.getCurrent().then((r: any) => r?.data?.user || r?.data || r),
  });

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery({
    queryKey: ["readingStats"],
    queryFn: () => profileApi.getReadingStats().then((r) => r.data),
  });

  const { data: subscriptionResponse, isLoading: isLoadingSub } = useQuery({
    queryKey: ["subscriptionInfo"],
    queryFn: () => profileApi.getSubscription().then((r) => r.data),
  });

  const isLoading = isLoadingUser || isLoadingStats || isLoadingSub;

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          <div className="h-20 bg-secondary rounded animate-pulse" />
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="h-24 bg-secondary rounded animate-pulse" />
            <div className="h-24 bg-secondary rounded animate-pulse" />
            <div className="h-24 bg-secondary rounded animate-pulse" />
          </div>
        </div>
      </DashboardShell>
    );
  }

  const user = userResponse;
  const stats = statsResponse;
  const subscription = subscriptionResponse;

  // Format date nicely
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "Unknown";

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your account overview and quick settings."
        actions={
          <Link to="/account/profile">
            <Btn variant="outline">Edit profile</Btn>
          </Link>
        }
      />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <KpiCard label="Books read" value={stats?.booksRead?.toString() || "0"} />
        <KpiCard label="Highlights" value={stats?.highlightsCount?.toString() || "0"} />
        <KpiCard label="Subscription" value={subscription?.tier || "Free"} />
      </div>
      <Card title="Personal information">
        <div className="flex gap-6 items-start">
          <div className="w-20 h-20 bg-secondary rounded-full flex-shrink-0" />
          <div className="flex-1">
            <div className="text-xl font-serif mb-1">
              {user?.fullName || user?.name || "Unknown"}
            </div>
            <div className="text-sm text-muted-foreground">{user?.email || ""}</div>
            <div className="mt-6 space-y-2 text-sm border-t border-rule/50 pt-4">
              <div className="flex justify-between">
                <span>Member since</span>
                <span className="text-muted-foreground">{memberSince}</span>
              </div>
              <div className="flex justify-between">
                <span>Role</span>
                <span className="text-muted-foreground capitalize">{user?.role || "User"}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
