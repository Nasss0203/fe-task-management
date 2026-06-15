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
import { useRegister } from "@/features/auth/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { FaApple } from "react-icons/fa";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
	email: z
		.string()
		.min(5, "Bug title must be at least 5 characters.")
		.max(32, "Bug title must be at most 32 characters."),
	username: z
		.string()
		.min(5, "Bug title must be at least 5 characters.")
		.max(32, "Bug title must be at most 32 characters."),
	password: z
		.string()
		// .min(20, "Description must be at least 20 characters.")
		.max(100, "Description must be at most 100 characters."),
});
const SignUp = () => {
	const router = useRouter();
	const { mutate, isPending } = useRegister();
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			username: "",
			password: "",
		},
	});

	function onSubmit(data: z.infer<typeof formSchema>) {
		mutate(data, {
			onSuccess: () => {
				toast.success("Đăng ký thành công!", {
					description: "Vui lòng kiểm tra email của bạn để xác minh tài khoản.",
					position: "bottom-right",
				});
				router.push("/sign-in");
			},
			onError: (err: any) => {
				toast.error("Đăng ký thất bại", {
					description: err?.response?.data?.message || "Đã xảy ra lỗi.",
					position: "bottom-right",
				});
			}
		});
	}
	return (
		<div className='w-125  flex items-center'>
			<Card className='w-full sm:max-w-md '>
				<CardHeader className='mt-10'>
					<CardTitle className='text-2xl'>
						Create your account
					</CardTitle>
					<CardDescription>
						Enter your details below to create your account
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
											Email
										</FieldLabel>
										<Input
											{...field}
											id='form-rhf-demo-title'
											aria-invalid={fieldState.invalid}
											placeholder='Login button not working on mobile'
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
								name='username'
								control={form.control}
								render={({ field, fieldState }) => (
									<Field data-invalid={fieldState.invalid}>
										<FieldLabel htmlFor='form-rhf-demo-title'>
											Username
										</FieldLabel>
										<Input
											{...field}
											id='form-rhf-demo-title'
											aria-invalid={fieldState.invalid}
											placeholder='Login button not working on mobile'
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
											Password
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

						<Field orientation='horizontal'>
							<Button
								type='submit'
								form='form-rhf-demo'
								className='w-full'
							>
								Đăng ký
							</Button>
						</Field>
					</form>
					<div className='flex items-center gap-1 justify-center mt-6 text-xs'>
						<div className='text-neutral-500'>{`Already have an account?`}</div>
						<Link href={"/sign-in"} className='hover:underline'>
							Sign In
						</Link>
					</div>
				</CardContent>
				<CardFooter className='flex-col gap-5 mb-5'>
					<div className='flex items-center gap-3 w-full'>
						<Separator className='flex-1' />
						<span className='text-xs text-neutral-400 whitespace-nowrap'>
							Or continue with
						</span>
						<Separator className='flex-1' />
					</div>
					<div className='w-full '>
						<div className='flex items-center gap-2 justify-between'>
							<Button className='flex items-center gap-1.5 flex-1 text-xs'>
								<FaApple />
								Sign up with Apple
							</Button>
							<GoogleLoginButton></GoogleLoginButton>
						</div>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
};

export default SignUp;
