"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await res.json<{ error?: string }>();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Ambient washes — soft, amorphous, never symmetric */}
      <div className="blob pointer-events-none absolute -left-20 -top-24 h-72 w-72 bg-primary/15" aria-hidden />
      <div className="blob pointer-events-none absolute -right-24 top-1/3 h-80 w-80 bg-secondary/15" aria-hidden />
      <div className="blob pointer-events-none absolute -bottom-10 left-10 h-64 w-64 bg-accent/50" aria-hidden />

      <div className="app-shell relative flex min-h-screen flex-col justify-center px-7 py-12">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[45%_55%_60%_40%/55%_45%_55%_45%] bg-primary font-display text-lg font-bold text-primaryForeground shadow-soft">
            L
          </span>
          <span className="font-display text-lg font-semibold text-foreground">Ledger</span>
        </div>

        <p className="mb-2 text-sm font-bold text-secondary">
          {mode === "login" ? "Welcome back" : "Let's get started"}
        </p>
        <h1 className="mb-9 font-display text-4xl font-semibold leading-tight tracking-tight text-foreground">
          {mode === "login" ? "Sign in to your finances" : "Grow your money, gently"}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-sm">
          {mode === "register" && (
            <div className="mb-5 grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jason" />
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Zhou" />
              </div>
            </div>
          )}
          <div className="mb-5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <FieldError>{error}</FieldError>

          <Button type="submit" disabled={loading} className="mt-8 w-full">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-mutedForeground">
          {mode === "login" ? (
            <>
              No account yet?{" "}
              <Link href="/register" className="font-bold text-primary underline underline-offset-4">
                Create one
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-primary underline underline-offset-4">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
