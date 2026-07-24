import { createFileRoute } from "@tanstack/react-router";
import { useSubscriptionPlans, useAdminUsers } from "@/lib/api/hooks";
import { subscriptionsApi } from "@/lib/api/endpoints/subscriptions";
import { formatINR } from "@/lib/utils";
import { Card, StatusBadge } from "./admin.index";
import { Btn, Input, Label } from "@/components/ui-primitives";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { SubscriptionPlan } from "@/lib/api/types";

export const Route = createFileRoute("/admin/subscriptions")({
  component: AdminSubscriptionsPage,
});

function AdminSubscriptionsPage() {
  const queryClient = useQueryClient();
  const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: usersData } = useAdminUsers({ limit: 10 });
  const plans = plansData?.data ?? [];
  const users = usersData?.data ?? [];

  const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const createPlanMutation = useMutation({
    mutationFn: (plan: Partial<SubscriptionPlan>) => subscriptionsApi.createPlan(plan),
    onSuccess: () => {
      toast.success("Subscription plan created");
      setIsCreating(false);
      setEditingPlan(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create plan"),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SubscriptionPlan> }) => subscriptionsApi.updatePlan(id, data),
    onSuccess: () => {
      toast.success("Subscription plan updated");
      setEditingPlan(null);
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update plan"),
  });

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.name || editingPlan?.price === undefined) {
      toast.error("Plan name and price are required");
      return;
    }

    if (editingPlan.id) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: editingPlan });
    } else {
      createPlanMutation.mutate({
        ...editingPlan,
        slug: editingPlan.slug || editingPlan.name.toLowerCase().replace(/\s+/g, "-"),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl">Subscriptions & Plans</h1>
          <p className="text-sm text-muted-foreground">Manage subscription plans, pricing, and subscribers</p>
        </div>
        <Btn onClick={() => { setEditingPlan({ name: "", price: 299, interval: "month", isActive: true }); setIsCreating(true); }}>
          + Add New Plan
        </Btn>
      </div>

      {/* Plan Edit / Create Form */}
      {editingPlan && (
        <Card title={isCreating ? "Create Subscription Plan" : `Edit Plan: ${editingPlan.name}`}>
          <form onSubmit={handleSavePlan} className="space-y-4 max-w-lg">
            <div className="space-y-2">
              <Label htmlFor="planName">Plan Name</Label>
              <Input
                id="planName"
                value={editingPlan.name || ""}
                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                placeholder="e.g. Pro Monthly Plan"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planPrice">Price (₹)</Label>
                <Input
                  id="planPrice"
                  type="number"
                  value={editingPlan.price ?? 0}
                  onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planInterval">Billing Interval</Label>
                <select
                  id="planInterval"
                  value={editingPlan.interval || "month"}
                  onChange={(e) => setEditingPlan({ ...editingPlan, interval: e.target.value as any })}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
                >
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                id="planActive"
                type="checkbox"
                checked={editingPlan.isActive ?? true}
                onChange={(e) => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                className="rounded border-rule text-primary"
              />
              <Label htmlFor="planActive" className="cursor-pointer font-normal">Active for new subscribers</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Btn type="submit" disabled={createPlanMutation.isPending || updatePlanMutation.isPending}>
                {createPlanMutation.isPending || updatePlanMutation.isPending ? "Saving..." : "Save Plan"}
              </Btn>
              <Btn type="button" variant="outline" onClick={() => { setEditingPlan(null); setIsCreating(false); }}>
                Cancel
              </Btn>
            </div>
          </form>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Subscription Plans">
          {isLoadingPlans ? (
            <div className="space-y-3 p-4">
              <div className="h-10 bg-secondary rounded animate-pulse" />
              <div className="h-10 bg-secondary rounded animate-pulse" />
            </div>
          ) : (
            <ul className="divide-y divide-rule text-sm">
              {plans.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{p.interval} billing</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatINR(p.price)}</div>
                      <StatusBadge status={p.isActive ? "Active" : "Inactive"} />
                    </div>
                    <Btn size="sm" variant="outline" onClick={() => { setEditingPlan(p); setIsCreating(false); }}>
                      Edit
                    </Btn>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Recent Subscribers">
          <ul className="divide-y divide-rule text-sm">
            {users.map((u) => (
              <li key={u.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <StatusBadge status={u.status || "Active"} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
