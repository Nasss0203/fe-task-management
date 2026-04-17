"use client";

import { useSortable } from "@dnd-kit/react/sortable";
import { ItemView } from "./item-view";

type ItemsDndProps = {
	id: string;
	column: string;
	index: number;
	status: string;
	name: string;
	onUpdateName?: (id: string, newName: string) => void;
};

const ItemsDnd = ({
	id,
	column,
	index,
	status,
	name,
	onUpdateName,
}: ItemsDndProps) => {
	const { ref } = useSortable({
		id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
	});

	return (
		<div ref={ref}>
			<ItemView
				id={id}
				status={status}
				name={name}
				onUpdateName={onUpdateName}
			/>
		</div>
	);
};

export default ItemsDnd;
