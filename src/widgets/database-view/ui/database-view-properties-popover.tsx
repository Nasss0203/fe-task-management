"use client";

import {
	ChevronRight,
	Eye,
	EyeOff,
	LayoutGrid,
	Lock,
	Settings2,
	SlidersHorizontal,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	useRenameDatabaseView,
	useSetViewPropertyVisibility,
} from "@/entities/database/model/database.mutations";
import type {
	DatabaseProperty,
	DatabaseView,
	DatabaseViewProperty,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";

import {
	MenuItem,
	MenuPageHeader,
	MenuSectionLabel,
	MenuSeparator,
} from "./menu-item";
import { PropertySettings } from "./property-settings";
import { toolbarIconButtonClass } from "./toolbar-button";

interface DatabaseViewPropertiesPopoverProps {
	databaseId: string;
	view: DatabaseView;
	properties: DatabaseProperty[];
	viewProperties: DatabaseViewProperty[];
}

const LAYOUT_LABELS: Record<string, string> = {
	TABLE: "Table",
	BOARD: "Board",
	CALENDAR: "Calendar",
	LIST: "List",
};

type Page = "main" | "visibility" | "properties" | { propertyId: string };

/** Notion-style "View settings": rename, property visibility, edit properties. */
export function DatabaseViewPropertiesPopover({
	databaseId,
	view,
	properties,
	viewProperties,
}: DatabaseViewPropertiesPopoverProps) {
	const [open, setOpen] = useState(false);
	const [page, setPage] = useState<Page>("main");
	const [name, setName] = useState(view.name);
	const renameMutation = useRenameDatabaseView(databaseId);
	const visibilityMutation = useSetViewPropertyVisibility(databaseId, view.id);

	useEffect(() => {
		setName(view.name);
	}, [view.name]);

	const viewPropertyById = new Map(
		viewProperties.map((item) => [item.propertyId, item]),
	);
	const ordered = [...properties].sort(
		(a, b) =>
			Number(viewPropertyById.get(a.id)?.position ?? a.position) -
			Number(viewPropertyById.get(b.id)?.position ?? b.position),
	);
	// Non-hideable properties (Name) always show, whatever the stored flag says.
	const isShown = (property: DatabaseProperty) =>
		!property.isHideable || (viewPropertyById.get(property.id)?.visible ?? false);
	const shown = ordered.filter(isShown);
	const hidden = ordered.filter((property) => !isShown(property));

	const setVisible = (propertyId: string, visible: boolean) =>
		visibilityMutation.mutate(
			{ propertyId, visible },
			{ onError: () => toast.error("Couldn't update visibility") },
		);

	const saveName = () => {
		const next = name.trim();
		if (!next || next === view.name) {
			setName(view.name);
			return;
		}
		renameMutation.mutate(
			{ viewId: view.id, name: next },
			{
				onError: () => {
					setName(view.name);
					toast.error("Couldn't rename view");
				},
			},
		);
	};

	const visibilityRow = (property: DatabaseProperty, visible: boolean) => (
		<div
			key={property.id}
			className='flex h-[30px] items-center gap-[9px] rounded-md px-2 text-[13.5px] transition-colors hover:bg-accent'
		>
			<PropertyIcon type={property.type} className='size-[15px] shrink-0 text-muted-foreground' />
			<span className='min-w-0 flex-1 truncate'>{property.name}</span>
			{property.isHideable ? (
				<button
					type='button'
					aria-label={`${visible ? "Hide" : "Show"} ${property.name}`}
					title={visible ? "Hide in view" : "Show in view"}
					disabled={visibilityMutation.isPending}
					onClick={() => setVisible(property.id, !visible)}
					className='flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground disabled:opacity-50'
				>
					{visible ? <Eye className='size-3.5' /> : <EyeOff className='size-3.5' />}
				</button>
			) : (
				<span
					title='Always shown'
					className='flex size-6 items-center justify-center text-faint'
				>
					<Lock className='size-3.5' />
				</span>
			)}
		</div>
	);

	const content = (() => {
		if (page === "visibility") {
			return (
				<div>
					<MenuPageHeader
						title='Property visibility'
						onBack={() => setPage("main")}
					/>
					<MenuSectionLabel>Shown in view</MenuSectionLabel>
					{shown.map((property) => visibilityRow(property, true))}
					{hidden.length > 0 && (
						<>
							<MenuSectionLabel>Hidden in view</MenuSectionLabel>
							{hidden.map((property) => visibilityRow(property, false))}
						</>
					)}
				</div>
			);
		}

		if (page === "properties") {
			return (
				<div>
					<MenuPageHeader title='Edit properties' onBack={() => setPage("main")} />
					{ordered.map((property) => (
						<button
							key={property.id}
							type='button'
							onClick={() => setPage({ propertyId: property.id })}
							className='flex h-[30px] w-full items-center gap-[9px] rounded-md px-2 text-left text-[13.5px] transition-colors hover:bg-accent'
						>
							<PropertyIcon
								type={property.type}
								className='size-[15px] shrink-0 text-muted-foreground'
							/>
							<span className='min-w-0 flex-1 truncate'>{property.name}</span>
							<ChevronRight className='size-3.5 text-faint' />
						</button>
					))}
				</div>
			);
		}

		if (typeof page === "object") {
			const property = properties.find((item) => item.id === page.propertyId);
			if (!property) return null;
			return (
				<div>
					<MenuPageHeader title='Edit property' onBack={() => setPage("properties")} />
					<PropertySettings
						key={property.id}
						databaseId={databaseId}
						viewId={view.id}
						property={property}
						onDone={() => setPage("properties")}
					/>
				</div>
			);
		}

		return (
			<div>
				<div className='flex h-8 items-center px-2 text-[13px] font-semibold'>
					View settings
				</div>
				<div className='px-1 pb-1.5'>
					<input
						value={name}
						onChange={(event) => setName(event.target.value)}
						onBlur={saveName}
						onKeyDown={(event) => {
							if (event.key === "Enter") event.currentTarget.blur();
							if (event.key === "Escape") setName(view.name);
						}}
						maxLength={255}
						aria-label='View name'
						placeholder='View name'
						className='h-8 w-full rounded-md border border-input bg-transparent px-2.5 text-[13.5px] outline-none transition-colors placeholder:text-faint focus-visible:border-ring focus-visible:ring-[0.5px] focus-visible:ring-ring'
					/>
				</div>
				<div className='flex h-[30px] items-center gap-[9px] px-2 text-[13.5px]'>
					<LayoutGrid className='size-[15px] text-muted-foreground' />
					<span className='flex-1'>Layout</span>
					<span className='text-xs text-faint'>
						{LAYOUT_LABELS[view.type] ?? view.type}
					</span>
				</div>
				<MenuItem
					icon={Eye}
					hint={`${shown.length} shown`}
					submenu
					onClick={() => setPage("visibility")}
				>
					Property visibility
				</MenuItem>
				<MenuSeparator />
				<MenuItem
					icon={Settings2}
					hint={`${properties.length}`}
					submenu
					onClick={() => setPage("properties")}
				>
					Edit properties
				</MenuItem>
			</div>
		);
	})();

	return (
		<Popover
			open={open}
			onOpenChange={(next) => {
				setOpen(next);
				if (!next) setPage("main");
			}}
		>
			<PopoverTrigger asChild>
				<button
					type='button'
					aria-label='View settings'
					title='View settings'
					className={toolbarIconButtonClass()}
				>
					<SlidersHorizontal className='size-4' />
				</button>
			</PopoverTrigger>

			<PopoverContent align='end' className='w-72 p-[5px]'>
				{content}
			</PopoverContent>
		</Popover>
	);
}
