"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

import { useUpdatePage } from "@/entities/page/model/page.mutations";

interface EditablePageTitleProps {
	pageId: string;
	workspaceId: string;
	title: string;
}

export function EditablePageTitle({
	pageId,
	workspaceId,
	title,
}: EditablePageTitleProps) {
	const [value, setValue] = useState(title);
	const cancelledRef = useRef(false);
	const updatePage = useUpdatePage();

	const save = () => {
		if (cancelledRef.current) {
			cancelledRef.current = false;
			return;
		}

		const nextTitle = value.trim();

		if (!nextTitle || nextTitle === title) {
			setValue(title);
			return;
		}

		setValue(nextTitle);
		updatePage.mutate(
			{ pageId, workspaceId, input: { title: nextTitle } },
			{
				onError: () => {
					setValue(title);
					toast.error("Unable to rename this page.");
				},
			},
		);
	};

	return (
		<textarea
			value={value}
			rows={1}
			placeholder='Untitled'
			aria-label='Page title'
			onChange={(event) => setValue(event.target.value)}
			onBlur={save}
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					cancelledRef.current = true;
					setValue(title);
					event.currentTarget.blur();
				}

				if (event.key === "Enter" && !event.nativeEvent.isComposing) {
					event.preventDefault();
					event.currentTarget.blur();
				}
			}}
			className='block w-full resize-none rounded-md border-0 bg-transparent p-0 text-4xl font-bold outline-none field-sizing-content placeholder:text-muted-foreground/50'
		/>
	);
}
