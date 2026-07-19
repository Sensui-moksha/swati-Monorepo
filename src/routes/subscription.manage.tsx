import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/subscription/manage")({
  component: () => <StubPage title="Manage Subscription" description="Update, pause or cancel your plan." />,
});
