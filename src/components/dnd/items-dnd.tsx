"use client";
import { useSortable } from "@dnd-kit/react/sortable";
import { ItemView } from "./item-view";

const ItemsDnd = ({ id, column, index, status, name }: any) => {
	const { ref } = useSortable({
		id,
		index,
		group: column,
		type: "item",
		accept: ["item"],
	});

	return (
		<div ref={ref}>
			<ItemView id={id} status={status} name={name} />
		</div>
	);
};

export default ItemsDnd;
