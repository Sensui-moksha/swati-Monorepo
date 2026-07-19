import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/admin/recommendations")({ component: () => <Outlet /> });
