import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My Library — Swathi Publications" }] }),
  component: () => <Outlet />,
});
