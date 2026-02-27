"use client";
import { useSortable } from "@dnd-kit/react/sortable";
import { ItemView } from "./item-view";

const ItemsDnd = ({ id, column, index, status }: any) => {
	const { ref } = useSortable({
		id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
	});

	return (
		<div ref={ref}>
			<ItemView id={id} status={status} />
		</div>
	);
};

export default ItemsDnd;
