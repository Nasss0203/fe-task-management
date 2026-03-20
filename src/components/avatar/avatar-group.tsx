import {
	Avatar,
	AvatarFallback,
	AvatarGroup,
	AvatarGroupCount,
	AvatarImage,
} from "../ui/avatar";

const AvaGroup = () => {
	return (
		<AvatarGroup className=''>
			<Avatar size='sm'>
				<AvatarImage
					src='https://github.com/shadcn.png'
					alt='@shadcn'
				/>
				<AvatarFallback>CN</AvatarFallback>
			</Avatar>
			<Avatar size='sm'>
				<AvatarImage
					src='https://github.com/maxleiter.png'
					alt='@maxleiter'
				/>
				<AvatarFallback>LR</AvatarFallback>
			</Avatar>
			<Avatar size='sm'>
				<AvatarImage
					src='https://github.com/evilrabbit.png'
					alt='@evilrabbit'
				/>
				<AvatarFallback>ER</AvatarFallback>
			</Avatar>
			<AvatarGroupCount>+3</AvatarGroupCount>
		</AvatarGroup>
	);
};

export default AvaGroup;
