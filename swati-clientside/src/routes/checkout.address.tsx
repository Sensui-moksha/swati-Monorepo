import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/checkout/address")({
  component: () => (
    <StubPage title="Shipping Address" description="Where should we send your books?" />
  ),
});
