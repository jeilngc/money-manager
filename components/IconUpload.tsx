"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Resizes/crops an image file to a square WebP blob so uploads stay small and consistent. */
async function toSquareWebp(file: File, targetSize = 256): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, targetSize, targetSize);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))),
      "image/webp",
      0.9
    );
  });
}

export function IconUpload({
  previewUrl,
  onChange,
}: {
  previewUrl?: string | null;
  onChange: (blob: Blob | null, previewUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Use a PNG, JPEG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be under 2MB.");
      return;
    }
    setBusy(true);
    try {
      const blob = await toSquareWebp(file);
      onChange(blob, URL.createObjectURL(blob));
    } catch {
      setError("Couldn't read that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={cn(
          "relative w-20 h-20 border border-border bg-input flex items-center justify-center overflow-hidden",
          "hover:border-accent transition-colors duration-150 disabled:opacity-50"
        )}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Account icon" className="w-full h-full object-cover" />
        ) : (
          <ImagePlus size={22} strokeWidth={1.5} className="text-mutedForeground" />
        )}
      </button>
      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-mutedForeground">
        {busy ? "Processing\u2026" : "Icon (optional)"}
      </p>
      {error && <p className="mt-1 text-sm text-accent">{error}</p>}
    </div>
  );
}
