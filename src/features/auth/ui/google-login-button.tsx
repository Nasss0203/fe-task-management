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
				"flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-background/80 text-sm font-medium text-foreground shadow-2xs transition-colors hover:bg-muted/60",
				className
			)}
		>
			<FcGoogle className='h-4.5 w-4.5 shrink-0' />
			<span>{label}</span>
		</Button>
	);
};

export default GoogleLoginButton;
