import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { Mail } from "lucide-react";
export const Route = createFileRoute("/auth/verify-email")({
  component: () => (
    <AuthShell title="Check your inbox" subtitle="We've sent a verification link to your email.">
      <div className="text-center py-6">
        <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground mb-6">Click the link in the email to verify your address. If it doesn't arrive within a few minutes, check your spam folder.</p>
        <Link to="/auth/verify-otp"><Btn className="w-full">I received a code instead</Btn></Link>
      </div>
    </AuthShell>
  ),
});
