import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/auth/forgot")({
  component: () => (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link to="/auth/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
          <input
            type="email"
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper"
          />
        </label>
        <Link to="/auth/reset">
          <Btn className="w-full">Send reset link</Btn>
        </Link>
      </form>
    </AuthShell>
  ),
});
