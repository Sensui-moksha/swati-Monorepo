import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Swathi Publications" }] }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password, rememberMe }),
    onSuccess: (res: any) => {
      // Store tokens so subsequent authenticated requests include the Bearer token
      const data = res?.data;
      if (data?.tokens) {
        apiClient.setTokens(data.tokens);
      } else if (data?.accessToken) {
        apiClient.setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
      }
      toast.success("Successfully logged in");
      router.navigate({ to: "/" });
    },
    onError: (err: any) => {
      const message = err?.data?.error || err?.message || "Invalid email or password";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <SiteLayout>
      <div className="container-edit py-20 max-w-md mx-auto">
        <div className="eyebrow text-center">Members</div>
        <h1 className="mt-2 font-serif text-4xl text-center">Sign in</h1>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
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
              placeholder="••••••••" 
            />
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              /> 
              Remember me
            </label>
            <a href="#" className="text-primary hover:underline">Forgot password?</a>
          </div>
          <button 
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>
          <div className="text-center text-xs text-muted-foreground rule-top pt-4">
            Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link>
          </div>
        </form>
      </div>
    </SiteLayout>
  );
}
