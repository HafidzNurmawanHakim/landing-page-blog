import { redirect } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Menu } from "lucide-react";
import { requireAdmin } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { LogoutButton } from "./logout-button";
import { AdminNav } from "@/components/admin/admin-nav";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="flex">
        <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-secondary bg-background p-4 lg:flex">
          <div className="flex items-center gap-2 px-2 pb-6 pt-2">
            <Logo href="/admin" />
          </div>
          <AdminNav />
          <div className="mt-auto space-y-3 border-t border-secondary pt-4">
            <p className="truncate px-4 text-sm font-medium">{session.name}</p>
            <p className="truncate px-4 text-xs text-muted-foreground">
              {session.email}
            </p>
            <LogoutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-secondary bg-background/80 backdrop-blur">
            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2">
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Buka menu</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-4">
                      <SheetTitle className="sr-only">Menu Admin</SheetTitle>
                      <div className="mb-6 flex items-center gap-2 px-2 pt-2">
                        <Logo href="/admin" />
                      </div>
                      <AdminNav />
                      <div className="mt-8 space-y-3 border-t border-secondary pt-4">
                        <p className="truncate px-4 text-sm font-medium">
                          {session.name}
                        </p>
                        <p className="truncate px-4 text-xs text-muted-foreground">
                          {session.email}
                        </p>
                        <LogoutButton />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <span className="text-lg font-semibold tracking-tight">
                  Panel Admin
                </span>
              </div>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Lihat Situs
                </Link>
              </Button>
            </div>
          </header>

          <main className="px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
