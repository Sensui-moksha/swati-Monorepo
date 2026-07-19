import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/shells";
export const Route = createFileRoute("/wishlist")({
  component: () => <StubPage title="Wishlist" description="Books you'd like to read." />,
});
