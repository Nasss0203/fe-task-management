"use client";

import { authSessionLifecycle } from "../model/auth-session";
import { LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

import { AuthCard } from "./auth-card";

function LoadingScreen({
  message = "Đang đăng nhập...",
}: {
  message?: string;
}) {
  return (
    <AuthCard className="text-center">
      <div className="flex flex-col items-center justify-center gap-5 py-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xs">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <div className="text-base font-bold tracking-tight text-foreground">
            Taskmanly
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            The connected workspace
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5 pt-2">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {message}
          </p>
        </div>
      </div>
    </AuthCard>
  );
}

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;

    const handleAuth = async () => {
      if (searchParams.has("error")) {
        authSessionLifecycle.clear();
        toast.error("Google sign-in failed");
        router.replace("/sign-in");
        return;
      }

      try {
        const isAuthenticated = await authSessionLifecycle.bootstrap();
        if (!isAuthenticated) {
          toast.error("Google sign-in failed");
          router.replace("/sign-in");
          return;
        }

        router.replace("/");
      } catch {
        authSessionLifecycle.clear();
        toast.error("Google sign-in failed");
        router.replace("/sign-in");
      }
    };

    void handleAuth();
  }, [searchParams, router]);

  return <LoadingScreen message="Đang đăng nhập..." />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Đang xử lý..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
