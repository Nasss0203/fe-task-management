"use client";

import { Button } from "@/shared/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/shared/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/shared/ui/field";
import { PasswordInput } from "@/shared/ui/password-input";
import { useActivateAdmin, useVerifyActivationToken } from "../model/use-auth";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
	password: z.string()
		.min(8, "Mật khẩu phải chứa ít nhất 8 ký tự.")
		.max(100)
		.regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái thường.")
		.regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái hoa.")
		.regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số.")
		.regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt."),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Mật khẩu không khớp",
	path: ["confirmPassword"],
});

const authInputClassName =
	"h-12 rounded-xl border-slate-200 bg-white/85 px-4 shadow-sm focus-visible:border-primary/70 focus-visible:ring-primary/15 dark:border-white/10 dark:bg-white/5";

const submitButtonClassName =
	"h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30";

function ActivateAdminContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token") || "";
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState("");

	// Query to check token validity on mount
	const { data: activationData, isLoading, isError } = useVerifyActivationToken(token);
	const { mutate: activateAdmin, isPending } = useActivateAdmin();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		if (!token) return;
		activateAdmin(
			{ token, password: data.password },
			{
				onSuccess: () => {
					setStatus("success");
					toast.success("Kích hoạt tài khoản thành công!");
					setTimeout(() => {
						router.push("/");
					}, 1500);
				},
				onError: (err: unknown) => {
					setStatus("error");
					setErrorMsg(
						getFriendlyApiErrorMessage(
							err,
							"Không thể kích hoạt tài khoản. Vui lòng thử lại.",
						),
					);
				},
			}
		);
	}

	// Loading state while verifying token
	if (isLoading) {
		return (
			<div className='flex min-h-[50vh] w-full items-center justify-center'>
				<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
			</div>
		);
	}

	// Invalid token state (from backend query validation)
	if (!token || isError || !activationData) {
		return (
			<div className='mx-auto w-full max-w-md'>
				<Card className='relative w-full overflow-hidden border-white/70 bg-white/[0.92] py-0 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.72]'>
					<div
						aria-hidden='true'
						className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-destructive via-rose-400 to-orange-400'
					/>
					<CardContent className='flex flex-col items-center gap-5 px-6 py-10 sm:px-8 text-center'>
						<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20'>
							<XCircle className='h-7 w-7' />
						</div>
						<div>
							<h2 className='text-xl font-semibold text-slate-950 dark:text-white'>Liên kết không hợp lệ</h2>
							<p className='mt-2 text-sm leading-6 text-slate-500 dark:text-slate-300'>
								Liên kết kích hoạt tài khoản admin này không chính xác hoặc đã hết hạn (48 giờ). Vui lòng liên hệ với Super Admin của bạn để gửi lại lời mời mới.
							</p>
						</div>
						<Button asChild size='lg' className='h-11 rounded-xl text-sm font-semibold'>
							<Link href='/sign-in'>Quay lại đăng nhập</Link>
						</Button>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='mx-auto w-full max-w-md'>
			<Card className='relative w-full overflow-hidden border-white/70 bg-white/[0.92] py-0 shadow-[0_36px_90px_-48px_rgba(15,23,42,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/[0.72]'>
				<div
					aria-hidden='true'
					className='absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-sky-400 to-cyan-300'
				/>

				<CardHeader className='gap-3 px-6 pb-0 pt-8 sm:px-8'>
					<CardTitle className='text-[1.75rem] font-semibold tracking-tight text-slate-950 dark:text-white'>
						Kích hoạt tài khoản
					</CardTitle>
					<CardDescription className='text-[14.5px] leading-6 text-slate-500 dark:text-slate-300'>
						Chào mừng <strong>{activationData.username}</strong>! Hãy thiết lập mật khẩu mạnh để bảo mật tài khoản quản trị hệ thống của bạn (tài khoản: {activationData.email}).
					</CardDescription>
				</CardHeader>

				<CardContent className='px-6 pb-8 pt-6 sm:px-8'>
					{status === "success" ? (
						<div className='flex flex-col items-center gap-5 py-2 text-center'>
							<div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300'>
								<CheckCircle2 className='h-7 w-7' />
							</div>
							<div>
								<h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
									Kích hoạt thành công!
								</h2>
								<p className='mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-300'>
									Tài khoản của bạn đã được kích hoạt thành công. Đang tự động đăng nhập và chuyển hướng...
								</p>
							</div>
						</div>
					) : (
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col gap-5'
						>
							<FieldGroup>
								<Controller
									name='password'
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor='activation-password'>Mật khẩu mới</FieldLabel>
											<PasswordInput
												{...field}
												id='activation-password'
												aria-invalid={fieldState.invalid}
												className={authInputClassName}
												placeholder='Nhập mật khẩu mới'
												autoComplete='new-password'
											/>
											{fieldState.invalid ? (
												<FieldError errors={[fieldState.error]} />
											) : (
												<p className="mt-1 text-xs text-slate-400">
													Yêu cầu: Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
												</p>
											)}
										</Field>
									)}
								/>
							</FieldGroup>

							<FieldGroup>
								<Controller
									name='confirmPassword'
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel htmlFor='activation-confirm'>Xác nhận mật khẩu</FieldLabel>
											<PasswordInput
												{...field}
												id='activation-confirm'
												aria-invalid={fieldState.invalid}
												className={authInputClassName}
												placeholder='Nhập lại mật khẩu'
												autoComplete='new-password'
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</FieldGroup>

							{status === "error" && (
								<p className='rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10'>
									{errorMsg}
								</p>
							)}

							<Field orientation='horizontal' className='pt-1'>
								<Button
									type='submit'
									size='lg'
									className={submitButtonClassName}
									disabled={isPending}
								>
									{isPending ? (
										<div className='h-5 w-5 animate-spin rounded-full border-[2.5px] border-white/35 border-t-white' />
									) : (
										<span>Kích hoạt và đăng nhập</span>
									)}
								</Button>
							</Field>

							<div className='flex justify-center'>
								<Link
									href='/sign-in'
									className='inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary dark:text-slate-300 dark:hover:text-white'
								>
									<ArrowLeft className='h-4 w-4' />
									Quay lại đăng nhập
								</Link>
							</div>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

export default function ActivateAdminPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-[50vh] w-full items-center justify-center'>
					<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
				</div>
			}
		>
			<ActivateAdminContent />
		</Suspense>
	);
}
