import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/library")({ component: () => <Outlet /> });
