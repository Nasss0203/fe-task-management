"use client";

import { createContext, useContext } from "react";

/** True inside a column: columns don't nest, so "2 columns" is hidden there. */
const InColumnContext = createContext(false);

export const InColumnProvider = InColumnContext.Provider;

export function useIsInColumn(): boolean {
	return useContext(InColumnContext);
}
