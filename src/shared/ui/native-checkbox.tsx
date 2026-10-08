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
				"size-4 accent-primary disabled:opacity-100",
				className,
			)}
		/>
	);
}
