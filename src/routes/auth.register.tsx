import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/register")({
  head: () => ({ meta: [{ title: "Create account — Swathi Publications" }] }),
  component: AuthRegisterPage,
});

function AuthRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const registerMutation = useMutation({
    mutationFn: () => {
      const parts = fullName.split(" ");
      const firstName = parts[0];
      const lastName = parts.slice(1).join(" ") || " ";
      return authApi.register({ 
        email, 
        password, 
        firstName, 
        lastName, 
        acceptTerms: agreeTerms 
      });
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      router.navigate({ to: "/auth/verify-email" });
    },
    onError: () => {
      toast.error("Failed to create account");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <AuthShell 
      title="Create your account" 
      subtitle="Join a community of considered readers." 
      footer={<>Already have an account? <Link to="/auth/login" className="text-primary hover:underline">Sign in</Link></>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Name</span>
          <input 
            required 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" 
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" 
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Password</span>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper" 
          />
        </label>
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input 
            type="checkbox" 
            required
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-1" 
          />
          I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </label>
        <Btn 
          type="submit" 
          disabled={registerMutation.isPending} 
          className="w-full"
        >
          {registerMutation.isPending ? "Creating account..." : "Create account"}
        </Btn>
      </form>
    </AuthShell>
  );
}
