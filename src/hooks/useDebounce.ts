import { useEffect, useState } from "react";

export function useDebounced<T>(value: T, delay: number = 400): T {
	const [debounced, setDebounced] = useState<T>(value);

	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);

	return debounced;
}
