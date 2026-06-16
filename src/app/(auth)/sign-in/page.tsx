"use client";

import GoogleLoginButton from "@/components/button/GoogleLoginButton";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { useLogin, useResendVerification } from "@/features/auth/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { FaApple } from "react-icons/fa";
import z from "zod";
import { SystemRole } from "@/services/auth/type";
import { toast } from "sonner";

const formSchema = z.object({
	email: z
		.string()
		.min(5, "Email phải có ít nhất 5 ký tự.")
		.max(32, "Email không được vượt quá 32 ký tự."),
	password: z
		.string()
		// .min(20, "Description must be at least 20 characters.")
		.max(100, "Mật khẩu không được vượt quá 100 ký tự."),
});
const SignIn = () => {
	const router = useRouter();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "user1@gmail.com",
			password: "1234567890",
		},
	});

	const { mutate, isPending } = useLogin();

	const { mutate: resendVerify } = useResendVerification();

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: (userData) => {
				if (userData.systemRole === SystemRole.USER) {
					router.push("/dashboard");
				} else if (
					userData.systemRole === SystemRole.SYSTEM_ADMIN ||
					userData.systemRole === SystemRole.SUPER_ADMIN
				) {
					router.push("/admin");
				} else {
					router.push("/dashboard");
				}
			},
			onError: (err: any) => {
				const errorCode = err?.response?.data?.code;
				if (errorCode === "EMAIL_NOT_VERIFIED") {
					toast.error("Tài khoản chưa được xác minh", {
						description: "Vui lòng kiểm tra email của bạn để xác minh tài khoản.",
						action: {
							label: "Gửi lại email",
							onClick: () => {
								resendVerify({ email: data.email }, {
									onSuccess: () => toast.success("Đã gửi lại email xác nhận", { description: "Vui lòng kiểm tra hộp thư của bạn." }),
									onError: () => toast.error("Có lỗi xảy ra khi gửi lại email")
								});
							}
						}
					});
				} else {
					toast.error("Đăng nhập thất bại", {
						description: err?.response?.data?.message || "Sai email hoặc mật khẩu",
					});
				}
			}
		});
	}
	return (
		<div className='w-125  flex items-center'>
			<Card className='w-full sm:max-w-md '>
				<CardHeader className='mt-10'>
					<CardTitle className='text-2xl'>
						Đăng nhập vào tài khoản
					</CardTitle>
					<CardDescription>
						Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						id='form-rhf-demo'
						onSubmit={form.handleSubmit(onSubmit)}
						className='flex flex-col gap-5'
					>
						<FieldGroup>
							<Controller
								name='email'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor='form-rhf-demo-title'>
											Email hoặc tên đăng nhập
										</FieldLabel>
										<Input
											{...field}
											id='form-rhf-demo-title'
											aria-invalid={fieldState.invalid}
											placeholder='member6 or member6@gmail.com'
											autoComplete='off'
										/>
										{fieldState.invalid && (
											<FieldError
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								)}
							/>
						</FieldGroup>
						<FieldGroup>
							<Controller
								name='password'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor='form-rhf-demo-title'>
											Mật khẩu
										</FieldLabel>
										<PasswordInput
											{...field}
											id='form-rhf-demo-title'
											aria-invalid={fieldState.invalid}
											placeholder='Nhập mật khẩu'
											autoComplete='off'
										/>
										{fieldState.invalid && (
											<FieldError
												errors={[fieldState.error]}
											/>
										)}
									</Field>
								)}
							/>
						</FieldGroup>
						<Field
							orientation='horizontal'
							className='flex items-center justify-between'
						>
							<div></div>
							<Link href='/forgot-password' className='text-xs hover:underline cursor-pointer'>
								Quên mật khẩu?
							</Link>
						</Field>
						<Field orientation='horizontal'>
							<Button
								type='submit'
								form='form-rhf-demo'
								className={`w-full ${isPending ? "disabled:bg-neutral-500" : ""}`}
								disabled={isPending ? true : false}
							>
								{isPending ? (
									<div className='h-6 w-6 border-[3px] border-neutral-600 border-t-black rounded-full animate-spin'></div>
								) : (
									<span>Đăng nhập</span>
								)}
							</Button>
						</Field>
					</form>
					<div className='flex items-center gap-1 justify-center mt-6 text-xs'>
						<div className='text-neutral-500'>Bạn chưa có tài khoản?</div>
						<Link href={"/sign-up"} className='hover:underline'>
							Đăng ký
						</Link>
					</div>
				</CardContent>
				<CardFooter className='flex-col gap-5 mb-5'>
					<div className='flex items-center gap-3 w-full'>
						<Separator className='flex-1' />
						<span className='text-xs text-neutral-400 whitespace-nowrap'>
							Hoặc tiếp tục với
						</span>
						<Separator className='flex-1' />
					</div>
					<div className='w-full '>
						<div className='flex items-center gap-2 justify-between'>
							<Button className='flex items-center gap-1.5 flex-1 text-xs'>
								<FaApple />
								Đăng nhập bằng Apple
							</Button>
							<GoogleLoginButton></GoogleLoginButton>
						</div>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default SignIn;
