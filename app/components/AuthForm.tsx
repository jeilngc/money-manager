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
    <div className="app-shell flex flex-col justify-center px-7 py-12">
      <div className="mb-10 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent font-bold text-accentForeground">L</span>
        <span className="text-lg font-bold">Ledger</span>
      </div>
      <p className="text-sm font-medium text-accent mb-2">
        {mode === "login" ? "Welcome back" : "Let’s get started"}
      </p>
      <h1 className="text-4xl font-bold tracking-tight leading-tight mb-9">
        {mode === "login" ? "Sign in to your finances" : "Create your account"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-sm">
        {mode === "register" && <div className="grid grid-cols-2 gap-3 mb-5">
          <div><Label htmlFor="firstName">First name</Label><Input id="firstName" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jason" /></div>
          <div><Label htmlFor="lastName">Last name</Label><Input id="lastName" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Zhou" /></div>
        </div>}
        <div className="mb-6">
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

        <Button type="submit" disabled={loading} className="mt-8 w-full justify-center rounded-2xl bg-accent !px-6 !text-accentForeground hover:opacity-90">
          {loading ? "Please wait\u2026" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>

      <p className="mt-8 text-mutedForeground text-sm">
        {mode === "login" ? (
          <>
            No account yet?{" "}
            <Link href="/register" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
