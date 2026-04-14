import { FcGoogle } from "react-icons/fc";
import { Button } from "../ui/button";

const GoogleLoginButton = () => {
	const handleLoginGoogle = async () => {
		window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
	};

	return (
		<Button
			type='button'
			onClick={handleLoginGoogle}
			className='flex items-center gap-1.5 flex-1 text-xs'
		>
			<FcGoogle size={16} />
			Sign in with Google
		</Button>
	);
};

export default GoogleLoginButton;
