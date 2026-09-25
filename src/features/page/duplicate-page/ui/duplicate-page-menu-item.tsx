"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";

import { useDuplicatePage } from "@/entities/page/model/page.mutations";
import type { Page } from "@/entities/page/model/page.types";

import { DropdownMenuItem } from "@/shared/ui/dropdown-menu";

interface DuplicatePageMenuItemProps {
	page: Page;
	onDuplicated?: () => void;
}

export function DuplicatePageMenuItem({
	page,
	onDuplicated,
}: DuplicatePageMenuItemProps) {
	const router = useRouter();
	const duplicatePage = useDuplicatePage();

	const handleDuplicate = async () => {
		const duplicatedPage = await duplicatePage.mutateAsync({
			pageId: page.id,
			workspaceId: page.workspace_id,
		});

		onDuplicated?.();

		router.push(`/page/${duplicatedPage.id}`);
	};

	return (
		<DropdownMenuItem
			disabled={duplicatePage.isPending}
			onSelect={(event) => {
				event.preventDefault();

				if (duplicatePage.isPending) {
					return;
				}

				void handleDuplicate();
			}}
		>
			<Copy className='mr-2 size-4' />

			{duplicatePage.isPending ? "Duplicating..." : "Duplicate"}
		</DropdownMenuItem>
	);
}
