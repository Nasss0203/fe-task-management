"use client";

import type { GetMeResponse } from "@/entities/user";
import { refreshAccessToken } from "@/shared/api/api-client";
import { useSyncExternalStore } from "react";
import { getMeApi } from "../api/auth.api";
import {
  clearStoredAccessToken,
  clearStoredUser,
  setStoredAccessToken,
  setStoredUser,
} from "../lib/auth-storage";

export type AuthSessionSnapshot = {
  isBootstrapping: boolean;
  isBootstrapped: boolean;
  isAuthenticated: boolean;
};

type AuthSessionDependencies = {
  refreshAccessToken: () => Promise<string>;
  getCurrentUser: () => Promise<GetMeResponse>;
  setAccessToken: (accessToken: string) => void;
  setUser: (user: GetMeResponse) => void;
  clearAccessToken: () => void;
  clearUserSnapshot: () => void;
};

const INITIAL_AUTH_SESSION: AuthSessionSnapshot = {
  isBootstrapping: false,
  isBootstrapped: false,
  isAuthenticated: false,
};

const CLEARED_AUTH_SESSION: AuthSessionSnapshot = {
  isBootstrapping: false,
  isBootstrapped: true,
  isAuthenticated: false,
};

export const createAuthSessionLifecycle = (
  dependencies: AuthSessionDependencies,
) => {
  let snapshot = INITIAL_AUTH_SESSION;
  let bootstrapPromise: Promise<boolean> | null = null;
  const listeners = new Set<() => void>();

  const setSnapshot = (nextSnapshot: AuthSessionSnapshot) => {
    snapshot = nextSnapshot;
    listeners.forEach((listener) => listener());
  };

  const attemptCleanup = (cleanup: () => void) => {
    try {
      cleanup();
    } catch {
      // Storage cleanup is best-effort. Session state still fails closed.
    }
  };

  const clear = () => {
    attemptCleanup(dependencies.clearAccessToken);
    attemptCleanup(dependencies.clearUserSnapshot);
    setSnapshot(CLEARED_AUTH_SESSION);
  };

  const loadCurrentUser = async (
    accessToken: string,
  ): Promise<GetMeResponse> => {
    dependencies.setAccessToken(accessToken);
    const user = await dependencies.getCurrentUser();
    dependencies.setUser(user);
    setSnapshot({
      isBootstrapping: false,
      isBootstrapped: true,
      isAuthenticated: true,
    });

    return user;
  };

  const establish = async (accessToken: string): Promise<GetMeResponse> => {
    try {
      return await loadCurrentUser(accessToken);
    } catch (error: unknown) {
      clear();
      throw error;
    }
  };

  const bootstrap = (): Promise<boolean> => {
    if (snapshot.isBootstrapped) {
      return Promise.resolve(snapshot.isAuthenticated);
    }

    if (bootstrapPromise) {
      return bootstrapPromise;
    }

    setSnapshot({
      isBootstrapping: true,
      isBootstrapped: false,
      isAuthenticated: false,
    });

    bootstrapPromise = (async () => {
      let isAuthenticated = false;

      try {
        const accessToken = await dependencies.refreshAccessToken();
        await loadCurrentUser(accessToken);
        isAuthenticated = true;
        return true;
      } catch {
        clear();
        return false;
      } finally {
        if (!isAuthenticated) {
          setSnapshot(CLEARED_AUTH_SESSION);
        }
        bootstrapPromise = null;
      }
    })();

    return bootstrapPromise;
  };

  return {
    bootstrap,
    clear,
    establish,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const authSessionLifecycle = createAuthSessionLifecycle({
  refreshAccessToken,
  getCurrentUser: async () => (await getMeApi()).data,
  setAccessToken: setStoredAccessToken,
  setUser: setStoredUser,
  clearAccessToken: clearStoredAccessToken,
  clearUserSnapshot: clearStoredUser,
});

export const useAuthSessionSnapshot = () =>
  useSyncExternalStore(
    authSessionLifecycle.subscribe,
    authSessionLifecycle.getSnapshot,
    () => INITIAL_AUTH_SESSION,
  );
