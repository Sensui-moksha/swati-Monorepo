import { createFileRoute } from "@tanstack/react-router";
import { useSubscriptionPlans, useAdminUsers } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
});

function AdminSubscriptionsPage() {
  const { data: plansData } = useSubscriptionPlans();
  const { data: usersData } = useAdminUsers({ limit: 10 });
  const plans = plansData?.data ?? [];
  const users = usersData?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Manage subscription plans and subscribers</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Plans">
          <ul className="divide-y divide-rule text-sm">
            {plans.map((p) => (
              <li key={p.id} className="py-3 flex justify-between">
                <div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.interval}</div></div>
                <div className="text-right"><div>{formatINR(p.price)}</div><StatusBadge status={p.isActive ? "Active" : "Inactive"} /></div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Recent subscribers">
          <ul className="divide-y divide-rule text-sm">
            {users.map((u) => (
              <li key={u.id} className="py-3 flex justify-between">
                <span>{u.name}</span>
                <span className="text-muted-foreground text-xs">{u.email}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
