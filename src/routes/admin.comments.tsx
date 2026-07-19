import { createFileRoute } from "@tanstack/react-router";
import { ADMIN_COMMENTS } from "@/lib/mock-data";
import { Card, StatusBadge } from "./admin.index";

export const Route = createFileRoute("/admin/comments")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Comments</h1>
        <p className="text-sm text-muted-foreground">Moderate discussion across all articles</p>
      </div>
      <Card title="Recent comments">
        <ul className="divide-y divide-rule">
          {ADMIN_COMMENTS.map((c) => (
            <li key={c.id} className="py-4 flex gap-4 items-start">
              <div className="h-9 w-9 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold shrink-0">{c.user[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold">{c.user}</span>
                  <span className="text-muted-foreground text-xs">on</span>
                  <span className="text-muted-foreground text-xs truncate">"{c.article}"</span>
                  <StatusBadge status={c.status} />
                </div>
                <p className="mt-1 text-sm">{c.text}</p>
                <div className="mt-2 text-xs flex gap-3">
                  <button className="text-primary hover:underline">Approve</button>
                  <button className="text-muted-foreground hover:text-primary">Flag</button>
                  <button className="text-muted-foreground hover:text-primary">Delete</button>
                  <span className="ml-auto text-muted-foreground">{c.date}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  ),
});
