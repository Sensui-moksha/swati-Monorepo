import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/checkout/review")({
  component: () => <StubPage title="Review Order" description="Confirm before you pay." />,
});
