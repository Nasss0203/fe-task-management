"use client";

import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  authSessionLifecycle,
  useAuthSessionSnapshot,
} from "../model/auth-session";

const GOOGLE_CALLBACK_PATH = "/callback";

export function AuthBootstrap({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const session = useAuthSessionSnapshot();
  const isGoogleCallback = pathname === GOOGLE_CALLBACK_PATH;

  useEffect(() => {
    if (isGoogleCallback) {
      return;
    }

    void authSessionLifecycle.bootstrap().catch(() => {
      authSessionLifecycle.clear();
    });
  }, [isGoogleCallback]);

  if (!isGoogleCallback && !session.isBootstrapped) {
    return null;
  }

  return children;
}
