import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill } from "@/components/ui-primitives";
import { useOrders } from "@/lib/api/hooks";
import { formatINR } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
});

function AdminOrdersPage() {
  const { data, isLoading } = useOrders();
  const orders = data?.data ?? [];

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin"
        title="Orders"
        description="Fulfilment and shipping status."
        actions={<Btn>New</Btn>}
      />
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          placeholder="Search…"
          className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px]"
        />
        <select className="border border-rule bg-paper rounded px-3 py-2 text-sm">
          <option>All statuses</option>
          <option>Completed</option>
          <option>Processing</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
        <Btn variant="outline">Export CSV</Btn>
      </div>
      <div className="bg-paper border border-rule rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  {["Order #", "Date", "Customer", "Total", "Status", "Payment", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  orders.map((o: any) => (
                    <tr
                      key={o._id || o.id || o.orderNumber}
                      className="border-t border-rule/50 hover:bg-secondary/30"
                    >
                      <td className="px-4 py-3 font-medium">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-muted-foreground tabular-nums">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {o.user?.fullName ||
                          o.user?.name ||
                          o.user?.email ||
                          (typeof o.user === "string" ? o.user : "Customer")}
                      </td>
                      <td className="px-4 py-3 font-medium tabular-nums">{formatINR(o.total)}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={o.status} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={o.paymentStatus || "Unknown"} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Btn size="sm" variant="outline">
                          View
                        </Btn>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>
                Showing {orders.length} of {data?.meta?.total ?? orders.length}
              </span>
              <div className="flex gap-1">
                <Btn size="sm" variant="outline">
                  Prev
                </Btn>
                <Btn size="sm" variant="outline">
                  Next
                </Btn>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
}
