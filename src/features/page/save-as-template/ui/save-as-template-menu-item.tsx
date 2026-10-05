"use client";

import React, { useState } from "react";
import { LayoutTemplate } from "lucide-react";

import type { Page } from "@/entities/page/model/page.types";
import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";
import { SaveAsTemplateDialog } from "./save-as-template-dialog";

export interface SaveAsTemplateMenuItemProps {
	page: Page;
	onSaved?: () => void;
}

export function SaveAsTemplateMenuItem({
	page,
	onSaved,
}: SaveAsTemplateMenuItemProps) {
	const [dialogOpen, setDialogOpen] = useState(false);

	return (
		<>
			<DropdownMenuItem
				onSelect={(event) => {
					event.preventDefault();
					setDialogOpen(true);
				}}
			>
				<LayoutTemplate className='mr-2 size-4' />
				Save as template
			</DropdownMenuItem>

			<SaveAsTemplateDialog
				page={page}
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				onSaved={() => {
					onSaved?.();
				}}
			/>
		</>
	);
}
