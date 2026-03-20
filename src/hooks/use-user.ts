"use client";
import { GetMeResponse } from "@/services/auth/type";
import { useEffect, useState } from "react";

export type User = {
	id: string;
	email: string;
	username: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export const useUser = () => {
	const [user, setUser] = useState<GetMeResponse>();

	useEffect(() => {
		if (typeof window !== "undefined") {
			const rawUser = localStorage.getItem("user");
			if (rawUser) {
				setUser(JSON.parse(rawUser));
			}
		}
	}, []);

	return { user, setUser };
};
