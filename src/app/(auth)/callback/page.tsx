"use client";

import { setStoredAccessToken } from "@/lib/auth-storage";
import { getMeApi } from "@/services/auth/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const handleAuth = async () => {
			const accessToken = searchParams.get("access_token");

			if (!accessToken) {
				router.replace("/login");
				return;
			}

			setStoredAccessToken(accessToken);

			const me = await getMeApi();

			if (me?.data) {
				localStorage.setItem("user", JSON.stringify(me.data));
			}

			router.replace("/dashboard");
		};

		handleAuth();
	}, [searchParams, router]);

	return <div>Dang dang nhap...</div>;
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={<div>Dang xu ly dang nhap...</div>}>
			<AuthCallbackContent />
		</Suspense>
	);
}
