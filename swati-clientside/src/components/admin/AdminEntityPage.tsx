import { useState } from "react";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill } from "@/components/ui-primitives";
import {
  useAdminGeneric,
  useCreateAdminEntity,
  useUpdateAdminEntity,
  useDeleteAdminEntity,
} from "@/lib/api/hooks";
import { toast } from "sonner";

export interface ColumnDef {
  header: string;
  accessor: (row: any) => React.ReactNode;
}

interface AdminEntityPageProps {
  entity: string;
  title: string;
  description: string;
  columns?: ColumnDef[];
  customFields?: { id: string; label: string; type?: string; placeholder?: string }[];
}

export function AdminEntityPage({
  entity,
  title,
  description,
  columns,
  customFields,
}: AdminEntityPageProps) {
  const { data, isLoading } = useAdminGeneric(entity);
  const createMutation = useCreateAdminEntity(entity);
  const updateMutation = useUpdateAdminEntity(entity);
  const deleteMutation = useDeleteAdminEntity(entity);

  const rawItems: any[] = data?.data ?? [];

  // Local state for search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");

  // Local state for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: string; name: string } | null>(
    null,
  );

  // Filter items based on search and status
  const filteredItems = rawItems.filter((item) => {
    const nameStr = (item.name || item.title || item.orderNumber || "").toLowerCase();
    const slugStr = (item.slug || "").toLowerCase();
    const searchMatch =
      nameStr.includes(searchTerm.toLowerCase()) || slugStr.includes(searchTerm.toLowerCase());

    if (!searchMatch) return false;
    if (statusFilter !== "All statuses") {
      const itemStatus = (item.status || "Active").toLowerCase();
      return itemStatus === statusFilter.toLowerCase();
    }
    return true;
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({ name: "", slug: "", status: "Active", description: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name || item.title || "",
      slug: item.slug || "",
      status: item.status || "Active",
      description: item.description || item.bio || "",
      ...item,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setDeleteConfirmItem({ id, name });
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      const itemId = editingItem.id || editingItem._id;
      updateMutation.mutate(
        { id: itemId, data: formData },
        {
          onSuccess: () => {
            toast.success(`${title} item updated successfully`);
            setIsModalOpen(false);
          },
          onError: () => toast.error("Failed to update item"),
        },
      );
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success(`New ${title} item created successfully`);
          setIsModalOpen(false);
        },
        onError: () => toast.error("Failed to create item"),
      });
    }
  };

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("No items available to export");
      return;
    }

    const headers = ["ID", "Name", "Slug", "Status", "Updated At"];
    const rows = filteredItems.map((i) => [
      i.id || i._id || "",
      `"${(i.name || i.title || "").replace(/"/g, '""')}"`,
      `"${(i.slug || "").replace(/"/g, '""')}"`,
      i.status || "Active",
      i.updatedAt ? new Date(i.updatedAt).toISOString() : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${entity}-export-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredItems.length} records to CSV`);
  };

  return (
    <AdminShell>
      <PageHeader
        eyebrow="Admin"
        title={title}
        description={description}
        actions={<Btn onClick={handleOpenCreate}>New</Btn>}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="border border-rule bg-paper rounded px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option>All statuses</option>
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </select>
        <Btn variant="outline" onClick={handleExportCSV}>
          Export CSV
        </Btn>
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
                  {columns
                    ? columns.map((c) => (
                        <th key={c.header} className="text-left px-4 py-3 font-medium">
                          {c.header}
                        </th>
                      ))
                    : ["Name", "Slug", "Status", "Updated", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium">
                          {h}
                        </th>
                      ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns ? columns.length : 5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((row: any) => {
                    const rowId = row.id || row._id;
                    const rowName = row.name || row.title || `${entity} #${rowId}`;

                    return (
                      <tr key={rowId} className="border-t border-rule/50 hover:bg-secondary/30">
                        {columns ? (
                          columns.map((col, idx) => (
                            <td key={idx} className="px-4 py-3">
                              {col.accessor(row)}
                            </td>
                          ))
                        ) : (
                          <>
                            <td className="px-4 py-3 font-medium">{rowName}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.slug || "-"}</td>
                            <td className="px-4 py-3">
                              <StatusPill status={row.status || "Active"} />
                            </td>
                            <td className="px-4 py-3 text-muted-foreground tabular-nums">
                              {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-1.5">
                                <Btn
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEdit(row)}
                                >
                                  Edit
                                </Btn>
                                <Btn
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={() => handleDelete(rowId, rowName)}
                                >
                                  Delete
                                </Btn>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground border-t border-rule/50">
              <span>
                Showing {filteredItems.length} of {data?.meta?.total ?? rawItems.length}
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

      {/* Modal for Create & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-paper border border-rule rounded-lg shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-rule pb-3">
              <h3 className="font-serif text-lg font-semibold">
                {editingItem ? `Edit ${title}` : `New ${title}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                  Name / Title
                </label>
                <input
                  required
                  value={formData.name || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter name or title"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                  Slug
                </label>
                <input
                  value={formData.slug || ""}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. my-item-slug"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                  Status
                </label>
                <select
                  value={formData.status || "Active"}
                  onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>

              {customFields ? (
                customFields.map((cf) => (
                  <div key={cf.id}>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                      {cf.label}
                    </label>
                    {cf.type === "textarea" ? (
                      <textarea
                        rows={3}
                        value={formData[cf.id] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [cf.id]: e.target.value }))
                        }
                        className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder={cf.placeholder || `Enter ${cf.label.toLowerCase()}`}
                      />
                    ) : (
                      <input
                        type={cf.type || "text"}
                        value={formData[cf.id] || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, [cf.id]: e.target.value }))
                        }
                        className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder={cf.placeholder || `Enter ${cf.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Enter description..."
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-rule">
                <Btn type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Btn>
                <Btn type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Item"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-paper border border-rule rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-rule pb-3">
              <h3 className="font-serif text-lg font-semibold text-destructive">
                Confirm Deletion
              </h3>
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteConfirmItem.name}</span>? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-rule">
              <Btn variant="outline" onClick={() => setDeleteConfirmItem(null)}>
                Cancel
              </Btn>
              <Btn
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  deleteMutation.mutate(deleteConfirmItem.id, {
                    onSuccess: () => {
                      toast.success(`"${deleteConfirmItem.name}" deleted successfully`);
                      setDeleteConfirmItem(null);
                    },
                    onError: () => {
                      toast.error("Failed to delete item");
                      setDeleteConfirmItem(null);
                    },
                  });
                }}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
