import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/system/maintenance")({
  component: () => (
    <StubPage title="Under Maintenance" description="We're making improvements. Back shortly." />
  ),
});
