import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/subscription/checkout")({
  component: () => <StubPage title="Subscription Checkout" description="Start your subscription." />,
});
