"use client";

import { configureApiClientAuth } from "@/shared/api/api-client";
import { getStoredAccessToken, setStoredAccessToken } from "./auth-storage";
import { authSessionLifecycle } from "../model/auth-session";

let isConfigured = false;

export const configureAuthClient = () => {
  if (isConfigured) {
    return;
  }

  configureApiClientAuth({
    getAccessToken: getStoredAccessToken,
    setAccessToken: setStoredAccessToken,
    clearAuth: authSessionLifecycle.clear,
  });
  isConfigured = true;
};
