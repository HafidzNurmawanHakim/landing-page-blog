"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";
import { loginAdmin } from "@/app/actions/admin";
import { cn } from "@/lib/utils";
import { humanizeError } from "@/lib/utils/errors";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setIsSubmitting(true);
    setFormError(null);

    try {
      const result = await loginAdmin(values);
      if (!result.success) {
        setFormError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success("Selamat datang kembali!");
      router.push("/admin/bookings");
      router.refresh();
    } catch (err) {
      const message = humanizeError(err, "Terjadi kesalahan. Coba lagi.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="container flex min-h-screen items-center justify-center py-12">
      <div className="absolute top-12 left-1/2 -translate-x-1/2">
        <Logo size="lg" />
      </div>
      <Card className="w-full max-w-md rounded-3xl">
        <CardHeader className="items-center gap-3 text-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login Admin
            </h1>
            <p className="text-sm text-muted-foreground">
              Masuk untuk mengelola booking.
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {formError && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-2 rounded-full bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className={cn(
                  "rounded-full",
                  errors.email && "border-destructive",
                )}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                className={cn(
                  "rounded-full",
                  errors.password && "border-destructive",
                )}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full rounded-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
