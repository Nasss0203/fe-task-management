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
import { useResetPassword } from "../model/use-auth";
import { getFriendlyApiErrorMessage } from "@/shared/lib/api-error-message";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const formSchema = z.object({
	password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự.").max(100),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Mật khẩu không khớp",
	path: ["confirmPassword"],
});

const authInputClassName =
	"h-12 rounded-xl border-slate-200 bg-white/85 px-4 shadow-sm focus-visible:border-primary/70 focus-visible:ring-primary/15 dark:border-white/10 dark:bg-white/5";

const submitButtonClassName =
	"h-12 w-full rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30";

function ResetPasswordContent() {
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState("");
	const { mutate, isPending } = useResetPassword();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		if (!token) return;
		mutate(
			{ token, newPassword: data.password },
			{
				onSuccess: () => setStatus("success"),
				onError: (err: unknown) => {
					setStatus("error");
					setErrorMsg(
						getFriendlyApiErrorMessage(
							err,
							"Không thể đặt lại mật khẩu. Vui lòng thử lại.",
						),
					);
				},
			}
		);
	}

	// Invalid token state
	if (!token) {
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
								Liên kết đặt lại mật khẩu không tồn tại hoặc đã hết hạn.
							</p>
						</div>
						<Button asChild size='lg' className='h-11 rounded-xl text-sm font-semibold'>
							<Link href='/forgot-password'>Gửi lại yêu cầu</Link>
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
						Đặt lại mật khẩu
					</CardTitle>
					<CardDescription className='text-[14.5px] leading-6 text-slate-500 dark:text-slate-300'>
						Tạo mật khẩu mới cho tài khoản của bạn.
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
									Mật khẩu đã được cập nhật!
								</h2>
								<p className='mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-300'>
									Mật khẩu của bạn đã được đặt lại thành công.
								</p>
							</div>
							<Button asChild size='lg' className='h-11 w-full max-w-xs rounded-xl text-sm font-semibold shadow-lg shadow-primary/20'>
								<Link href='/sign-in'>Đăng nhập ngay</Link>
							</Button>
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
											<FieldLabel htmlFor='reset-password-new'>Mật khẩu mới</FieldLabel>
											<PasswordInput
												{...field}
												id='reset-password-new'
												aria-invalid={fieldState.invalid}
												className={authInputClassName}
												placeholder='Nhập mật khẩu mới'
												autoComplete='new-password'
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
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
											<FieldLabel htmlFor='reset-password-confirm'>Xác nhận mật khẩu</FieldLabel>
											<PasswordInput
												{...field}
												id='reset-password-confirm'
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
										<span>Cập nhật mật khẩu</span>
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

export default function ResetPasswordPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-[50vh] w-full items-center justify-center'>
					<div className='h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent' />
				</div>
			}
		>
			<ResetPasswordContent />
		</Suspense>
	);
}
