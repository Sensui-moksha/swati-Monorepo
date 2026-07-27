import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn, StatusPill } from "@/components/ui-primitives";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/endpoints/profile";
import { toast } from "sonner";

export const Route = createFileRoute("/account/subscription")({
  component: AccountSubscriptionPage,
});

function AccountSubscriptionPage() {
  const { data: subData, isLoading } = useQuery({
    queryKey: ["userSubscription"],
    queryFn: () => profileApi.getSubscription().then((r) => r.data),
  });

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="h-40 bg-secondary rounded animate-pulse" />
      </DashboardShell>
    );
  }

  const sub = subData;

  return (
    <DashboardShell>
      <PageHeader eyebrow="Account" title="Subscription" description="Manage your subscription plan, billing, and tier." />
      <Card title="Current Subscription Plan">
        <div className="space-y-4 max-w-md">
          <div className="flex items-center justify-between border-b border-rule/50 pb-3">
            <div>
              <p className="font-serif text-2xl capitalize">{sub?.tier || "Free Reader Plan"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {sub?.tier && sub.tier !== "free" ? "Access to full digital magazine archives & premium books" : "Basic access to free articles"}
              </p>
            </div>
            <StatusPill status={sub?.status || "Active"} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Billing Cycle</span>
              <span className="text-muted-foreground">Monthly</span>
            </div>
            {sub?.renewsAt && (
              <div className="flex justify-between">
                <span>Renews On</span>
                <span className="text-muted-foreground">{new Date(sub.renewsAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <div className="pt-2 flex gap-3">
            <Link to="/pricing">
              <Btn>Upgrade Plan</Btn>
            </Link>
            <Btn variant="outline" onClick={() => toast.info("To cancel your plan, please contact support@swathi.com")}>
              Manage Billing
            </Btn>
          </div>
        </div>
      </Card>
    </DashboardShell>
  );
}
