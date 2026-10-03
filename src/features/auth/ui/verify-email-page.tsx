"use client";

import {
	AuthCard,
	authSubmitButtonClassName,
} from "./auth-card";
import { Button } from "@/shared/ui/button";
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
			},
		);
	}, [token, mutate, router]);

	if (currentStatus === "check-email") {
		return (
			<AuthCard
				icon={
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
						<Mail className='h-5 w-5' />
					</div>
				}
				title='Xác nhận Email'
				description='Vui lòng kiểm tra hộp thư email của bạn.'
				footer={
					<div className='flex justify-center w-full'>
						<Link
							href='/sign-in'
							className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
						>
							<ArrowLeft className='h-3.5 w-3.5' />
							Quay lại đăng nhập
						</Link>
					</div>
				}
			>
				<p className='py-2 text-xs sm:text-sm leading-relaxed text-muted-foreground'>
					Chúng tôi đã gửi một liên kết xác thực đến địa chỉ email của bạn.
					Vui lòng kiểm tra hộp thư (bao gồm cả thư rác/spam) và bấm vào liên kết
					để kích hoạt tài khoản.
				</p>
			</AuthCard>
		);
	}

	if (currentStatus === "loading") {
		return (
			<AuthCard>
				<div className='flex flex-col items-center gap-4 py-8 text-center'>
					<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary' />
					<div className='space-y-1'>
						<h2 className='text-base font-semibold text-foreground'>
							Đang xác nhận email...
						</h2>
						<p className='text-xs sm:text-sm text-muted-foreground'>
							Vui lòng chờ trong giây lát.
						</p>
					</div>
				</div>
			</AuthCard>
		);
	}

	if (currentStatus === "success") {
		return (
			<AuthCard
				icon={
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
						<CheckCircle2 className='h-5 w-5' />
					</div>
				}
				title='Xác nhận thành công!'
				description='Tài khoản của bạn đã được kích hoạt thành công. Bạn có thể đăng nhập ngay bây giờ.'
			>
				<div className='pt-2'>
					<Button asChild className={authSubmitButtonClassName}>
						<Link href='/sign-in'>Đăng nhập ngay</Link>
					</Button>
				</div>
			</AuthCard>
		);
	}

	return (
		<AuthCard
			icon={
				<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
					<XCircle className='h-5 w-5' />
				</div>
			}
			title='Xác nhận thất bại'
			description={errorMsg || "Không thể xác nhận email. Liên kết có thể đã hết hạn."}
			footer={
				<div className='flex justify-center w-full'>
					<Link
						href='/sign-in'
						className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors'
					>
						<ArrowLeft className='h-3.5 w-3.5' />
						Quay lại đăng nhập
					</Link>
				</div>
			}
		>
			<div className='pt-2'>
				<Button asChild className={authSubmitButtonClassName}>
					<Link href='/sign-in'>Quay lại đăng nhập</Link>
				</Button>
			</div>
		</AuthCard>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-[200px] w-full items-center justify-center'>
					<div className='h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent' />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
