"use client";

import {
	AuthCard,
	authInputClassName,
	authSubmitButtonClassName,
} from "./auth-card";
import { Button } from "@/shared/ui/button";
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

const formSchema = z
	.object({
		password: z
			.string()
			.min(8, "Mật khẩu phải chứa ít nhất 8 ký tự.")
			.max(100)
			.regex(/[a-z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái thường.")
			.regex(/[A-Z]/, "Mật khẩu phải chứa ít nhất 1 chữ cái hoa.")
			.regex(/[0-9]/, "Mật khẩu phải chứa ít nhất 1 số.")
			.regex(/[^a-zA-Z0-9]/, "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt."),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Mật khẩu không khớp",
		path: ["confirmPassword"],
	});

function ActivateAdminContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token") || "";
	const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
	const [errorMsg, setErrorMsg] = useState("");

	// Query to check token validity on mount
	const {
		data: activationData,
		isLoading,
		isError,
	} = useVerifyActivationToken(token);
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
			},
		);
	}

	// Loading state while verifying token
	if (isLoading) {
		return (
			<div className='flex min-h-[200px] w-full items-center justify-center'>
				<div className='h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent' />
			</div>
		);
	}

	// Invalid token state (from backend query validation)
	if (!token || isError || !activationData) {
		return (
			<AuthCard
				icon={
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive'>
						<XCircle className='h-5 w-5' />
					</div>
				}
				title='Liên kết không hợp lệ'
				description='Liên kết kích hoạt tài khoản admin này không chính xác hoặc đã hết hạn (48 giờ). Vui lòng liên hệ với Super Admin của bạn để gửi lại lời mời mới.'
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

	if (status === "success") {
		return (
			<AuthCard
				icon={
					<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
						<CheckCircle2 className='h-5 w-5' />
					</div>
				}
				title='Kích hoạt thành công!'
				description='Tài khoản của bạn đã được kích hoạt thành công. Đang tự động đăng nhập và chuyển hướng...'
			/>
		);
	}

	return (
		<AuthCard
			title='Kích hoạt tài khoản'
			description={`Chào mừng ${activationData.username}! Hãy thiết lập mật khẩu mạnh để bảo mật tài khoản quản trị hệ thống của bạn (tài khoản: ${activationData.email}).`}
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
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className='flex flex-col gap-3.5'
			>
				<FieldGroup className='gap-3.5'>
					<Controller
						name='password'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='activation-password' className='text-xs sm:text-sm font-medium text-foreground'>
									Mật khẩu mới
								</FieldLabel>
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
									<p className='text-[11px] text-muted-foreground mt-0.5 leading-snug'>
										Yêu cầu: Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
									</p>
								)}
							</Field>
						)}
					/>

					<Controller
						name='confirmPassword'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={fieldState.invalid} className='gap-1.5'>
								<FieldLabel htmlFor='activation-confirm' className='text-xs sm:text-sm font-medium text-foreground'>
									Xác nhận mật khẩu
								</FieldLabel>
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
					<p className='rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5 text-xs sm:text-sm text-destructive dark:border-destructive/30 dark:bg-destructive/10'>
						{errorMsg}
					</p>
				)}

				<div className='pt-1.5'>
					<Button
						type='submit'
						className={authSubmitButtonClassName}
						disabled={isPending}
					>
						{isPending ? (
							<div className='h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/35 border-t-primary-foreground' />
						) : (
							<span>Kích hoạt và đăng nhập</span>
						)}
					</Button>
				</div>
			</form>
		</AuthCard>
	);
}

export default function ActivateAdminPage() {
	return (
		<Suspense
			fallback={
				<div className='flex min-h-[200px] w-full items-center justify-center'>
					<div className='h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent' />
				</div>
			}
		>
			<ActivateAdminContent />
		</Suspense>
	);
}
