import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import type { ComponentProps } from "react";
import { FcGoogle } from "react-icons/fc";

interface GoogleLoginButtonProps {
	className?: string;
	label?: string;
	variant?: ComponentProps<typeof Button>["variant"];
	size?: ComponentProps<typeof Button>["size"];
}

const GoogleLoginButton = ({
	className,
	label = "Tiếp tục với Google",
	variant = "outline",
	size = "default",
}: GoogleLoginButtonProps) => {
	const handleLoginGoogle = async () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
	};

	return (
		<Button
			type='button'
			variant={variant}
			size={size}
			onClick={handleLoginGoogle}
			className={cn(
				"flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground shadow-none transition-colors hover:bg-accent",
				className
			)}
		>
			<FcGoogle className='size-4 shrink-0' />
			<span>{label}</span>
		</Button>
	);
};

export default GoogleLoginButton;
