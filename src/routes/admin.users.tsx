import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_USERS } from "@/lib/mock-data";
import { Card, StatusBadge } from "./admin.index";
import { UserPlus, Filter, Download } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Users</h1>
          <p className="text-sm text-muted-foreground">{ADMIN_USERS.length.toLocaleString()} registered accounts</p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 border border-input px-3 py-1.5 text-sm rounded-md hover:border-primary"><Filter className="h-4 w-4" /> Filter</button>
          <button className="inline-flex items-center gap-2 border border-input px-3 py-1.5 text-sm rounded-md hover:border-primary"><Download className="h-4 w-4" /> Export</button>
          <button className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 text-sm rounded-md hover:bg-primary/90"><UserPlus className="h-4 w-4" /> Invite user</button>
        </div>
      </div>
      <Card title="All users">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground">
            <tr className="border-b border-rule">
              <th className="text-left py-2">Name</th><th className="text-left">Email</th><th className="text-left">Plan</th><th className="text-left">Joined</th><th className="text-left">Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            {ADMIN_USERS.map((u) => (
              <tr key={u.id} className="border-b border-rule/60 hover:bg-secondary/30">
                <td className="py-3 flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">{u.name[0]}</div>{u.name}</td>
                <td className="text-muted-foreground">{u.email}</td>
                <td><StatusBadge status={u.plan} /></td>
                <td className="text-muted-foreground text-xs">{u.joined}</td>
                <td><StatusBadge status={u.status} /></td>
                <td className="text-right"><button className="text-primary text-xs hover:underline">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  ),
});
