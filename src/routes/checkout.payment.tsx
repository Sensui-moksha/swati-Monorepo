import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/checkout/payment")({
  component: () => <StubPage title="Payment" description="Choose a payment method." />,
});
