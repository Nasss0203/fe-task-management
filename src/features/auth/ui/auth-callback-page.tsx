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
      <div className="flex flex-col items-center justify-center gap-3 py-6">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div>
          <div className="text-[15px] font-bold tracking-tight text-foreground">
            Taskmanly
          </div>
          <div className="text-xs text-muted-foreground">
            The connected workspace
          </div>
        </div>
        <div className="flex flex-col items-center gap-2.5 pt-2">
          <div className="size-7 animate-spin rounded-full border-[3px] border-ring/20 border-t-ring" />
          <p className="text-[13px] font-medium text-muted-foreground">
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
