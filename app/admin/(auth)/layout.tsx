import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session) redirect("/admin/bookings");

  return <>{children}</>;
}
