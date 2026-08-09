import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/system/500")({
  component: () => (
    <StubPage
      title="Something Went Wrong"
      description="We're looking into it. Please try again in a moment."
    />
  ),
});
