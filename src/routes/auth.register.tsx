import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — Swathi Publications" }] }),
  component: () => (
    <AuthShell title="Create your account" subtitle="Join a community of considered readers." footer={<>Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link></>}>
      <form className="space-y-4">
        <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Name</span><input className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" /></label>
        <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span><input type="email" className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" /></label>
        <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span><input type="password" className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" /></label>
        <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" className="mt-1" />I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link></label>
        <Link to="/auth/verify-email"><Btn className="w-full">Create account</Btn></Link>
      </form>
    </AuthShell>
  ),
});
