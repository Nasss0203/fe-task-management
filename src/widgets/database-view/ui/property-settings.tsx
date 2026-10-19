"use client";

import { EyeOff, ListChecks, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
	useDeleteDatabaseProperty,
	useRenameDatabaseProperty,
	useSetViewPropertyVisibility,
} from "@/entities/database/model/database.mutations";
import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";
import { PropertyIcon } from "@/entities/database/ui/database-visuals";

import { MenuItem, MenuPageHeader, MenuSeparator } from "./menu-item";
import { PropertyOptionsEditor } from "./property-options-editor";

interface PropertySettingsProps {
	databaseId: string;
	viewId: string;
	property: DatabaseProperty;
	/** Called after the property was hidden or deleted. */
	onDone?: () => void;
}

const OPTION_TYPES = new Set<PropertyType>([
	PropertyType.SELECT,
	PropertyType.MULTI_SELECT,
	PropertyType.STATUS,
]);

/** Rename / edit options / hide / delete one property (Notion's property menu). */
export function PropertySettings({
	databaseId,
	viewId,
	property,
	onDone,
}: PropertySettingsProps) {
	const [page, setPage] = useState<"main" | "options">("main");
	const [name, setName] = useState(property.name);
	const renameMutation = useRenameDatabaseProperty(databaseId);
	const deleteMutation = useDeleteDatabaseProperty(databaseId);
	const visibilityMutation = useSetViewPropertyVisibility(databaseId, viewId);

	useEffect(() => {
		setName(property.name);
	}, [property.name]);

	if (page === "options") {
		return (
			<div>
				<MenuPageHeader title='Edit property' onBack={() => setPage("main")} />
				<PropertyOptionsEditor databaseId={databaseId} property={property} />
			</div>
		);
	}

	const saveName = () => {
		const next = name.trim();
		if (!next || next === property.name) {
			setName(property.name);
			return;
		}
		renameMutation.mutate(
			{ propertyId: property.id, name: next },
			{
				onError: () => {
					setName(property.name);
					toast.error("Couldn't rename property");
				},
			},
		);
	};

	return (
		<div>
			<div className='flex items-center gap-2 p-1'>
				<span className='flex size-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground'>
					<PropertyIcon type={property.type} />
				</span>
				<input
					value={name}
					onChange={(event) => setName(event.target.value)}
					onBlur={saveName}
					onKeyDown={(event) => {
						if (event.key === "Enter") event.currentTarget.blur();
						if (event.key === "Escape") setName(property.name);
					}}
					aria-label='Property name'
					autoFocus
					className='h-8 min-w-0 flex-1 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40'
				/>
			</div>

			{OPTION_TYPES.has(property.type) && (
				<MenuItem
					icon={ListChecks}
					hint={`${property.options.length} options`}
					submenu
					onClick={() => setPage("options")}
				>
					Edit property
				</MenuItem>
			)}

			{(property.isHideable || !property.isDefault) && <MenuSeparator />}

			{property.isHideable && (
				<MenuItem
					icon={EyeOff}
					disabled={visibilityMutation.isPending}
					onClick={() =>
						visibilityMutation.mutate(
							{ propertyId: property.id, visible: false },
							{
								onSuccess: onDone,
								onError: () => toast.error("Couldn't hide property"),
							},
						)
					}
				>
					Hide in view
				</MenuItem>
			)}

			{!property.isDefault && (
				<MenuItem
					icon={Trash2}
					destructive
					disabled={deleteMutation.isPending}
					onClick={() =>
						deleteMutation.mutate(property.id, {
							onSuccess: onDone,
							onError: () => toast.error("Couldn't delete property"),
						})
					}
				>
					Delete property
				</MenuItem>
			)}
		</div>
	);
}
