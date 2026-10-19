"use client";

import {
	BookmarkIcon,
	AppWindow,
	CheckSquare,
	ChevronRight,
	Code2,
	FileIcon,
	GitFork,
	Lightbulb,
	List,
	ListTree,
	ListOrdered,
	Heading1,
	Heading2,
	Heading3,
	ImageIcon,
	Minus,
	Quote,
	Table2,
	Text,
	VideoIcon,
} from "lucide-react";

import { PageBlockType } from "@/entities/page-block/model/page-block.types";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "@/shared/ui/command";

export interface PageBlockCommand {
	type: PageBlockType;

	styleConfig?: Record<string, unknown>;
}

interface PageBlockCommandMenuProps {
	onSelect: (command: PageBlockCommand) => void;
	allowDatabase?: boolean;

	onClose?: () => void;
}

export interface CommandItemData {
	id: string;

	label: string;

	description?: string;

	type: PageBlockType;

	styleConfig?: Record<string, unknown>;

	icon: React.ComponentType<{
		className?: string;
	}>;

	shortcut?: string;
}

const BASIC_BLOCKS: CommandItemData[] = [
	{
		id: "text",

		label: "Text",

		description: "Start writing with plain text.",

		type: PageBlockType.TEXT,

		icon: Text,
	},

	{
		id: "heading-1",

		label: "Heading 1",

		description: "Big section heading.",

		type: PageBlockType.HEADER,

		icon: Heading1,

		styleConfig: {
			level: 1,
		},

		shortcut: "#",
	},

	{
		id: "heading-2",

		label: "Heading 2",

		description: "Medium section heading.",

		type: PageBlockType.HEADER,

		icon: Heading2,

		styleConfig: {
			level: 2,
		},

		shortcut: "##",
	},

	{
		id: "heading-3",

		label: "Heading 3",

		description: "Small section heading.",

		type: PageBlockType.HEADER,

		icon: Heading3,

		styleConfig: {
			level: 3,
		},

		shortcut: "###",
	},

	{
		id: "todo",

		label: "To-do",

		description: "Track tasks with a checkbox.",

		type: PageBlockType.TODO,

		icon: CheckSquare,
	},

	{
		id: "bulleted-list",

		label: "Bulleted list",

		description: "Create a simple bulleted list.",

		type: PageBlockType.BULLETED_LIST,

		icon: List,

		shortcut: "-",
	},

	{
		id: "numbered-list",

		label: "Numbered list",

		description: "Create a list with numbering.",

		type: PageBlockType.NUMBERED_LIST,

		icon: ListOrdered,

		shortcut: "1.",
	},

	{
		id: "toggle",

		label: "Toggle",

		description: "Hide content inside a toggle.",

		type: PageBlockType.TOGGLE,

		icon: ChevronRight,
	},

	{
		id: "quote",

		label: "Quote",

		description: "Capture a quote.",

		type: PageBlockType.QUOTE,

		icon: Quote,
	},

	{
		id: "callout",

		label: "Callout",

		description: "Make writing stand out.",

		type: PageBlockType.CALLOUT,

		icon: Lightbulb,
	},

	{
		id: "table-of-contents",

		label: "Table of contents",

		description: "Show an outline of the headings on this page.",

		type: PageBlockType.TABLE_OF_CONTENTS,

		icon: ListTree,
	},

	{
		id: "divider",

		label: "Divider",

		description: "Visually divide content.",

		type: PageBlockType.DIVIDER,

		icon: Minus,
	},

	{
		id: "simple-table",

		label: "Simple table",

		description: "Create a simple table.",

		type: PageBlockType.TABLE_SIMPLE,

		icon: Table2,
	},
];

const ADVANCED_BLOCKS: CommandItemData[] = [
	{
		id: "code",

		label: "Code",

		description: "Write code with syntax highlighting.",

		type: PageBlockType.CODE,

		icon: Code2,
	},

	{
		id: "mermaid",

		label: "Mermaid diagram",

		description: "Draw flowcharts and diagrams from text.",

		type: PageBlockType.MERMAID,

		icon: GitFork,
	},
];

export const TURN_INTO_BLOCKS = [...BASIC_BLOCKS, ...ADVANCED_BLOCKS].filter(
	(command) => command.type !== PageBlockType.TABLE_SIMPLE,
);

const DATABASE_BLOCKS: CommandItemData[] = [
	{
		id: "database-table",

		label: "Table view",

		description: "Create a database table.",

		type: PageBlockType.DATABASE_VIEW,

		icon: Table2,
	},
];
const MEDIA_BLOCKS: CommandItemData[] = [
	{
		id: "image",
		label: "Image",
		description: "Upload or embed an image.",
		type: PageBlockType.IMAGE,
		icon: ImageIcon,
	},
	{
		id: "file",
		label: "FIle",
		description: "Upload a file.",
		type: PageBlockType.FILE,
		icon: FileIcon,
	},
	{
		id: "video",
		label: "Video",
		description: "Embed a video.",
		type: PageBlockType.VIDEO,
		icon: VideoIcon,
	},
	{
		id: "bookmark",
		label: "Bookmark",
		description: "Save a web link as a bookmark.",
		type: PageBlockType.BOOKMARK,
		icon: BookmarkIcon,
	},
	{
		id: "embed",
		label: "Embed",
		description: "Figma, Google Maps, GitHub Gist or a tweet.",
		type: PageBlockType.EMBED,
		icon: AppWindow,
	},
];

