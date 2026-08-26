"use client";

import { Plus } from "lucide-react";

import { useCreateDatabaseRow } from "@/entities/database/model/database.mutations";

import type {
	Database,
	DatabaseRow,
	DatabaseViewDetail,
} from "@/entities/database/model/database.types";

import { AddPropertyPopover } from "./add-property-popover";
import { DatabaseCell } from "./database-cell";
import { DatabasePropertyHeader } from "./database-property-header";

interface TableViewProps {
	database: Database;
	viewId: string;
	viewDetail: DatabaseViewDetail;
	rows: DatabaseRow[];
}

export function TableView({
	database,
	viewId,
	viewDetail,
	rows,
}: TableViewProps) {
	const createRowMutation = useCreateDatabaseRow(database.id);

	const viewPropertiesByPropertyId = new Map(
		viewDetail.properties.map((property) => [
			property.propertyId,
			property,
		]),
	);

	const missingProperties = database.properties.filter(
		(property) => !viewPropertiesByPropertyId.has(property.id),
	);

	if (missingProperties.length > 0) {
		return (
			<div className='p-4 text-sm text-destructive'>
				This view is missing property configuration.
			</div>
		);
	}

	const properties = database.properties
		.filter(
			(property) =>
				viewPropertiesByPropertyId.get(property.id)?.visible === true,
		)
		.sort((a, b) => {
			const aViewProperty = viewPropertiesByPropertyId.get(a.id)!;
			const bViewProperty = viewPropertiesByPropertyId.get(b.id)!;

			return (
				Number(aViewProperty.position) - Number(bViewProperty.position)
			);
		});

	return (
		<div className='w-full min-w-0 max-w-full'>
			{/* Chỉ table được scroll ngang */}
			<div className='w-full min-w-0 max-w-full overflow-x-auto'>
				<table className='min-w-max border-collapse text-sm'>
					<thead>
						<tr className='border-b'>
							{properties.map((property) => (
								<th
									key={property.id}
									className='min-w-[160px] border-r px-3 py-2 text-left font-medium'
								>
									<DatabasePropertyHeader
										databaseId={database.id}
										viewId={viewId}
										property={property}
									/>
								</th>
							))}

							<th className='w-10 min-w-10 px-1'>
								<AddPropertyPopover databaseId={database.id} />
							</th>
						</tr>
					</thead>

					<tbody>
						{rows.map((row) => {
							const valueMap = new Map<string, unknown>(
								row.values.map((item) => [
									item.propertyId,
									item.value,
								]),
							);

							return (
								<tr
									key={row.id}
									className='border-b last:border-b-0'
								>
									{properties.map((property) => {
										const value = valueMap.get(property.id);

										return (
											<td
												key={property.id}
												className='h-10 min-w-[160px] border-r px-2 py-1 align-middle'
											>
												<DatabaseCell
													databaseId={database.id}
													rowId={row.id}
													property={property}
													value={value}
												/>
											</td>
										);
									})}

									<td className='w-10 min-w-10' />
								</tr>
							);
						})}

						{rows.length === 0 && (
							<tr>
								<td
									colSpan={Math.max(properties.length + 1, 1)}
									className='h-20 text-center text-muted-foreground'
								>
									No rows
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			<button
				type='button'
				disabled={createRowMutation.isPending}
				onClick={() => createRowMutation.mutate()}
				className='flex h-9 w-full items-center gap-2 px-3 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground disabled:opacity-50'
			>
				<Plus className='size-4' />

				{createRowMutation.isPending ? "Adding..." : "New row"}
			</button>
		</div>
	);
}
