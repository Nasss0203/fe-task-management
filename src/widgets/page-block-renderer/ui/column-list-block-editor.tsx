"use client";

import { Plus } from "lucide-react";
import {
	Fragment,
	useRef,
	useState,
	type PointerEvent as ReactPointerEvent,
} from "react";

import type { PageBlockNode } from "@/entities/page-block/lib/build-page-block-tree";
import {
	useCreatePageBlock,
	useUpdatePageBlock,
} from "@/entities/page-block/model/page-block.mutations";
import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import { InColumnProvider } from "@/widgets/page-block-editor/ui/column-scope";
import { usePageBlockEditor } from "@/widgets/page-block-editor/ui/page-block-editor-context";
import { PageBlockEditorRow } from "@/widgets/page-block-editor/ui/page-block-editor-row";

import { columnRatio, resizeColumnPair } from "../lib/column-widths";

/** While dragging a divider: resize cursor everywhere, no text selection. */
function setResizing(on: boolean) {
	document.body.style.cursor = on ? "col-resize" : "";
	document.body.style.userSelect = on ? "none" : "";
}

interface ColumnListBlockEditorProps {
	block: PageBlockNode;
	shareToken?: string;
}

export function ColumnListBlockEditor({
	block,
	shareToken,
}: ColumnListBlockEditorProps) {
	const columns = block.children;
	const updateBlock = useUpdatePageBlock(shareToken);
	// Ratios being dragged, shown until the saved ones come back.
	const [draft, setDraft] = useState<Record<string, number>>({});
	const columnRefs = useRef(new Map<string, HTMLDivElement>());
	const ratio = (column: PageBlockNode) =>
		draft[column.id] ?? columnRatio(column, columns.length);
	const width = (column: PageBlockNode) =>
		columnRefs.current.get(column.id)?.getBoundingClientRect().width ?? 0;

	const savePair = (
		left: PageBlockNode,
		right: PageBlockNode,
		next: [number, number],
	) => {
		setDraft((current) => ({
			...current,
			[left.id]: next[0],
			[right.id]: next[1],
		}));
		const save = (column: PageBlockNode, value: number) =>
			updateBlock.mutateAsync({
				blockId: column.id,
				pageId: column.page_id,
				styleConfig: { ...column.style_config, width_ratio: value },
			});
		void Promise.allSettled([
			save(left, next[0]),
			save(right, next[1]),
		]).then(() =>
			setDraft((current) => {
				const rest = { ...current };
				delete rest[left.id];
				delete rest[right.id];
				return rest;
			}),
		);
	};

	const startResize = (
		event: ReactPointerEvent<HTMLDivElement>,
		left: PageBlockNode,
		right: PageBlockNode,
	) => {
		if (event.button !== 0) return;
		event.preventDefault();

		const startX = event.clientX;
		const start = {
			left: { ratio: ratio(left), width: width(left) },
			right: { ratio: ratio(right), width: width(right) },
		};
		let next: [number, number] = [start.left.ratio, start.right.ratio];

		setResizing(true);

		const move = (moveEvent: PointerEvent) => {
			next = resizeColumnPair(
				start.left,
				start.right,
				moveEvent.clientX - startX,
			);
			setDraft((current) => ({
				...current,
				[left.id]: next[0],
				[right.id]: next[1],
			}));
		};

		const up = () => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
			setResizing(false);

			if (next[0] !== start.left.ratio) savePair(left, right, next);
		};

		// On the window, so a fast drag past the thin divider keeps resizing.
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
	};

	return (
		<InColumnProvider value>
			{/* Phone: columns stack, like Notion. */}
			<div className='flex w-full flex-col md:flex-row '>
				{columns.map((column, index) => (
					<Fragment key={column.id}>
						{index > 0 && (
							<div
								role='separator'
								aria-orientation='vertical'
								aria-label='Resize columns'
								tabIndex={0}
								onPointerDown={(event) =>
									startResize(
										event,
										columns[index - 1],
										column,
									)
								}
								onKeyDown={(event) => {
									if (
										event.key !== "ArrowLeft" &&
										event.key !== "ArrowRight"
									)
										return;
									event.preventDefault();
									const left = columns[index - 1];
									savePair(
										left,
										column,
										resizeColumnPair(
											{
												ratio: ratio(left),
												width: width(left),
											},
											{
												ratio: ratio(column),
												width: width(column),
											},
											event.key === "ArrowLeft"
												? -32
												: 32,
										),
									);
								}}
								className='group/divider relative hidden w-2 shrink-0 cursor-col-resize touch-none outline-none md:block'
							>
								<div className='absolute inset-y-1 left-1/2 w-0.5 -translate-x-1/2 rounded-full bg-primary/50 opacity-0 transition-opacity group-hover/divider:opacity-100 group-focus-visible/divider:opacity-100 group-active/divider:opacity-100' />
							</div>
						)}
						<div
							ref={(element) => {
								if (element)
									columnRefs.current.set(column.id, element);
								else columnRefs.current.delete(column.id);
							}}
							className='min-w-0 space-y-1'
							style={{ flex: `${ratio(column)} 1 0%` }}
						>
							{column.children.map((child) => (
								<PageBlockEditorRow
									key={child.id}
									block={child}
									shareToken={shareToken}
								/>
							))}
							{column.children.length === 0 && (
								<EmptyColumn
									column={column}
									shareToken={shareToken}
								/>
							)}
						</div>
					</Fragment>
				))}
			</div>
		</InColumnProvider>
	);
}

/** A column whose last block moved away before the server tidied it: click to write. */
function EmptyColumn({
	column,
	shareToken,
}: {
	column: PageBlockNode;
	shareToken?: string;
}) {
	const createBlock = useCreatePageBlock(shareToken);
	const { requestFocus } = usePageBlockEditor();

	return (
		<button
			type='button'
			disabled={createBlock.isPending}
			onClick={async () => {
				const created = await createBlock.mutateAsync({
					pageId: column.page_id,
					parentBlockId: column.id,
					type: PageBlockType.TEXT,
					content: { text: "" },
				});
				requestFocus(created.id);
			}}
			className='ml-14 flex min-h-7 items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground/60 opacity-0 transition-opacity hover:bg-muted/60 hover:opacity-100 focus-visible:opacity-100'
		>
			<Plus className='size-3.5' />
			Add a block
		</button>
	);
}
