"use client";

import { ClipboardList, Eye, ListPlus } from "lucide-react";
import { useState } from "react";

import { useDatabase } from "@/entities/database/model/database.queries";
import type { Database } from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import { getDatabaseViewConfig } from "@/entities/page-block/lib/get-database-view-config";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import {
	usePageBlocks,
	useSharedPageBlocks,
} from "@/entities/page-block/model/page-block.queries";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import { Button } from "@/shared/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { ReadOnlyPageBlockRenderer } from "@/widgets/page-block/ui/read-only-page-block-renderer";

import {
	FORM_PROPERTY_TYPES,
	getFormField,
	type SectionForm,
} from "../lib/form-config";
import { FormFill } from "./form-fill";

export { useFormDatabase } from "./form-fill";

const HOVER_BUTTON =
	"flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 group-hover/section:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100";

function PageDatabaseOption({
	databaseId,
	selected,
	onPick,
}: {
	databaseId: string;
	selected: boolean;
	onPick: () => void;
}) {
	const { data } = useDatabase(databaseId);

	return (
		<button
			type='button'
			aria-pressed={selected}
			onClick={onPick}
			className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted aria-pressed:bg-muted'
		>
			<ClipboardList className='size-4 text-muted-foreground' />
			<span className='truncate'>{data?.name ?? "Database"}</span>
		</button>
	);
}

export function SectionFormSettings({
	block,
	form,
	hasQuestions,
	shareToken,
}: {
	block: PageBlockNode;
	form: SectionForm | null;
	hasQuestions: boolean;
	shareToken?: string;
}) {
	const [open, setOpen] = useState(false);
	const updateBlock = useUpdatePageBlock(shareToken);
	const ownBlocks = usePageBlocks(block.page_id, !shareToken);
	const sharedBlocks = useSharedPageBlocks(
		block.page_id,
		shareToken,
		Boolean(shareToken),
	);
	const pageBlocks = (shareToken ? sharedBlocks : ownBlocks).data ?? [];
	const databaseIds = [
		...new Set(
			pageBlocks.flatMap((item) => {
				const config = getDatabaseViewConfig(item);
				return config && !item.deleted_at ? [config.database_id] : [];
			}),
		),
	];

	const saveForm = (next: SectionForm | null) =>
		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			dataConfig: { ...block.data_config, form: next },
		});

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='Form settings'
					className={HOVER_BUTTON}
				>
					<ClipboardList className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent side='bottom' align='end' className='w-72 space-y-3 p-3'>
				<div>
					<p className='text-sm font-medium'>Form</p>
					<p className='text-xs text-muted-foreground'>
						Answers become rows of a database on this page.
					</p>
				</div>

				{databaseIds.length === 0 ? (
					<p className='text-sm text-muted-foreground'>
						Add a database to this page first.
					</p>
				) : (
					<div className='space-y-0.5'>
						{databaseIds.map((databaseId) => (
							<PageDatabaseOption
								key={databaseId}
								databaseId={databaseId}
								selected={form?.database_id === databaseId}
								onPick={() => saveForm({ ...form, database_id: databaseId })}
							/>
						))}
					</div>
				)}

				{form && (
					<>
						<label className='block space-y-1 text-xs text-muted-foreground'>
							Button text
							<Input
								defaultValue={form.submit_label ?? ""}
								placeholder='Submit'
								onBlur={(event) =>
									saveForm({ ...form, submit_label: event.target.value })
								}
							/>
						</label>
						<label className='block space-y-1 text-xs text-muted-foreground'>
							Message after sending
							<Input
								defaultValue={form.success_message ?? ""}
								placeholder='Thanks, your answer was sent.'
								onBlur={(event) =>
									saveForm({ ...form, success_message: event.target.value })
								}
							/>
						</label>
						<Button
							type='button'
							variant='ghost'
							size='sm'
							disabled={hasQuestions}
							title={hasQuestions ? "Remove the questions first" : undefined}
							onClick={() => saveForm(null)}
						>
							Turn off form
						</Button>
					</>
				)}
			</PopoverContent>
		</Popover>
	);
}

export function AddQuestionButton({
	block,
	database,
	shareToken,
}: {
	block: PageBlockNode;
	database: Database;
	shareToken?: string;
}) {
	const [open, setOpen] = useState(false);
	const createBlock = useCreatePageBlock(shareToken);
	const used = new Set(
		block.children.flatMap((child) => {
			const field = getFormField(child.data_config);
			return child.type === PageBlockType.FORM_FIELD && field
				? [field.property_id]
				: [];
		}),
	);
	const available = [...database.properties]
		.filter((item) => FORM_PROPERTY_TYPES.has(item.type) && !used.has(item.id))
		.sort((a, b) => Number(a.position) - Number(b.position));

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					className='text-muted-foreground'
				>
					<ListPlus className='size-4' />
					Add question
				</Button>
			</PopoverTrigger>
			<PopoverContent side='bottom' align='start' className='w-60 p-1'>
				{available.length === 0 ? (
					<p className='px-2 py-1.5 text-sm text-muted-foreground'>
						Every field of {database.name} is already a question.
					</p>
				) : (
					available.map((property) => (
						<button
							key={property.id}
							type='button'
							onClick={() => {
								setOpen(false);
								createBlock.mutate({
									pageId: block.page_id,
									parentBlockId: block.id,
									afterBlockId: block.children.at(-1)?.id ?? null,
									type: PageBlockType.FORM_FIELD,
									content: { label: property.name },
									dataConfig: { property_id: property.id, required: false },
								});
							}}
							className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
						>
							<PropertyIcon type={property.type} className='size-4' />
							<span className='truncate'>{property.name}</span>
						</button>
					))
				)}
			</PopoverContent>
		</Popover>
	);
}

export function FillFormButton({
	block,
	form,
	database,
	shareToken,
	title,
}: {
	block: PageBlockNode;
	form: SectionForm;
	database: Database;
	shareToken?: string;
	title: string;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				type='button'
				variant='ghost'
				size='sm'
				className='text-muted-foreground'
				onClick={() => setOpen(true)}
			>
				<Eye className='size-4' />
				Fill out
			</Button>
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className='max-h-[85vh] overflow-y-auto sm:max-w-lg'>
					<DialogHeader>
						<DialogTitle>{title || "Untitled form"}</DialogTitle>
						<DialogDescription>
							Answers are saved as a new row in {database.name}.
						</DialogDescription>
					</DialogHeader>
					<FormFill
						section={block}
						form={form}
						database={database}
						shareToken={shareToken}
						renderBlock={(child) => (
							<ReadOnlyPageBlockRenderer
								block={
									child as Parameters<
										typeof ReadOnlyPageBlockRenderer
									>[0]["block"]
								}
								shareToken={shareToken}
							/>
						)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}
