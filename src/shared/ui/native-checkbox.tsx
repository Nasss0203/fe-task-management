import type { ComponentProps } from "react";
import { cn } from "@/shared/lib/utils";

/** The native checkbox used by page todos and database properties. */
export function NativeCheckbox({
	className,
	readOnly,
	disabled,
	...props
}: Omit<ComponentProps<"input">, "type">) {
	return (
		<input
			{...props}
			type='checkbox'
			readOnly={readOnly}
			disabled={disabled || readOnly}
			className={cn(
				"size-4 appearance-none rounded-[4px] border-[1.5px] border-[#c8c8c6] bg-background bg-center bg-no-repeat transition-colors checked:border-ring checked:bg-ring checked:bg-[url(data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20viewBox=%270%200%2016%2016%27%20fill=%27none%27%20stroke=%27white%27%20stroke-width=%272.5%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3e%3cpath%20d=%27M4%208.5l2.5%202.5L12%205.5%27/%3e%3c/svg%3e)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-100 dark:border-[#4a4a4a] dark:checked:border-ring",
				className,
			)}
		/>
	);
}
