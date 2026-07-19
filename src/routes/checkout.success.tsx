import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/checkout/success")({
  component: () => <StubPage title="Order Placed" description="Thank you — your order is on its way." />,
});
