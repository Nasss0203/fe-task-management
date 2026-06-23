"use client";

import { setSessionCookie, setStoredAccessToken, setStoredUser } from "@/lib/auth-storage";
import { getMeApi } from "@/services/auth/auth.service";
import { LayoutGrid } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function LoadingScreen({ message = "Đang đăng nhập..." }: { message?: string }) {
	return (
		<div className='flex flex-col items-center gap-6'>
			{/* Logo */}
			<div className='flex flex-col items-center gap-3'>
				<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-900/20 dark:bg-white dark:text-slate-950'>
					<LayoutGrid className='h-6 w-6' />
				</div>
				<div className='text-center'>
					<div className='text-base font-semibold tracking-tight text-slate-950 dark:text-white'>
						Taskmanly
					</div>
					<div className='text-xs text-slate-500 dark:text-slate-400'>
						Project execution without the clutter
					</div>
				</div>
			</div>

			{/* Spinner + message */}
			<div className='flex flex-col items-center gap-3'>
				<div className='h-7 w-7 animate-spin rounded-full border-[2.5px] border-primary/20 border-t-primary' />
				<p className='text-sm font-medium text-slate-500 dark:text-slate-300'>{message}</p>
			</div>
		</div>
	);
}

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

	return <LoadingScreen message='Đang đăng nhập...' />;
}

export default function AuthCallbackPage() {
	return (
		<Suspense fallback={<LoadingScreen message='Đang xử lý...' />}>
			<AuthCallbackContent />
		</Suspense>
	);
}
