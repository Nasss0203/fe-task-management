import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Ellipsis,
	ExternalLink,
	Link2,
	Pencil,
	Trash2,
	Users,
} from "lucide-react";

const WorkspaceDropdown = () => {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button
					type='button'
					className='flex size-5 items-center justify-center rounded-sm text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'
				>
					<Ellipsis size={14} />
				</button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align='start'
				side='right'
				sideOffset={12}
				className='w-64 border-neutral-700 bg-neutral-900 p-1 text-neutral-200 shadow-xl'
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className='px-2 py-1.5 text-xs font-medium text-neutral-500'>
						Workspace
					</DropdownMenuLabel>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<Pencil size={15} />
						<span>Đổi tên workspace</span>
					</DropdownMenuItem>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<Link2 size={15} />
						<span>Sao chép liên kết</span>
					</DropdownMenuItem>

					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<ExternalLink size={15} />
						<span>Mở trong tab mới</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className='my-1 bg-neutral-800' />

				<DropdownMenuGroup>
					<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm focus:bg-neutral-800 focus:text-neutral-100'>
						<Users size={15} />
						<span>Quản lý thành viên</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator className='my-1 bg-neutral-800' />

				<DropdownMenuItem className='flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300'>
					<Trash2 size={15} />
					<span>Chuyển vào Thùng rác</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export default WorkspaceDropdown;
