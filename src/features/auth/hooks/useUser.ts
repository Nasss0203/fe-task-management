"use client";
import { GetMeResponse } from "@/services/auth/type";
import { useState } from "react";

export type User = {
	id: string;
	email: string;
	username: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export const useUser = () => {
	const [user, setUser] = useState<GetMeResponse | undefined>(() => {
		if (typeof window !== "undefined") {
			const rawUser = localStorage.getItem("user");
			if (rawUser) {
				return JSON.parse(rawUser);
			}
		}

		return undefined;
	});

	return { user, setUser };
};
