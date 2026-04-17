import { Ellipsis } from "lucide-react";
import { columns } from "../table/columns";
import { DataTable } from "../table/data-table";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "../ui/drawer";

type TaskItem = {
	name: string;
	status: string;
	deadline: string;
};

const data: TaskItem[] = [
	{
		name: "Nam Nguyen",
		status: "Đang thực hiện",
		deadline: "04/25/2026",
	},
];
export function DrawerItemView({ name }: { name: string }) {
	return (
		<Drawer direction='right'>
			<DrawerTrigger className='p-1 rounded-sm dark:hover:bg-neutral-400  hover:bg-neutral-500'>
				<Ellipsis size={16} />
			</DrawerTrigger>
			<DrawerContent className='data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-3xl p-5'>
				<DrawerHeader>
					<DrawerTitle>
						<input
							type='text'
							value={name}
							className='w-full resize-none overflow-hidden border-none bg-transparent font-extrabold outline-none ring-0 placeholder:font-bold focus:outline-none focus:ring-0 text-4xl'
						/>
					</DrawerTitle>
					<DrawerDescription className='text-lg'>
						This action cannot be undone.
					</DrawerDescription>
				</DrawerHeader>
				<section className=''>
					<DataTable columns={columns} data={data} />
				</section>
				<DrawerFooter></DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
