"use client";

import { ChevronRight, Palette, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";
import {
	CALLOUT_TONES,
	type CalloutTone,
	getCalloutTone,
} from "@/entities/page-block/ui/read-only-block-content";
import { cn } from "@/shared/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import { InSectionProvider } from "@/widgets/page-block-editor/ui/column-scope";
import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { PageBlockEditorRow } from "@/widgets/page-block-editor/ui/page-block-editor-row";

import { getSectionForm } from "../lib/form-config";
import { FormDatabaseProvider } from "./form-field-block-editor";
import {
	AddQuestionButton,
	FillFormButton,
	SectionFormSettings,
	useFormDatabase,
} from "./section-form-controls";

interface SectionBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function getSectionText(
	block: Pick<PageBlockNode, "content">,
	key: "title" | "description",
): string {
	const content = block.content;
	const value =
		content && typeof content === "object" && !Array.isArray(content)
			? content[key]
			: undefined;
	return typeof value === "string" ? value : "";
}

export function SectionBlockEditor({
	block,
	shareToken,
}: SectionBlockEditorProps) {
	const [title, setTitle] = useState(() => getSectionText(block, "title"));
	const [description, setDescription] = useState(() =>
		getSectionText(block, "description"),
	);
	const [toneOpen, setToneOpen] = useState(false);
	const titleRef = useRef<HTMLInputElement>(null);
	const descriptionRef = useRef<HTMLInputElement>(null);
	const creatingChildRef = useRef(false);

	const updateBlock = useUpdatePageBlock(shareToken);
	const createBlock = useCreatePageBlock(shareToken);
	const { focusBlockId, requestFocus, clearFocus } = usePageBlockEditor();
	const tone = getCalloutTone(block.style_config);
	const form = getSectionForm(block.data_config);
	const formDatabase = useFormDatabase(form, shareToken);
	const hasQuestions = block.children.some(
		(child) => child.type === PageBlockType.FORM_FIELD,
	);

	useEffect(() => {
		setTitle(getSectionText(block, "title"));
		setDescription(getSectionText(block, "description"));
	}, [block]);

	useEffect(() => {
		if (focusBlockId !== block.id) return;
		titleRef.current?.focus();
		clearFocus();
	}, [focusBlockId, block.id, clearFocus]);

	const saveText = () => {
		if (
			title === getSectionText(block, "title") &&
			description === getSectionText(block, "description")
		) {
			return;
		}

		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			content: { ...block.content, title, description },
		});
	};

	const addChild = async () => {
		if (creatingChildRef.current) return;
		creatingChildRef.current = true;

		try {
			const created = await createBlock.mutateAsync({
				pageId: block.page_id,
				parentBlockId: block.id,
				type: PageBlockType.TEXT,
				content: { text: "" },
			});
			requestFocus(created.id);
		} finally {
			creatingChildRef.current = false;
		}
	};

	const enterBody = async () => {
		saveText();

		if (!block.is_open) {
			await updateBlock.mutateAsync({
				blockId: block.id,
				pageId: block.page_id,
				isOpen: true,
			});
		}

		const firstChild = block.children[0];
		if (firstChild) {
			requestFocus(firstChild.id);
			return;
		}

		await addChild();
	};

	const selectTone = (nextTone: CalloutTone) => {
		setToneOpen(false);
		updateBlock.mutate({
			blockId: block.id,
			pageId: block.page_id,
			styleConfig: { ...block.style_config, tone: nextTone },
		});
	};

	const isEnter = (event: React.KeyboardEvent<HTMLInputElement>) =>
		event.key === "Enter" && !event.nativeEvent.isComposing;

	return (
		<section
			aria-label={title || "Untitled section"}
			className={cn(
				"group/section w-full rounded-lg border border-border/60 py-2 pr-2 pl-1",
				CALLOUT_TONES[tone].className,
			)}
		>
			<div className='grid min-h-7 grid-cols-[28px_28px_minmax(0,1fr)_auto] items-center'>
				<span aria-hidden='true' />
				<button
					type='button'
					aria-label={block.is_open ? "Collapse section" : "Expand section"}
					aria-expanded={block.is_open}
					onClick={() =>
						updateBlock.mutate({
							blockId: block.id,
							pageId: block.page_id,
							isOpen: !block.is_open,
						})
					}
					className='flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground'
				>
					<ChevronRight
						className={cn(
							"size-4 transition-transform duration-200",
							block.is_open && "rotate-90",
						)}
					/>
				</button>

				<input
					ref={titleRef}
					value={title}
					placeholder='Untitled section'
					onChange={(event) => setTitle(event.target.value)}
					onBlur={saveText}
					onKeyDown={(event) => {
						if (!isEnter(event)) return;
						event.preventDefault();
						if (block.is_open) {
							descriptionRef.current?.focus();
							return;
						}
						void enterBody();
					}}
					className='min-h-7 min-w-0 border-0 bg-transparent p-0 pl-1 text-base font-semibold leading-7 outline-none placeholder:text-muted-foreground/50'
				/>

				<div className='flex items-center gap-1'>
					{!block.is_open && block.children.length > 0 && (
						<span className='shrink-0 text-xs text-muted-foreground'>
							{block.children.length}{" "}
							{block.children.length === 1 ? "block" : "blocks"}
						</span>
					)}

					<SectionFormSettings
						block={block}
						form={form}
						hasQuestions={hasQuestions}
						shareToken={shareToken}
					/>

					<Popover open={toneOpen} onOpenChange={setToneOpen}>
						<PopoverTrigger asChild>
							<button
								type='button'
								aria-label='Change section color'
								className='flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-foreground/10 hover:text-foreground focus-visible:opacity-100 group-hover/section:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100'
							>
								<Palette className='size-4' />
							</button>
						</PopoverTrigger>

						<PopoverContent side='bottom' align='end' className='w-44 p-1'>
							{(Object.keys(CALLOUT_TONES) as CalloutTone[]).map((key) => (
								<button
									key={key}
									type='button'
									aria-pressed={key === tone}
									onClick={() => selectTone(key)}
									className='flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted'
								>
									<span
										aria-hidden='true'
										className={cn(
											"size-5 rounded border border-border/60",
											CALLOUT_TONES[key].className,
										)}
									/>
									{CALLOUT_TONES[key].label}
								</button>
							))}
						</PopoverContent>
					</Popover>
				</div>
			</div>

			{block.is_open && (
				<>
					<input
						ref={descriptionRef}
						value={description}
						placeholder='Add a description'
						onChange={(event) => setDescription(event.target.value)}
						onBlur={saveText}
						onKeyDown={(event) => {
							if (!isEnter(event)) return;
							event.preventDefault();
							void enterBody();
						}}
						className='ml-15 block min-h-6 w-[calc(100%-3.75rem)] border-0 bg-transparent p-0 text-sm leading-6 text-muted-foreground outline-none placeholder:text-transparent focus:placeholder:text-muted-foreground/50 group-hover/section:placeholder:text-muted-foreground/50'
					/>

					<InSectionProvider value>
						<FormDatabaseProvider value={formDatabase ?? null}>
							{block.children.length > 0 ? (
								<div className='mt-1 space-y-1'>
									{block.children.map((child) => (
										<PageBlockEditorRow
											key={child.id}
											block={child}
											shareToken={shareToken}
										/>
									))}
								</div>
							) : (
								<button
									type='button'
									onClick={() => void addChild()}
									className='mt-1 ml-15 flex items-center gap-1.5 rounded-md px-1 text-left text-sm leading-7 text-muted-foreground/60 transition-colors hover:bg-foreground/5 hover:text-muted-foreground'
								>
									<Plus className='size-3.5' />
									Add a block
								</button>
							)}
							{form && formDatabase && (
								<div className='mt-1 ml-14 flex flex-wrap items-center gap-1'>
									<AddQuestionButton
										block={block}
										database={formDatabase}
										shareToken={shareToken}
									/>
									{hasQuestions && (
										<FillFormButton
											block={block}
											form={form}
											database={formDatabase}
											shareToken={shareToken}
											title={title}
										/>
									)}
								</div>
							)}
						</FormDatabaseProvider>
					</InSectionProvider>
				</>
			)}
		</section>
	);
}
