import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/collections")({
  component: () => <StubPage title="Collections" description="Curated reading collections." />,
});
