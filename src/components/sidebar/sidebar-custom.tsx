import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

function SidebarGroupV2({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot='sidebar-group'
			data-sidebar='group'
			className={cn(
				"relative flex w-full min-w-0 flex-col p-2",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarGroupLabelV2({
	className,
	asChild = false,
	...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
	const Comp = asChild ? Slot.Root : "div";

	return (
		<Comp
			data-slot='sidebar-group-label'
			data-sidebar='group-label'
			className={cn(
				"text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
				"group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuV2({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot='sidebar-menu'
			data-sidebar='menu'
			className={cn("flex w-full min-w-0 flex-col gap-1", className)}
			{...props}
		/>
	);
}

function SidebarMenuItemV2({
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-slot='sidebar-menu-item'
			data-sidebar='menu-item'
			className={cn("group/menu-item relative", className)}
			{...props}
		/>
	);
}

function SidebarMenuSubV2({ className, ...props }: React.ComponentProps<"ul">) {
	return (
		<ul
			data-slot='sidebar-menu-sub'
			data-sidebar='menu-sub'
			className={cn(
				"border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
				"group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

function SidebarMenuSubItemV2({
	className,
	...props
}: React.ComponentProps<"li">) {
	return (
		<li
			data-slot='sidebar-menu-sub-item'
			data-sidebar='menu-sub-item'
			className={cn("group/menu-sub-item relative", className)}
			{...props}
		/>
	);
}

function SidebarMenuSubButtonV2({
	asChild = false,
	size = "md",
	isActive = false,
	className,
	...props
}: React.ComponentProps<"a"> & {
	asChild?: boolean;
	size?: "sm" | "md";
	isActive?: boolean;
}) {
	const Comp = asChild ? Slot.Root : "a";

	return (
		<Comp
			data-slot='sidebar-menu-sub-button'
			data-sidebar='menu-sub-button'
			data-size={size}
			data-active={isActive}
			className={cn(
				"text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
				"data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
				size === "sm" && "text-xs",
				size === "md" && "text-sm",
				"group-data-[collapsible=icon]:hidden",
				className,
			)}
			{...props}
		/>
	);
}

export {
	SidebarGroupLabelV2,
	SidebarGroupV2,
	SidebarMenuItemV2,
	SidebarMenuSubButtonV2,
	SidebarMenuSubItemV2,
	SidebarMenuSubV2,
	SidebarMenuV2,
};
