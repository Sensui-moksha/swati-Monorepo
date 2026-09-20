import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/system/offline")({
  component: () => (
    <StubPage title="You're Offline" description="This section needs an internet connection." />
  ),
});
