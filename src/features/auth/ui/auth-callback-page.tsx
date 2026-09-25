"use client";

import { authSessionLifecycle } from "../model/auth-session";
import { LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { toast } from "sonner";

function LoadingScreen({
  message = "Đang đăng nhập...",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950">
          <LayoutGrid className="h-6 w-6" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
            Taskmanly
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Project execution without the clutter
          </div>
        </div>
      </div>

      {/* Spinner + message */}
      <div className="flex flex-col items-center gap-3">
        <div className="h-7 w-7 animate-spin rounded-full border-[2.5px] border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
          {message}
        </p>
      </div>
    </div>
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
