import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
	variant = "default",
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
			className={cn("flex items-center gap-1.5", className)}
		>
			<FcGoogle size={16} />
			{label}
		</Button>
	);
};

export default GoogleLoginButton;
