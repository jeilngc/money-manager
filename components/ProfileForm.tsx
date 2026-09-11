"use client";
import { LogOut, ChevronRight, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Label, FieldError } from "@/components/ui/Input";

export function ProfileForm({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }) {
  const router = useRouter();
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [status, setStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: first, lastName: last }),
    });
    const data = await res.json<{ error?: string }>();
    setSaving(false);
    if (!res.ok) return setStatus(data.error ?? "Couldn't save your name.");
    setStatus("Profile saved.");
    router.refresh();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="px-5 pt-8">
      <header className="mb-7">
        <p className="text-sm text-mutedForeground">Your account</p>
        <h1 className="font-display text-3xl font-semibold text-foreground">Settings</h1>
      </header>

      <section className="surface mb-5 flex items-center gap-4 p-5">
        <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl font-bold text-primaryForeground">
          {(first[0] || email[0]).toUpperCase()}
          {last[0]?.toUpperCase()}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {first || "Your name"} {last}
          </h2>
          <p className="text-sm text-mutedForeground">{email}</p>
        </div>
      </section>

      <form onSubmit={save} className="surface mb-5 p-5">
        <h2 className="mb-5 font-display text-lg font-semibold text-foreground">Personal details</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="profile-first">First name</Label>
            <Input id="profile-first" required value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="profile-last">Last name</Label>
            <Input id="profile-last" required value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
        </div>
        <FieldError>{status}</FieldError>
        <Button className="mt-5 w-full" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </form>

      <section className="surface overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border/50 p-4 text-sm">
          <Mail size={18} className="text-mutedForeground" />
          <span className="flex-1 font-semibold text-foreground">Email</span>
          <span className="text-mutedForeground">{email}</span>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-3 p-4 text-left text-sm font-bold text-destructive">
          <LogOut size={18} />
          Log out <ChevronRight className="ml-auto" size={17} />
        </button>
      </section>
    </div>
  );
}
