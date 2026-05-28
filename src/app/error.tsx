"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-zinc-400">
        {error.message || "The app failed to load. Try a clean restart."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500"
      >
        Try again
      </button>
      <p className="font-mono text-xs text-zinc-600">
        Tip: stop dev server, run{" "}
        <code className="text-zinc-400">rm -rf .next && npm run dev</code>
      </p>
    </main>
  );
}
