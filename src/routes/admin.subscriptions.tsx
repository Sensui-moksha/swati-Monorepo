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

import { queryKeys } from "@/lib/api/queryKeys";

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
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const invalidatePlans = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.subscriptions.plans() });
    queryClient.refetchQueries({ queryKey: queryKeys.subscriptions.plans() });
  };

  const createPlanMutation = useMutation({
    mutationFn: (plan: any) => subscriptionsApi.createPlan(plan),
    onSuccess: () => {
      toast.success("Subscription plan created");
      setIsCreating(false);
      setEditingPlan(null);
      invalidatePlans();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to create plan"),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => subscriptionsApi.updatePlan(id, data),
    onSuccess: () => {
      toast.success("Subscription plan updated");
      setEditingPlan(null);
      invalidatePlans();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to update plan"),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => subscriptionsApi.deletePlan(id),
    onSuccess: () => {
      toast.success("Plan deleted successfully");
      setDeletingPlanId(null);
      invalidatePlans();
    },
    onError: (err: any) => toast.error(err?.message || "Failed to delete plan"),
  });

  const mapIntervalToBillingCycle = (interval?: string) => {
    if (interval === "year") return "annual";
    if (interval === "lifetime") return "lifetime";
    return "monthly";
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan?.name || editingPlan?.price === undefined) {
      toast.error("Plan name and price are required");
      return;
    }

    const payload = {
      name: editingPlan.name,
      slug: editingPlan.slug || editingPlan.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: Number(editingPlan.price),
      interval: editingPlan.interval || "month",
      billingCycle: mapIntervalToBillingCycle(editingPlan.interval),
      isActive: editingPlan.isActive ?? true,
    };

    if (editingPlan.id) {
      updatePlanMutation.mutate({ id: editingPlan.id, data: payload });
    } else {
      createPlanMutation.mutate(payload);
    }
  };

  const confirmDelete = (id: string) => {
    deletePlanMutation.mutate(id);
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
                placeholder="e.g. Monthly Digital Pass"
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
          ) : plans.length > 0 ? (
            <ul className="divide-y divide-rule text-sm">
              {plans.map((p) => (
                <li key={p.id} className="py-3 flex justify-between items-center gap-4">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">{p.interval || "month"} billing</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-semibold">{formatINR(p.price)}</div>
                      <StatusBadge status={p.isActive ? "Active" : "Inactive"} />
                    </div>
                    {deletingPlanId === p.id ? (
                      <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded border border-red-200">
                        <span className="text-xs text-red-700 font-medium px-1">Delete?</span>
                        <button
                          type="button"
                          onClick={() => confirmDelete(p.id)}
                          disabled={deletePlanMutation.isPending}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 font-semibold transition"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingPlanId(null)}
                          className="px-2 py-1 bg-secondary text-foreground rounded text-xs hover:bg-stone-200 font-medium transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Btn size="sm" variant="outline" onClick={() => { setEditingPlan(p); setIsCreating(false); }}>
                          Edit
                        </Btn>
                        <Btn size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDeletingPlanId(p.id)}>
                          Delete
                        </Btn>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-8 text-center space-y-3">
              <div className="text-muted-foreground text-sm">No subscription plans created yet.</div>
              <Btn size="sm" onClick={() => { setEditingPlan({ name: "", price: 299, interval: "month", isActive: true }); setIsCreating(true); }}>
                + Create First Plan
              </Btn>
            </div>
          )}
        </Card>

        <Card title="Recent Subscribers">
          <ul className="divide-y divide-rule text-sm">
            {users.length > 0 ? (
              users.map((u) => (
                <li key={u.id} className="py-3 flex justify-between items-center">
                  <div>
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <StatusBadge status={u.status || "Active"} />
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-muted-foreground text-sm">No recent subscribers</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
