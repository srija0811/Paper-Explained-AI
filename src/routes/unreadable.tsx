import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/unreadable")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Unreadable PDF — Paper Explained AI" },
      {
        name: "description",
        content:
          "We couldn't read this PDF. Check that the file is a text-based research paper and try again.",
      },
      { property: "og:title", content: "Unreadable PDF — Paper Explained AI" },
      {
        property: "og:description",
        content: "We couldn't read this PDF. Try a text-based, unlocked research paper.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnreadablePage,
});

function UnreadablePage() {
  const { name } = Route.useSearch();

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="glass-card w-full max-w-xl p-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/15">
          <AlertTriangle className="size-7 text-destructive" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-bold">We couldn&apos;t read that PDF</h1>
        <p className="mt-3 text-muted-foreground">
          {name ? (
            <>
              <span className="font-medium text-foreground">{name}</span> couldn&apos;t be parsed.
            </>
          ) : (
            "The file couldn't be parsed."
          )}{" "}
          This usually happens with scanned images, password-protected files or corrupted uploads.
        </p>

        <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
          <li>• Make sure the file is a real, text-based PDF (not a photo or scan).</li>
          <li>• Remove password protection or DRM before uploading.</li>
          <li>• Try re-exporting the paper from its source, then upload again.</li>
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="bg-gradient-brand inline-flex items-center rounded-xl px-6 py-3 font-display font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try another paper
          </Link>
        </div>
      </div>
    </main>
  );
}
