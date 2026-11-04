"use client";

import { createContext, useContext } from "react";

const PageBlockRowContext = createContext<string | null>(null);

export const PageBlockRowProvider = PageBlockRowContext.Provider;

export function usePageBlockRowId(): string | null {
	return useContext(PageBlockRowContext);
}
