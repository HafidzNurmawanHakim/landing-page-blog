import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchForm({ initialValue }: { initialValue: string }) {
  return (
    <form action="/admin/bookings" method="GET" className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        name="search"
        defaultValue={initialValue}
        placeholder="Cari kode / nama..."
        className="rounded-full pl-10"
        aria-label="Cari booking"
      />
    </form>
  );
}
