import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/subscription")({
  component: () => (
    <StubPage title="Subscribe" description="Pick a plan that suits your reading." />
  ),
});
