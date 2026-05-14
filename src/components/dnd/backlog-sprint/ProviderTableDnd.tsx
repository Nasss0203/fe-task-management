"use client";

import { DragDropProvider } from "@dnd-kit/react";
import { PropsWithChildren, useRef } from "react";

type TaskMovePayload = {
	taskId: string;
	fromContainerId: string;
	toContainerId: string;
};

type ProviderTableDndProps = PropsWithChildren<{
	onTaskMove: (payload: TaskMovePayload) => void;
}>;

type DndData = {
	taskId?: string;
	containerId?: string;
};

const getDndData = (item: unknown): DndData => {
	return ((item as any)?.data ?? {}) as DndData;
};

const getContainerIdFromTarget = (target: any): string | undefined => {
	const targetData = getDndData(target);

	if (targetData.containerId) {
		return targetData.containerId;
	}

	const targetId = String(target?.id ?? "");

	if (targetId === "backlog") return "backlog";
	if (targetId.startsWith("sprint:")) return targetId;

	return undefined;
};

export function ProviderTableDnd({
	children,
	onTaskMove,
}: ProviderTableDndProps) {
	const dragStartDataRef = useRef<DndData | null>(null);

	return (
		<DragDropProvider
			onDragStart={(event) => {
				const { source } = event.operation;

				dragStartDataRef.current = getDndData(source);
			}}
			onDragEnd={(event) => {
				if (event.canceled) {
					dragStartDataRef.current = null;
					return;
				}

				const { source, target } = event.operation;
				if (!source || !target) {
					dragStartDataRef.current = null;
					return;
				}

				const startData = dragStartDataRef.current;
				const sourceData = getDndData(source);

				const taskId = startData?.taskId ?? sourceData.taskId;
				const fromContainerId =
					startData?.containerId ?? sourceData.containerId;
				const toContainerId = getContainerIdFromTarget(target);

				dragStartDataRef.current = null;

				if (!taskId || !fromContainerId || !toContainerId) return;
				if (fromContainerId === toContainerId) return;

				// ✅ Gọi thẳng, không setTimeout
				onTaskMove({ taskId, fromContainerId, toContainerId });
			}}
		>
			{children}
		</DragDropProvider>
	);
}
