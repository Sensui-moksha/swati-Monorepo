import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Swathi Publications" }] }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-20 max-w-md">
        <div className="eyebrow text-center">Members</div>
        <h1 className="mt-2 font-serif text-4xl text-center">Sign in</h1>
        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = "/account"; }}>
          <label className="block"><span className="eyebrow">Email</span><input type="email" required className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" placeholder="you@example.com" /></label>
          <label className="block"><span className="eyebrow">Password</span><input type="password" required className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" placeholder="••••••••" /></label>
          <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2"><input type="checkbox" /> Remember me</label><a href="#" className="text-primary hover:underline">Forgot password?</a></div>
          <button className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90">Sign in</button>
          <div className="text-center text-xs text-muted-foreground rule-top pt-4">Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link></div>
        </form>
      </div>
    </SiteLayout>
  ),
});
