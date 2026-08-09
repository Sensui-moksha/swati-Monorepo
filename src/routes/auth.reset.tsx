import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/auth/reset")({
  component: () => (
    <AuthShell title="Reset password" subtitle="Choose a new password.">
      <form className="space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            New password
          </span>
          <input
            type="password"
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Confirm</span>
          <input
            type="password"
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper"
          />
        </label>
        <Link to="/auth/login">
          <Btn className="w-full">Update password</Btn>
        </Link>
      </form>
    </AuthShell>
  ),
});
