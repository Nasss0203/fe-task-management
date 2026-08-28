"use client";

import { createContext, useContext, useState } from "react";

interface PageBlockEditorContextValue {
	focusBlockId: string | null;

	requestFocus: (blockId: string) => void;

	clearFocus: () => void;

	getPreviousBlockId: (blockId: string) => string | null;
}

const PageBlockEditorContext =
	createContext<PageBlockEditorContextValue | null>(null);

interface PageBlockEditorProviderProps {
	children: React.ReactNode;

	orderedBlockIds: string[];
}

export function PageBlockEditorProvider({
	children,
	orderedBlockIds,
}: PageBlockEditorProviderProps) {
	const [focusBlockId, setFocusBlockId] = useState<string | null>(null);

	const getPreviousBlockId = (blockId: string): string | null => {
		const index = orderedBlockIds.indexOf(blockId);

		if (index <= 0) {
			return null;
		}

		return orderedBlockIds[index - 1];
	};

	return (
		<PageBlockEditorContext.Provider
			value={{
				focusBlockId,

				requestFocus: (blockId) => {
					setFocusBlockId(blockId);
				},

				clearFocus: () => {
					setFocusBlockId(null);
				},

				getPreviousBlockId,
			}}
		>
			{children}
		</PageBlockEditorContext.Provider>
	);
}

export function usePageBlockEditor() {
	const context = useContext(PageBlockEditorContext);

	if (!context) {
		throw new Error(
			"usePageBlockEditor must be used inside PageBlockEditorProvider",
		);
	}

	return context;
}
