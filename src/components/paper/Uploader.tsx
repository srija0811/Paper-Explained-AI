import { useCallback, useRef, useState } from "react";
import { FileText, Sparkles, UploadCloud, X } from "lucide-react";

type Props = {
  file: File | null;
  onFile: (file: File | null) => void;
  onGenerate: () => void;
  busy: boolean;
};

export function Uploader({ file, onFile, onGenerate, busy }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) onFile(dropped);
    },
    [onFile],
  );

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="glass-card p-6 sm:p-8">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => {
          onFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={openPicker}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all ${
          dragging
            ? "border-primary bg-primary/10 scale-[1.01]"
            : "border-border bg-surface/40 hover:border-primary/60 hover:bg-primary/5"
        }`}
      >
        <div className="bg-gradient-brand mb-4 flex size-14 items-center justify-center rounded-2xl glow-ring">
          <UploadCloud className="size-7 text-primary-foreground" />
        </div>
        <p className="font-display text-lg font-semibold">Drop your research paper here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF up to 40 MB — or click to browse your files
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            openPicker();
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-muted"
        >
          <FileText className="size-4" /> Upload PDF
        </button>

      {file && (
        <div className="mt-5 flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="size-5 shrink-0 text-accent" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={() => onFile(null)}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <button
        type="button"
        disabled={!file || busy}
        onClick={onGenerate}
        className="bg-gradient-brand mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-display text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Sparkles className="size-5" />
        {busy ? "Generating…" : "Generate Explanation"}
      </button>
    </div>
  );
}
