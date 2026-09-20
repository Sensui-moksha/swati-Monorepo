import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/system/401")({
  component: () => (
    <StubPage title="Not Signed In" description="You need to sign in to view this page." />
  ),
});
