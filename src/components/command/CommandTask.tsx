import { Plus } from "lucide-react";
import { useState } from "react";
import {
	CommandDialogV2,
	CommandEmptyV2,
	CommandGroupV2,
	CommandInputV2,
	CommandItemV2,
	CommandListV2,
	CommandV2,
} from "./command-custom";

const CommandTask = () => {
	const [open, setOpen] = useState(false);
	return (
		<div className='flex flex-col gap-4'>
			<div>
				<Plus
					onClick={() => setOpen(true)}
					size={16}
					className='hover:bg-neutral-700 rounded-xs'
				/>
			</div>
			<CommandDialogV2 open={open} onOpenChange={setOpen}>
				<CommandV2>
					<CommandInputV2 placeholder='Type a command or search...' />
					<CommandListV2>
						<CommandEmptyV2>No results found.</CommandEmptyV2>
						<CommandGroupV2 heading='Suggestions'>
							<CommandItemV2>Calendar</CommandItemV2>
							<CommandItemV2>Search Emoji</CommandItemV2>
							<CommandItemV2>Calculator</CommandItemV2>
						</CommandGroupV2>
					</CommandListV2>
				</CommandV2>
			</CommandDialogV2>
		</div>
	);
};

export default CommandTask;
