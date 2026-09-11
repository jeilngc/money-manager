"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  emoji: string;
  color: string;
  kind: "income" | "expense";
}

// Earth-drawn variety — moss, clay, sand, bark — instead of the old neon set
const SWATCHES = [
  "#5D7052", "#C18C5D", "#8FA47D", "#A85448",
  "#78786C", "#B08968", "#6B8E6B", "#9C6E44",
];

function CategoryRow({
  category,
  onSaved,
  onDeleted,
}: {
  category: Category;
  onSaved: (updated: Category) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [emoji, setEmoji] = useState(category.emoji);
  const [color, setColor] = useState(category.color);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    setError(null);
    if (!name.trim()) {
      setError("Name can't be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), emoji, color }),
      });
      const data = await res.json<{ category?: Category; error?: string }>();
      if (!res.ok || !data.category) {
        setError(data.error ?? "Couldn't save this category.");
        return;
      }
      onSaved(data.category);
      setEditing(false);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(confirmDelete = false) {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/categories/${category.id}${confirmDelete ? "?confirm=true" : ""}`,
        { method: "DELETE" }
      );
      if (res.status === 409) {
        const data = await res.json<{ count: number; name: string }>();
        const ok = window.confirm(
          `${data.count} transaction${data.count === 1 ? "" : "s"} use "${data.name}". ` +
            `Deleting it will mark ${data.count === 1 ? "that one" : "those"} as Uncategorized. Continue?`
        );
        if (ok) await remove(true);
        return;
      }
      if (!res.ok) {
        setError("Couldn't delete this category.");
        return;
      }
      onDeleted(category.id);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setDeleting(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="flex w-full items-center gap-3 border-b border-border/50 p-4 text-left last:border-b-0"
      >
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-muted text-lg">{emoji}</span>
        <span className="flex-1 text-sm font-bold text-foreground">{name}</span>
        <span className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      </button>
    );
  }

  return (
    <div className="border-b border-border/50 p-4 last:border-b-0">
      <div className="mb-3 flex items-center gap-3">
        <Input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="!h-11 w-14 !px-0 text-center text-lg"
          maxLength={4}
          aria-label="Emoji"
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="!h-11 flex-1"
          aria-label="Category name"
        />
        <button
          onClick={() => setEditing(false)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-mutedForeground transition-colors duration-300 hover:bg-muted"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>
      </div>
      <div className="mb-3 flex gap-2">
        {SWATCHES.map((swatch) => (
          <button
            key={swatch}
            onClick={() => setColor(swatch)}
            className={cn(
              "h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition-transform duration-300 hover:scale-110",
              color === swatch && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: swatch }}
            aria-label={`Color ${swatch}`}
          />
        ))}
      </div>
      <FieldError>{error}</FieldError>
      <div className="flex items-center gap-3">
        <Button type="button" onClick={save} disabled={saving} size="sm">
          {saving ? "Saving…" : "Save"}
        </Button>
        <button
          type="button"
          onClick={() => remove(false)}
          disabled={deleting}
          className="ml-auto flex items-center gap-1.5 text-sm font-bold text-destructive"
        >
          <Trash2 size={16} />
          {deleting ? "Removing…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

function AddCategoryRow({ kind, onAdded }: { kind: "income" | "expense"; onAdded: (c: Category) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("\u{1F4CC}");
  const [color, setColor] = useState(SWATCHES[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function add() {
    setError(null);
    if (!name.trim()) {
      setError("Give it a name.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), emoji, color, kind }),
      });
      const data = await res.json<{ category?: Category; error?: string }>();
      if (!res.ok || !data.category) {
        setError(data.error ?? "Couldn't add that category.");
        return;
      }
      onAdded(data.category);
      setName("");
      setEmoji("\u{1F4CC}");
      setColor(SWATCHES[0]);
      setOpen(false);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 p-4 text-left text-sm font-bold text-primary"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Plus size={16} />
        </span>
        Add category
      </button>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-3">
        <Input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="!h-11 w-14 !px-0 text-center text-lg"
          maxLength={4}
          aria-label="Emoji"
        />
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          className="!h-11 flex-1"
          aria-label="Category name"
        />
        <button
          onClick={() => setOpen(false)}
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-mutedForeground transition-colors duration-300 hover:bg-muted"
          aria-label="Cancel"
        >
          <X size={18} />
        </button>
      </div>
      <div className="mb-3 flex gap-2">
        {SWATCHES.map((swatch) => (
          <button
            key={swatch}
            onClick={() => setColor(swatch)}
            className={cn(
              "h-7 w-7 rounded-full ring-offset-2 ring-offset-card transition-transform duration-300 hover:scale-110",
              color === swatch && "ring-2 ring-primary"
            )}
            style={{ backgroundColor: swatch }}
            aria-label={`Color ${swatch}`}
          />
        ))}
      </div>
      <FieldError>{error}</FieldError>
      <Button type="button" onClick={add} disabled={saving} size="sm">
        {saving ? "Adding…" : "Add category"}
      </Button>
    </div>
  );
}

export function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);

  const expense = categories.filter((c) => c.kind === "expense");
  const income = categories.filter((c) => c.kind === "income");

  function handleSaved(updated: Category) {
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }
  function handleDeleted(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }
  function handleAdded(created: Category) {
    setCategories((prev) => [...prev, created]);
  }

  return (
    <section className="mb-5">
      <h2 className="mb-3 px-1 font-display text-lg font-semibold text-foreground">Categories</h2>

      <p className="mb-2 px-1 text-xs font-bold text-mutedForeground">Expense</p>
      <div className="surface mb-4 overflow-hidden">
        {expense.map((c) => (
          <CategoryRow key={c.id} category={c} onSaved={handleSaved} onDeleted={handleDeleted} />
        ))}
        <AddCategoryRow kind="expense" onAdded={handleAdded} />
      </div>

      <p className="mb-2 px-1 text-xs font-bold text-mutedForeground">Income</p>
      <div className="surface overflow-hidden">
        {income.map((c) => (
          <CategoryRow key={c.id} category={c} onSaved={handleSaved} onDeleted={handleDeleted} />
        ))}
        <AddCategoryRow kind="income" onAdded={handleAdded} />
      </div>
    </section>
  );
}
