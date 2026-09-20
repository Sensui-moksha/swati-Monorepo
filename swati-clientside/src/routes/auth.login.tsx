import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { AuthShell } from "@/components/shells";
import { Btn } from "@/components/ui-primitives";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api/endpoints/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — Swathi Publications" }] }),
  component: AuthLoginPage,
});

function AuthLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const loginMutation = useMutation({
    mutationFn: () => authApi.login({ email, password, rememberMe }),
    onSuccess: () => {
      toast.success("Successfully logged in");
      router.navigate({ to: "/dashboard" });
    },
    onError: () => {
      toast.error("Invalid email or password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue reading."
      footer={
        <>
          New here?{" "}
          <Link to="/auth/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 border border-rule rounded px-3 py-2 bg-paper"
            placeholder="reader@swathi.in"
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
        <div className="flex justify-between text-xs">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember me
          </label>
          <Link to="/auth/forgot" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Btn type="submit" disabled={loginMutation.isPending} className="w-full">
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Btn>
        <div className="text-center text-xs text-muted-foreground">or continue with</div>
        <div className="grid grid-cols-2 gap-2">
          <Btn type="button" variant="outline">
            Google
          </Btn>
          <Btn type="button" variant="outline">
            Apple
          </Btn>
        </div>
      </form>
    </AuthShell>
  );
}
