import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — Swathi Publications" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const registerMutation = useMutation({
    mutationFn: () => {
      // Backend expects { email, username, password, fullName }
      const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      return authApi.register({ 
        email, 
        password, 
        username,
        fullName,
      } as any);
    },
    onSuccess: (res: any) => {
      const data = res?.data;
      if (data?.tokens) {
        apiClient.setTokens(data.tokens);
      } else if (data?.accessToken) {
        apiClient.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      }
      toast.success("Account created successfully");
      router.navigate({ to: "/" });
    },
    onError: (err: any) => {
      const message = err?.data?.error || err?.message || "Failed to create account";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  return (
    <SiteLayout>
      <div className="container-edit py-20 max-w-md mx-auto">
        <div className="eyebrow text-center">Join</div>
        <h1 className="mt-2 font-serif text-4xl text-center">Create your account</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="eyebrow">Full name</span>
            <input 
              required 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" 
              placeholder="Your name" 
            />
          </label>
          <label className="block">
            <span className="eyebrow">Email</span>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" 
              placeholder="you@example.com" 
            />
          </label>
          <label className="block">
            <span className="eyebrow">Password</span>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary" 
              placeholder="Create a strong password" 
            />
          </label>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input 
              type="checkbox" 
              required 
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5" 
            /> 
            I agree to the Terms of Service and Privacy Policy.
          </label>
          <button 
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {registerMutation.isPending ? "Creating account..." : "Create account"}
          </button>
          <div className="text-center text-xs text-muted-foreground rule-top pt-4">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
