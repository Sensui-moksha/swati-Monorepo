import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
export const Route = createFileRoute("/auth/verify-otp")({
  component: () => (
    <AuthShell title="Enter verification code" subtitle="Type the 6-digit code we sent to you.">
      <form className="space-y-6">
        <div className="flex gap-2 justify-center">{[0,1,2,3,4,5].map((i) => <input key={i} maxLength={1} className="w-12 h-14 border border-rule rounded text-center font-serif text-2xl bg-paper" defaultValue={i < 3 ? String(i + 1) : ""} />)}</div>
        <Link to="/dashboard"><Btn className="w-full">Verify</Btn></Link>
        <div className="text-center text-xs text-muted-foreground">Didn't receive it? <button className="text-primary hover:underline">Resend</button></div>
      </form>
    </AuthShell>
  ),
});
