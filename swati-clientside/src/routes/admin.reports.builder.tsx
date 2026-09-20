import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn, StatusPill } from "@/components/ui-primitives";
import { useState } from "react";

import { useReportPreview } from "@/lib/api/hooks";

export const Route = createFileRoute("/admin/reports/builder")({
  head: () => ({
    meta: [{ title: "Report Builder — Swathi Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: Page,
});

const DIMENSIONS = [
  "Date",
  "Section",
  "Author",
  "Publication",
  "Country",
  "Device",
  "Plan",
  "Payment method",
];
const METRICS = [
  "Reads",
  "Unique readers",
  "Avg. read time",
  "Completion rate",
  "Revenue",
  "New subscribers",
  "Churn",
  "Refund rate",
];
const SOURCES = [
  "Articles",
  "Subscriptions",
  "Payments",
  "Search queries",
  "Reader sessions",
  "Newsletter",
];

function Page() {
  const [source, setSource] = useState("Articles");
  const [dims, setDims] = useState<string[]>(["Date", "Section"]);
  const [metrics, setMetrics] = useState<string[]>(["Reads", "Avg. read time"]);

  const { data, isLoading } = useReportPreview({ source, dims, metrics });
  const previewData = data?.data || [];

  const toggle = (arr: string[], v: string, setter: (a: string[]) => void) =>
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="Report Builder"
        description="Compose a custom report by combining a source, dimensions, and metrics."
        actions={
          <>
            <Btn variant="outline">Save draft</Btn>
            <Btn>Run report</Btn>
          </>
        }
      />
      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <Card title="Source">
            <div className="space-y-1.5">
              {SOURCES.map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary"
                >
                  <input
                    type="radio"
                    name="src"
                    checked={source === s}
                    onChange={() => setSource(s)}
                  />{" "}
                  {s}
                </label>
              ))}
            </div>
          </Card>
          <Card title="Dimensions">
            <div className="space-y-1.5">
              {DIMENSIONS.map((d) => (
                <label
                  key={d}
                  className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={dims.includes(d)}
                    onChange={() => toggle(dims, d, setDims)}
                  />{" "}
                  {d}
                </label>
              ))}
            </div>
          </Card>
          <Card title="Metrics">
            <div className="space-y-1.5">
              {METRICS.map((m) => (
                <label
                  key={m}
                  className="flex items-center gap-2 text-sm cursor-pointer p-2 rounded hover:bg-secondary"
                >
                  <input
                    type="checkbox"
                    checked={metrics.includes(m)}
                    onChange={() => toggle(metrics, m, setMetrics)}
                  />{" "}
                  {m}
                </label>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Filters">
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Date range
                </span>
                <input
                  defaultValue="Last 30 days"
                  className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Section
                </span>
                <select className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2">
                  <option>All</option>
                  <option>Politics</option>
                  <option>Science</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Compare to
                </span>
                <select className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2">
                  <option>Previous period</option>
                  <option>Same period last year</option>
                  <option>None</option>
                </select>
              </label>
            </div>
          </Card>
          <Card
            title="Preview"
            action={
              <span className="text-xs text-muted-foreground">
                Source: {source} · {dims.length} dim · {metrics.length} metrics
              </span>
            }
          >
            {isLoading ? (
              <div className="p-4 space-y-3">
                <div className="h-4 bg-secondary rounded w-full animate-pulse" />
                <div className="h-4 bg-secondary rounded w-full animate-pulse" />
                <div className="h-4 bg-secondary rounded w-full animate-pulse" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs uppercase tracking-widest text-muted-foreground">
                  <tr>
                    {[...dims, ...metrics].map((h) => (
                      <th key={h} className="text-left py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row: any, i: number) => (
                    <tr key={i} className="border-t border-rule/40">
                      {[...dims, ...metrics].map((c, j) => (
                        <td key={j} className="py-2 tabular-nums">
                          {row[c] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {previewData.length === 0 && (
                    <tr>
                      <td
                        colSpan={dims.length + metrics.length}
                        className="py-4 text-center text-muted-foreground"
                      >
                        No data available for this preview
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </Card>
          <Card title="Save & schedule">
            <div className="flex items-center gap-3">
              <input
                defaultValue="Weekly section performance"
                className="flex-1 border border-rule bg-paper rounded px-3 py-2 text-sm"
              />
              <select className="border border-rule bg-paper rounded px-3 py-2 text-sm">
                <option>One-off</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
              <Btn>Save</Btn>
              <StatusPill status="Approved" />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
