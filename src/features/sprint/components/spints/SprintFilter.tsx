"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type SprintFilterProps = {
	value: string;
	onChange: (value: string) => void;
};

const mockSprints = [
	{
		id: "all",
		name: "All sprints",
	},
	{
		id: "active",
		name: "Active sprint",
	},
	{
		id: "sprint-1",
		name: "Sprint 1",
	},
	{
		id: "sprint-2",
		name: "Sprint 2",
	},
];

const SprintFilter = ({ value, onChange }: SprintFilterProps) => {
	return (
		<Select value={value} onValueChange={onChange}>
			<SelectTrigger className='h-10 w-45'>
				<SelectValue placeholder='Select sprint' />
			</SelectTrigger>

			<SelectContent>
				{mockSprints.map((sprint) => (
					<SelectItem key={sprint.id} value={sprint.id}>
						{sprint.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default SprintFilter;
