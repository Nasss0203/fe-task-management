"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover } from "@/components/ui/popover";
import { Users } from "lucide-react";
import { PopoverContentV2, PopoverTriggerV2 } from "../popover/popover-custom";

export function WorkspaceSharePopover() {
	return (
		<Popover>
			<PopoverTriggerV2 asChild>
				<Button variant='outline'>
					<Users className='mr-2 h-4 w-4' />
					Chia sẻ
				</Button>
			</PopoverTriggerV2>

			<PopoverContentV2 className='w-90' side='bottom' align='end'>
				<div className='space-y-4'>
					<div>
						<h4 className='font-medium'>Chia sẻ workspace</h4>
						<p className='mt-1 text-sm text-muted-foreground'>
							Mời thành viên bằng email vào workspace.
						</p>
					</div>

					<div className='space-y-2'>
						<Input placeholder='Email hoặc nhiều email, phân cách bằng dấu phẩy' />
						<Button className='w-full'>Gửi lời mời</Button>
					</div>
				</div>
			</PopoverContentV2>
		</Popover>
	);
}
