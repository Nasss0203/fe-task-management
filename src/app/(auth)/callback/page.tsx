"use client";

import { setSessionCookie, setStoredAccessToken, setStoredUser } from "@/lib/auth-storage";
import { getMeApi } from "@/services/auth/auth.service";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";

function AuthCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		const handleAuth = async () => {
			const accessToken = searchParams.get("access_token");
			const refreshToken = searchParams.get("refresh_token");

			if (!accessToken) {
				router.replace("/login");
				return;
			}

			setStoredAccessToken(accessToken);

			if (refreshToken) {
				await setSessionCookie(refreshToken);
			}

			const me = await getMeApi();

			if (me?.data) {
				setStoredUser(me.data);
			}

			router.replace("/dashboard");
		};

		handleAuth();
	}, [searchParams, router]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
			<p className="text-muted-foreground font-medium">Đang đăng nhập...</p>
		</div>
	);
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={
			<div className="flex flex-col items-center justify-center min-h-screen gap-4">
				<Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
				<p className="text-muted-foreground font-medium">Đang xử lý đăng nhập...</p>
			</div>
		}>
			<AuthCallbackContent />
		</Suspense>
	);
}
