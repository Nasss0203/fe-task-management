"use client";

import { getMeApi } from "@/services/auth/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function AuthCallbackPage() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const handleAuth = async () => {
			const accessToken = searchParams.get("access_token");

			if (!accessToken) {
				router.replace("/login");
				return;
			}

			localStorage.setItem("access_token", accessToken);

			const me = await getMeApi();

			if (me?.data) {
				localStorage.setItem("user", JSON.stringify(me.data));
			}

			router.replace("/dashboard");
		};

		handleAuth();
	}, [searchParams, router]);

	return <div>Đang đăng nhập...</div>;
}
