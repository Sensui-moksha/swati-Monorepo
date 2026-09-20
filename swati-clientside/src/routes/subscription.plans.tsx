import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/subscription/plans")({
  component: () => <StubPage title="Plans" description="Compare our subscription plans." />,
});
