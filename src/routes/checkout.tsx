import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/checkout")({
  component: () => <StubPage title="Checkout" description="Review your order and complete purchase." />,
});
