import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-4xl text-ink">{title}</h1>
        {sub && <p className="mt-1 text-sm text-ink-faint">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
  className,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
      />
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
      />
    </div>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ImageField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      onChange(json.url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className={className}>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">
        {label}
      </label>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          className="relative h-24 w-20 shrink-0 overflow-hidden border border-ink/15 bg-cream text-ink-faint transition-colors hover:border-rose disabled:opacity-60"
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="mx-auto h-5 w-5" strokeWidth={1.5} />
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center bg-cream/80">
              <Loader2 className="h-4 w-4 animate-spin text-rose" />
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={value}
            placeholder="Upload an image, or paste a URL"
            onChange={(e) => onChange(e.target.value)}
            className="w-full border border-ink/15 bg-cream px-3 py-2.5 text-sm text-ink outline-none focus:border-rose"
          />
          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="text-[10px] font-medium uppercase tracking-[0.22em] text-rose hover:underline disabled:opacity-50"
            >
              {busy ? "Uploading…" : "Choose file"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint hover:text-rose"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
        }}
      />
    </div>
  );
}

export function SwitchField({
  label,
  checked,
  onChange,
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between border border-ink/15 bg-cream px-3 py-2.5", className)}>
      <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-faint">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-gold-soft text-ink",
    confirmed: "bg-rose-soft text-rose-deep",
    delivered: "bg-[#E2EFDA] text-[#3E6B2F]",
    cancelled: "bg-ink/10 text-ink-faint",
  };
  return (
    <span className={cn("px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]", styles[status] ?? "bg-ink/10")}>
      {status}
    </span>
  );
}
