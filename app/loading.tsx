import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="container flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Memuat...</span>
      </div>
    </main>
  );
}