function BlockCommandItem({
	command,
	onSelect,
}: {
	command: CommandItemData;

	onSelect: (command: PageBlockCommand) => void;
}) {
	const Icon = command.icon;

	return (
		<CommandItem
			value={`${command.label} ${command.description ?? ""}`}
			onSelect={() =>
				onSelect({
					type: command.type,

					styleConfig: command.styleConfig,
				})
			}
			className='
                min-h-[44px]
                cursor-pointer
                gap-2.5
                rounded-md
                px-2
                py-1.5
            '
		>
			<div
				className='
                    flex
                    size-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-border/70
                    text-muted-foreground
                '
			>
				<Icon className='size-4' />
			</div>

			<div className='min-w-0 flex-1'>
				<div className='text-sm font-medium leading-5'>
					{command.label}
				</div>

				{command.description && (
					<div className='truncate text-xs leading-4 text-muted-foreground'>
						{command.description}
					</div>
				)}
			</div>

			{command.shortcut && (
				<CommandShortcut className='text-[11px]'>
					{command.shortcut}
				</CommandShortcut>
			)}
		</CommandItem>
	);
}

export function PageBlockCommandMenu({
	onSelect,
	onClose,
	allowDatabase = true,
}: PageBlockCommandMenuProps) {
	return (
		<Command
			className='
                w-[280px]
                max-h-[var(--radix-popover-content-available-height)]
                rounded-xl
                border
                bg-popover
                shadow-xl
            '
			onKeyDown={(event) => {
				if (event.key === "Escape") {
					event.preventDefault();

					onClose?.();
				}
			}}
		>
			<CommandInput
				placeholder='Type to filter...'
				autoFocus
				className='h-9 text-sm'
			/>

			<CommandList className='max-h-[340px] min-h-0'>
				<CommandEmpty className='py-6 text-sm text-muted-foreground'>
					No results found.
				</CommandEmpty>

				<CommandGroup
					heading='Basic blocks'
					className='
                        [&_[cmdk-group-heading]]:px-2
                        [&_[cmdk-group-heading]]:py-1.5
                        [&_[cmdk-group-heading]]:text-[11px]
                        [&_[cmdk-group-heading]]:font-medium
                        [&_[cmdk-group-heading]]:text-muted-foreground
                    '
				>
					{BASIC_BLOCKS.map((command) => (
						<BlockCommandItem
							key={command.id}
							command={command}
							onSelect={onSelect}
						/>
					))}
				</CommandGroup>

				<CommandSeparator />

				<CommandGroup
					heading='Advanced'
					className='
                        [&_[cmdk-group-heading]]:px-2
                        [&_[cmdk-group-heading]]:py-1.5
                        [&_[cmdk-group-heading]]:text-[11px]
                        [&_[cmdk-group-heading]]:font-medium
                        [&_[cmdk-group-heading]]:text-muted-foreground
                    '
				>
					{ADVANCED_BLOCKS.map((command) => (
						<BlockCommandItem
							key={command.id}
							command={command}
							onSelect={onSelect}
						/>
					))}
				</CommandGroup>

				<CommandSeparator />

				{allowDatabase && (
					<>
						<CommandGroup
							heading='Database'
							className='
                        [&_[cmdk-group-heading]]:px-2
                        [&_[cmdk-group-heading]]:py-1.5
                        [&_[cmdk-group-heading]]:text-[11px]
                        [&_[cmdk-group-heading]]:font-medium
                        [&_[cmdk-group-heading]]:text-muted-foreground
                    '
						>
							{DATABASE_BLOCKS.map((command) => (
								<BlockCommandItem
									key={command.id}
									command={command}
									onSelect={onSelect}
								/>
							))}
						</CommandGroup>
						<CommandSeparator />
					</>
				)}

				<CommandGroup
					heading='Media'
					className='[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'
				>
					{MEDIA_BLOCKS.map((command) => (
						<BlockCommandItem
							key={command.id}
							command={command}
							onSelect={onSelect}
						/>
					))}
				</CommandGroup>
			</CommandList>

			<div className='flex h-9 items-center justify-between border-t px-3'>
				<button
					type='button'
					onClick={onClose}
					className='text-sm font-medium text-foreground'
				>
					Close menu
				</button>

				<span className='text-[11px] text-muted-foreground'>esc</span>
			</div>
		</Command>
	);
}
