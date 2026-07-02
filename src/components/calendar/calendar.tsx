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
	const tasks = Array.isArray(taskQuery?.data?.data) ? taskQuery.data.data : [];

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

		return tasks.map((task: TaskItem) => {
			const startString = formatScheduleXDate(task.startAt) || formatScheduleXDate(task.dueAt) || formatScheduleXDate(task.createdAt) || formatScheduleXDate(new Date().toISOString());
			const endString = formatScheduleXDate(task.dueAt) || startString;

			const start = parseToTemporal(startString!);
			let end = parseToTemporal(endString!);

			// Ensure timed events have a duration (e.g., 1 hour) if start == end
			if (start instanceof Temporal.ZonedDateTime && end instanceof Temporal.ZonedDateTime) {
				if (start.epochNanoseconds === end.epochNanoseconds) {
					end = end.add({ hours: 1 });
				}
			}

			return {
				id: task.id,
				title: task.title,
				start,
				end,
				description: task.description || "",
				people: task.assignees?.map(a => a.fullName || a.username || "User") || [],
			};
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
		<div className="h-[calc(100vh-180px)] flex flex-col min-h-0 overflow-hidden">
			<div className="flex-1 min-h-0 [&_.sx-react-calendar-wrapper]:h-full">
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
