"use client";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import { useVerifyEmail } from "../model/use-auth";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { ArrowLeft, CheckCircle2, Mail, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const { mutate } = useVerifyEmail();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [errorMsg, setErrorMsg] = useState("");
	const hasFetched = useRef(false);
	const currentStatus = token ? status : "check-email";

	useEffect(() => {
		if (!token) return;
		if (hasFetched.current) return;
		hasFetched.current = true;
		mutate(
			{ token },
			{
				onSuccess: (userData) => {
					if (userData) {
						router.replace("/");
						return;
					}

					setStatus("success");
				},
				onError: (err: unknown) => {
					setStatus("error");
					setErrorMsg(
						getFriendlyApiErrorMessage(
							err,
							"Không thể xác nhận email. Liên kết có thể đã hết hạn.",
						),
					);
				},
			}
		);
	}, [token, mutate, router]);

	// Gradient bar color by status
	const gradientBar: Record<string, string> = {
		"check-email": "from-primary via-sky-400 to-cyan-300",
		loading: "from-primary via-sky-400 to-cyan-300",
		success: "from-emerald-500 via-teal-400 to-cyan-400",
		error: "from-destructive via-rose-400 to-orange-400",
	};

	return (
		<div className='mx-auto w-full max-w-md'>
			<Card className='relative w-full overflow-hidden border-white/70 bg-white/[0.92] py-0 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.72]'>
				<div
					aria-hidden='true'
					className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${gradientBar[currentStatus]}`}
				/>

				{/* check-email state */}
				{currentStatus === "check-email" && (
					<>
						<CardHeader className='gap-3 px-6 pb-0 pt-8 sm:px-8'>
							<div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground'>
								<Mail className='h-5 w-5' />
							</div>
							<CardTitle className='text-[1.75rem] font-semibold tracking-tight text-slate-950 dark:text-white'>
								Xác nhận Email
							</CardTitle>
							<CardDescription className='text-[14.5px] leading-6 text-slate-500 dark:text-slate-300'>
								Vui lòng xác minh địa chỉ email của bạn.
							</CardDescription>
						</CardHeader>
						<CardContent className='px-6 pb-8 pt-6 sm:px-8'>
							<p className='mb-6 text-sm leading-6 text-slate-500 dark:text-slate-300'>
								Chúng tôi đã gửi một liên kết xác thực đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (bao gồm cả thư rác) và bấm vào nút xác nhận để kích hoạt tài khoản.
							</p>
							<Link
								href='/sign-in'
								className='inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-300 dark:hover:text-white'
							>
								<ArrowLeft className='h-4 w-4' />
								Quay lại đăng nhập
							</Link>
						</CardContent>
					</>
				)}

				{/* loading state */}
				{currentStatus === "loading" && (
					<CardContent className='flex flex-col items-center gap-5 px-6 py-12 text-center sm:px-8'>
						<div className='h-10 w-10 animate-spin rounded-full border-[3px] border-primary/20 border-t-primary' />
						<div>
							<h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
								Đang xác nhận...
							</h2>
							<p className='mt-1 text-sm text-slate-500 dark:text-slate-300'>
								Vui lòng chờ trong giây lát.
							</p>
						</div>
					</CardContent>
				)}

				{/* success state */}
				{currentStatus === "success" && (
					<CardContent className='flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-8'>
						<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300'>
							<CheckCircle2 className='h-7 w-7' />
						</div>
						<div>
							<h2 className='text-xl font-semibold text-slate-950 dark:text-white'>
								Xác nhận thành công!
							</h2>
							<p className='mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300'>
								Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
							</p>
						</div>
						<Button asChild size='lg' className='h-11 w-full max-w-xs rounded-xl text-sm font-semibold shadow-lg shadow-primary/20'>
							<Link href='/sign-in'>Đăng nhập ngay</Link>
						</Button>
					</CardContent>
				)}

				{/* error state */}
				{currentStatus === "error" && (
					<CardContent className='flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-8'>
						<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20'>
							<XCircle className='h-7 w-7' />
						</div>
						<div>
							<h2 className='text-xl font-semibold text-slate-950 dark:text-white'>
								Xác nhận thất bại
							</h2>
							<p className='mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300'>
								{errorMsg}
							</p>
						</div>
						<div className='flex w-full max-w-xs flex-col gap-3'>
							<Button asChild size='lg' className='h-11 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20'>
								<Link href='/sign-in'>Quay lại đăng nhập</Link>
							</Button>
						</div>
					</CardContent>
				)}
			</Card>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-[50vh] w-full items-center justify-center'>
					<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
