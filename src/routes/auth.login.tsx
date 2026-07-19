import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — Swathi Publications" }] }),
  component: () => (
    <AuthShell title="Welcome back" subtitle="Sign in to continue reading." footer={<>New here? <Link to="/auth/register" className="text-primary hover:underline">Create an account</Link></>}>
      <form className="space-y-4">
        <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span><input type="email" className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" defaultValue="reader@swathi.in" /></label>
        <label className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span><input type="password" className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" /></label>
        <div className="flex justify-between text-xs"><label className="flex items-center gap-2"><input type="checkbox" defaultChecked />Remember me</label><Link to="/auth/forgot" className="text-primary hover:underline">Forgot password?</Link></div>
        <Link to="/dashboard"><Btn className="w-full">Sign in</Btn></Link>
        <div className="text-center text-xs text-muted-foreground">or continue with</div>
        <div className="grid grid-cols-2 gap-2"><Btn variant="outline">Google</Btn><Btn variant="outline">Apple</Btn></div>
      </form>
    </AuthShell>
  ),
});
