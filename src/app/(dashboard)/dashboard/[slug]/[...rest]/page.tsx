import CalendarApp from "@/components/calendar/calendar";
import { ProviderDragDrop } from "@/components/dnd";
import { TabsListCustom, TabsTriggerCustom } from "@/components/tabs";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
	Calendar,
	CircleArrowRight,
	Plus,
	type LucideIcon,
} from "lucide-react";

const tabTrigger: {
	icon: LucideIcon;
	type: string;
	value: string;
}[] = [
	{
		icon: CircleArrowRight,
		type: "Theo trạng thái",
		value: "dnd",
	},
	{
		icon: Calendar,
		type: "Theo lịch",
		value: "calendar",
	},
];

const RestPage = () => {
	return (
		<div className='flex flex-col gap-2'>
			<div>
				<div className=''>
					<input
						type='text'
						name=''
						id=''
						defaultValue={"Workspace"}
						placeholder='Workspace'
						className='text-2xl font-bold outline-none'
					/>
				</div>
			</div>
			<Tabs defaultValue='dnd'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-1'>
						<TabsListCustom variant='none'>
							{tabTrigger.map((item, index) => {
								return (
									<TabsTriggerCustom
										value={item.value}
										key={index}
									>
										<div className='flex items-center gap-1 '>
											<item.icon />
											<div className='text-sm font-medium'>
												{item.type}
											</div>
										</div>
									</TabsTriggerCustom>
								);
							})}
						</TabsListCustom>
						<button className='flex justify-center items-center rounded-full bg-neutral-300 w-6 h-6'>
							<Plus className='size-4'></Plus>
						</button>
					</div>
					<div></div>
				</div>
				<TabsContent value='dnd'>
					<ProviderDragDrop></ProviderDragDrop>
				</TabsContent>
				<TabsContent value='calendar'>
					<CalendarApp></CalendarApp>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default RestPage;
