import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Swathi Publications" }] }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-20 max-w-md">
        <div className="eyebrow text-center">Join</div>
        <h1 className="mt-2 font-serif text-4xl text-center">Create your account</h1>
        <form className="mt-8 space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = "/account"; }}>
          <label className="block"><span className="eyebrow">Full name</span><input required className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" placeholder="Your name" /></label>
          <label className="block"><span className="eyebrow">Email</span><input type="email" required className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" placeholder="you@example.com" /></label>
          <label className="block"><span className="eyebrow">Password</span><input type="password" required className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" placeholder="Create a strong password" /></label>
          <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" required className="mt-0.5" /> I agree to the Terms of Service and Privacy Policy.</label>
          <button className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90">Create account</button>
          <div className="text-center text-xs text-muted-foreground rule-top pt-4">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></div>
        </form>
      </div>
    </SiteLayout>
  ),
});
