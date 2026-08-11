"use client";

import {
	createViewDay,
	createViewMonthAgenda,
	createViewMonthGrid,
	createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-shadcn/dist/index.css";
import { useState, useMemo, useEffect } from "react";
import "temporal-polyfill/global";
import { useTheme } from "next-themes";
import { useTask } from "@/features/task/hooks/useTask";
import { DrawerItemView } from "@/components/drawer/DrawerItemView";
import { isTaskVisible } from "@/lib/task-completion";
import type { TaskItem } from "@/services/task/type";

type CalendarAppProps = {
	workspaceId: string;
	projectId: string;
};

const formatScheduleXDate = (isoString?: string | null) => {
	if (!isoString) return null;
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return null;
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	if (date.getHours() === 0 && date.getMinutes() === 0) {
		return `${year}-${month}-${day}`;
	}

	return `${year}-${month}-${day} ${hours}:${minutes}`;
};

function CalendarApp({ workspaceId, projectId }: CalendarAppProps) {
	const { taskQuery } = useTask(workspaceId, projectId);
	const tasks = useMemo(() => {
		const data = taskQuery.data?.data;

		return Array.isArray(data) ? data.filter(isTaskVisible) : [];
	}, [taskQuery.data?.data]);

	const [activeDrawerTaskId, setActiveDrawerTaskId] = useState<string | null>(null);

	const eventsService = useState(() => createEventsServicePlugin())[0];

	const calendarEvents = useMemo(() => {
		const parseToTemporal = (dateStr: string) => {
			if (dateStr.includes(" ")) {
				const isoStr = dateStr.replace(" ", "T") + ":00";
				return Temporal.PlainDateTime.from(isoStr).toZonedDateTime("UTC");
			}
			return Temporal.PlainDate.from(dateStr);
		};

		return tasks.flatMap((task: TaskItem) => {
			const taskStart = formatScheduleXDate(task.startAt);
			const taskDue = formatScheduleXDate(task.dueAt);
			const startString = taskStart || taskDue;

			if (!startString) return [];

			const endString = taskDue || startString;
			const assigneeNames =
				task.assignees
					?.map((assignee) => assignee.fullName || assignee.username || "User")
					.filter(Boolean) ?? [];
			const assigneeLabel =
				assigneeNames.length > 0
					? `Assigned: ${assigneeNames.join(", ")}`
					: "";

			const start = parseToTemporal(startString!);
			let end = parseToTemporal(endString!);

			// Ensure timed events have a duration (e.g., 1 hour) if start == end
			if (start instanceof Temporal.ZonedDateTime && end instanceof Temporal.ZonedDateTime) {
				if (start.epochNanoseconds === end.epochNanoseconds) {
					end = end.add({ hours: 1 });
				}
			}

			return [{
				id: task.id,
				title:
					assigneeNames.length > 0
						? `${task.title ?? "Untitled"} • ${assigneeNames[0]}`
						: (task.title ?? "Untitled"),
				start,
				end,
				description: assigneeLabel
					? task.description
						? `${assigneeLabel}\n${task.description}`
						: assigneeLabel
					: (task.description || ""),
				people: assigneeNames,
			}];
		});
	}, [tasks]);

	const { resolvedTheme } = useTheme();

	const calendar = useNextCalendarApp({
		isDark: resolvedTheme === "dark",
		views: [
			createViewDay(),
			createViewWeek(),
			createViewMonthGrid(),
			createViewMonthAgenda(),
		],
		events: calendarEvents,
		plugins: [eventsService],
		callbacks: {
			onEventClick: (calendarEvent) => {
				setActiveDrawerTaskId(calendarEvent.id as string);
			},
		},
	});

	useEffect(() => {
		eventsService.set(calendarEvents);
	}, [calendarEvents, eventsService]);

	useEffect(() => {
		if (calendar && calendar.setTheme) {
			calendar.setTheme(resolvedTheme === "dark" ? "dark" : "light");
		}
	}, [resolvedTheme, calendar]);

	const activeDrawerTask = useMemo(() => {
		return tasks.find((t: TaskItem) => t.id === activeDrawerTaskId) || null;
	}, [tasks, activeDrawerTaskId]);

	return (
		<div className="relative isolate z-0 h-[calc(100vh-180px)] flex flex-col min-h-0 overflow-hidden">
			<div className="relative isolate z-0 flex-1 min-h-0 [&_.sx-react-calendar-wrapper]:h-full">
				<ScheduleXCalendar calendarApp={calendar} />
			</div>

			{activeDrawerTask ? (
				<DrawerItemView
					open={!!activeDrawerTask}
					onOpenChange={(open) => {
						if (!open) {
							setActiveDrawerTaskId(null);
						}
					}}
					task={activeDrawerTask}
				/>
			) : null}
		</div>
	);
}

export default CalendarApp;
