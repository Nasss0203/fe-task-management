"use client";

import {
	useDatabase,
	useDatabaseRows,
	useDatabaseView,
	useSharedDatabase,
	useSharedDatabaseRows,
	useSharedDatabaseView,
} from "@/entities/database/model/database.queries";

import {
	PropertyType,
	type DatabaseProperty,
} from "@/entities/database/model/database.types";

interface ReadOnlyDatabaseViewBlockProps {
	databaseId: string;
	viewId: string;
	shareToken?: string;
}

function formatCellValue(property: DatabaseProperty, value: unknown): string {
	if (value === null || value === undefined || value === "") {
		return "";
	}

	if (
		property.type === PropertyType.SELECT ||
		property.type === PropertyType.STATUS
	) {
		return (
			property.options.find((option) => option.id === value)?.name ?? ""
		);
	}

	if (property.type === PropertyType.MULTI_SELECT && Array.isArray(value)) {
		return value
			.map(
				(optionId) =>
					property.options.find((option) => option.id === optionId)
						?.name,
			)
			.filter(Boolean)
			.join(", ");
	}

	if (property.type === PropertyType.CHECKBOX) {
		return value === true ? "✓" : "";
	}

	if (typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			return "";
		}
	}

	return String(value);
}

export function ReadOnlyDatabaseViewBlock({
	databaseId,
	viewId,
	shareToken,
}: ReadOnlyDatabaseViewBlockProps) {
	const isShared = Boolean(shareToken);

	/*
	 * Normal Page
	 */
	const normalDatabaseQuery = useDatabase(databaseId, !isShared);

	const normalRowsQuery = useDatabaseRows(databaseId, !isShared);

	const normalViewQuery = useDatabaseView(databaseId, viewId, !isShared);

	/*
	 * Shared Page
	 *
	 * Các query này sẽ gửi:
	 * X-Page-Share-Token
	 */
	const sharedDatabaseQuery = useSharedDatabase(
		databaseId,
		shareToken,
		isShared,
	);

	const sharedRowsQuery = useSharedDatabaseRows(
		databaseId,
		shareToken,
		isShared,
	);

	const sharedViewQuery = useSharedDatabaseView(
		databaseId,
		viewId,
		shareToken,
		isShared,
	);

	/*
	 * Chọn query result phù hợp.
	 *
	 * Hook vẫn luôn được gọi đúng thứ tự,
	 * chỉ có query bị disable/enable.
	 */
	const databaseQuery = isShared ? sharedDatabaseQuery : normalDatabaseQuery;

	const rowsQuery = isShared ? sharedRowsQuery : normalRowsQuery;

	const viewQuery = isShared ? sharedViewQuery : normalViewQuery;

	const { data: database, isLoading: isDatabaseLoading } = databaseQuery;

	const { data: rows = [], isLoading: isRowsLoading } = rowsQuery;

	const { data: view, isLoading: isViewLoading } = viewQuery;

	if (isDatabaseLoading || isRowsLoading || isViewLoading) {
		return (
			<div className='text-sm text-muted-foreground'>
				Loading database...
			</div>
		);
	}

	if (!database || !view) {
		return (
			<div className='text-sm text-destructive'>Database not found</div>
		);
	}

	const viewPropertiesByPropertyId = new Map(
		view.properties.map((viewProperty) => [
			viewProperty.propertyId,
			viewProperty,
		]),
	);

	const visibleProperties = [...database.properties]
		.filter((property) => {
			if (!property.isHideable) {
				return true;
			}

			return (
				viewPropertiesByPropertyId.get(property.id)?.visible ?? false
			);
		})
		.sort((a, b) => {
			const aPosition =
				viewPropertiesByPropertyId.get(a.id)?.position ?? a.position;
			const bPosition =
				viewPropertiesByPropertyId.get(b.id)?.position ?? b.position;
			return Number(aPosition) - Number(bPosition);
		});

	return (
		<div className='w-full min-w-0 max-w-full'>
			<div className='mb-2 text-sm font-medium'>{view.name}</div>
			<div className='w-full min-w-0 max-w-full overflow-x-auto'>
				<table className='min-w-max border-collapse text-sm'>
					<thead>
						<tr className='border-b'>
							{visibleProperties.map((property) => (
								<th
									key={property.id}
									className='min-w-[160px] border-r px-3 py-2 text-left font-medium'
								>
									{property.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((row) => {
							const valueMap = new Map(
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
									{visibleProperties.map((property) => (
										<td
											key={property.id}
											className='h-10 min-w-[160px] border-r px-3 py-1 align-middle'
										>
											{formatCellValue(
												property,
												valueMap.get(property.id),
											)}
										</td>
									))}
								</tr>
							);
						})}

						{rows.length === 0 && (
							<tr>
								<td
									colSpan={Math.max(
										visibleProperties.length,
										1,
									)}
									className='h-20 text-center text-muted-foreground'
								>
									No rows
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
