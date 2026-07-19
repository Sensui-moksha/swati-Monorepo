import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/system/403")({
  component: () => <StubPage title="Forbidden" description="You don't have permission to view this page." />,
});
