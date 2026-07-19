import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/subscription/success")({
  component: () => <StubPage title="Welcome" description="Your subscription is active." />,
});
