"use client";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useResetPassword } from "@/features/auth/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const formSchema = z.object({
	password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự.").max(100),
	confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
	message: "Mật khẩu không khớp",
	path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
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

	if (!token) {
		return (
			<div className='w-125 flex items-center'>
				<Card className='w-full sm:max-w-md'>
					<CardHeader className='mt-10 text-center'>
						<CardTitle className='text-2xl text-red-500'>Liên kết không hợp lệ</CardTitle>
					</CardHeader>
					<CardContent className="flex flex-col items-center gap-4">
						<XCircle className="h-16 w-16 text-red-500" />
						<p className="text-sm text-center">Liên kết đặt lại mật khẩu không tồn tại hoặc đã hết hạn.</p>
						<Link href={"/forgot-password"}>
							<Button variant="outline">Gửi lại yêu cầu</Button>
						</Link>
					</CardContent>
				</Card>
			</div>
		);
	}

	function onSubmit(data: z.infer<typeof formSchema>) {
		if (!token) return;
		mutate(
			{ token, newPassword: data.password },
			{
				onSuccess: () => setStatus("success"),
				onError: (err: any) => {
					setStatus("error");
					setErrorMsg(err?.response?.data?.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.");
				},
			}
		);
	}

	return (
		<div className='w-125 flex items-center'>
			<Card className='w-full sm:max-w-md'>
				<CardHeader className='mt-10'>
					<CardTitle className='text-2xl'>Đặt lại mật khẩu</CardTitle>
					<CardDescription>
						Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{status === "success" ? (
						<div className="flex flex-col items-center justify-center py-6 gap-4">
							<CheckCircle2 className="h-16 w-16 text-green-500" />
							<p className="text-sm text-center text-neutral-600">
								Mật khẩu của bạn đã được đặt lại thành công!
							</p>
							<Link href={"/sign-in"} className="mt-4">
								<Button>Đăng nhập ngay</Button>
							</Link>
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
											<FieldLabel>Mật khẩu mới</FieldLabel>
											<PasswordInput
												{...field}
												aria-invalid={fieldState.invalid}
												placeholder='Nhập mật khẩu mới'
												autoComplete='off'
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
											<FieldLabel>Xác nhận mật khẩu</FieldLabel>
											<PasswordInput
												{...field}
												aria-invalid={fieldState.invalid}
												placeholder='Nhập lại mật khẩu'
												autoComplete='off'
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</FieldGroup>

							{status === "error" && (
								<p className="text-sm text-red-500 text-center">{errorMsg}</p>
							)}

							<Field orientation='horizontal'>
								<Button
									type='submit'
									className={`w-full ${isPending ? "disabled:bg-neutral-500" : ""}`}
									disabled={isPending}
								>
									{isPending ? (
										<div className='h-6 w-6 border-[3px] border-neutral-600 border-t-black rounded-full animate-spin'></div>
									) : (
										<span>Cập nhật mật khẩu</span>
									)}
								</Button>
							</Field>
						</form>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
