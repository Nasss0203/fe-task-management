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
import { useForgotPassword } from "@/features/auth/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
	email: z.string().email("Email không hợp lệ").min(5).max(100),
});

export default function ForgotPasswordPage() {
	const [isSubmitted, setIsSubmitted] = useState(false);
	const { mutate, isPending } = useForgotPassword();

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: () => setIsSubmitted(true),
			onError: () => setIsSubmitted(true), // Always show success to prevent enumeration
		});
	}

	return (
		<div className='w-125 flex items-center'>
			<Card className='w-full sm:max-w-md'>
				<CardHeader className='mt-10'>
					<CardTitle className='text-2xl'>Quên mật khẩu</CardTitle>
					<CardDescription>
						Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isSubmitted ? (
						<div className="flex flex-col items-center justify-center py-6 gap-4">
							<CheckCircle2 className="h-16 w-16 text-green-500" />
							<p className="text-sm text-center text-neutral-600">
								Nếu email tồn tại trong hệ thống, bạn sẽ nhận được một email chứa liên kết đặt lại mật khẩu.
							</p>
							<Link href={"/sign-in"} className="mt-4">
								<Button variant="outline">Quay lại Đăng nhập</Button>
							</Link>
						</div>
					) : (
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='flex flex-col gap-5'
						>
							<FieldGroup>
								<Controller
									name='email'
									control={form.control}
									render={({ field, fieldState }) => (
										<Field data-invalid={fieldState.invalid}>
											<FieldLabel>Email</FieldLabel>
											<Input
												{...field}
												aria-invalid={fieldState.invalid}
												placeholder='Nhập email của bạn'
												autoComplete='off'
											/>
											{fieldState.invalid && (
												<FieldError errors={[fieldState.error]} />
											)}
										</Field>
									)}
								/>
							</FieldGroup>
							<Field orientation='horizontal'>
								<Button
									type='submit'
									className={`w-full ${isPending ? "disabled:bg-neutral-500" : ""}`}
									disabled={isPending}
								>
									{isPending ? (
										<div className='h-6 w-6 border-[3px] border-neutral-600 border-t-black rounded-full animate-spin'></div>
									) : (
										<span>Gửi yêu cầu</span>
									)}
								</Button>
							</Field>
						</form>
					)}
					{!isSubmitted && (
						<div className='flex items-center gap-1 justify-center mt-6 text-xs'>
							<Link href={"/sign-in"} className='hover:underline'>
								Quay lại Đăng nhập
							</Link>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
