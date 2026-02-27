"use client";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";

import { useState } from "react";
import ColumnDnd from "./column-dnd";
import ItemsDnd from "./items-dnd";

const ProviderDragDrop = () => {
	// const [items, setItems] = useState({
	// 	A: ["A0", "A1", "A2"],
	// 	B: ["B0", "B1", "B2"],
	// 	C: [],
	// });

	const [items, setItems] = useState({
		todo: ["A0", "A1", "A2"],
		inProgress: ["B0", "B1", "B2"],
		done: [],
	});

	return (
		<DragDropProvider
			onDragOver={(event) => {
				setItems((items) => move(items, event));
			}}
		>
			<div className='inline-flex flex-row gap-3 w-full'>
				{Object.entries(items).map(([column, items]) => (
					<ColumnDnd key={column} id={column} isEmpty status={column}>
						{items.map((id, index) => (
							<ItemsDnd
								key={id}
								id={id}
								index={index}
								status={column}
							/>
						))}
					</ColumnDnd>
				))}
			</div>
		</DragDropProvider>
	);
};

export default ProviderDragDrop;
