import { createContext, useContext } from "react";

/** Share token of the page a database is read through (share-link viewers). */
export const DatabaseShareTokenContext = createContext<string | undefined>(
	undefined,
);

export const useDatabaseShareToken = () => useContext(DatabaseShareTokenContext);
