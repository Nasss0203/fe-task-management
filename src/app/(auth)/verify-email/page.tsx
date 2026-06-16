"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { useVerifyEmail } from "@/features/auth/hooks/useAuth";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Suspense } from "react";

function VerifyEmailContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const { mutate, isPending } = useVerifyEmail();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
	const [errorMsg, setErrorMsg] = useState("");
	const hasFetched = useRef(false);

	useEffect(() => {
		if (!token) {
			setStatus("error");
			setErrorMsg("Mã xác nhận không tồn tại hoặc không hợp lệ.");
			return;
		}

		if (hasFetched.current) return;
		hasFetched.current = true;

		mutate(
			{ token },
			{
				onSuccess: () => setStatus("success"),
				onError: (err: any) => {
					setStatus("error");
					setErrorMsg(
						err?.response?.data?.message || "Đã xảy ra lỗi khi xác nhận email."
					);
				},
			}
		);
	}, [token, mutate]);

	return (
		<div className='w-125 flex items-center'>
			<Card className='w-full sm:max-w-md'>
				<CardHeader className='mt-10 text-center'>
					<CardTitle className='text-2xl'>Xác nhận Email</CardTitle>
					<CardDescription>
						{status === "loading" && "Đang xác nhận tài khoản của bạn..."}
						{status === "success" && "Tài khoản của bạn đã được xác nhận!"}
						{status === "error" && "Không thể xác nhận email."}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center justify-center py-6">
					{status === "loading" && (
						<Loader2 className="h-16 w-16 text-neutral-500 animate-spin" />
					)}
					{status === "success" && (
						<CheckCircle2 className="h-16 w-16 text-green-500" />
					)}
					{status === "error" && (
						<div className="flex flex-col items-center gap-4">
							<XCircle className="h-16 w-16 text-red-500" />
							<p className="text-sm text-red-500 text-center">{errorMsg}</p>
						</div>
					)}

					<div className='flex items-center gap-1 justify-center mt-8 text-sm'>
						<Link href={"/sign-in"}>
							<Button variant={status === "success" ? "default" : "outline"}>
								Quay lại Đăng nhập
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className="w-125 flex items-center justify-center min-h-[50vh]">
					<Loader2 className="h-8 w-8 text-neutral-500 animate-spin" />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
