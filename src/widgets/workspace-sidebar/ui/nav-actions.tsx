"use client";

import { SquareArrowOutUpRight } from "lucide-react";
import * as React from "react";

import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "@/shared/ui/popover";

export function NavActions() {
	const [isOpen, setIsOpen] = React.useState(false);

	React.useEffect(() => {
		setIsOpen(true);
	}, []);

	return (
		<div className='flex items-center gap-2 text-sm'>
			<Popover>
				<PopoverTrigger asChild>
					<button className='flex items-center gap-1 text-xs px-2 py-1.5 hover:bg-neutral-900 rounded-md cursor-pointer'>
						<SquareArrowOutUpRight size={12} />
						Share
					</button>
				</PopoverTrigger>
				<PopoverContent align='end' side='bottom'>
					<PopoverHeader>
						<PopoverTitle>Dimensions</PopoverTitle>
						<PopoverDescription>
							Set the dimensions for the layer.
						</PopoverDescription>
					</PopoverHeader>
				</PopoverContent>
			</Popover>
		</div>
	);
}
