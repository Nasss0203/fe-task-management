"use client";

import { configureApiClientAuth } from "@/shared/api/api-client";
import {
	clearStoredAuth,
	getStoredAccessToken,
	setStoredAccessToken,
} from "./auth-storage";

let isConfigured = false;

export const configureAuthClient = () => {
	if (isConfigured) {
		return;
	}

	configureApiClientAuth({
		getAccessToken: getStoredAccessToken,
		setAccessToken: setStoredAccessToken,
		clearAuth: clearStoredAuth,
	});
	isConfigured = true;
};
