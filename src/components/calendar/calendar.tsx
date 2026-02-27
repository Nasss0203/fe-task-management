"use client";

import {
	createViewDay,
	createViewMonthAgenda,
	createViewMonthGrid,
	createViewWeek,
} from "@schedule-x/calendar";
import { createEventsServicePlugin } from "@schedule-x/events-service";
import { ScheduleXCalendar, useNextCalendarApp } from "@schedule-x/react";
import "@schedule-x/theme-default/dist/index.css";
import { useState } from "react";
import "temporal-polyfill/global";

function CalendarApp() {
	const eventsService = useState(() => createEventsServicePlugin())[0];

	const calendar = useNextCalendarApp({
		views: [
			createViewDay(),
			createViewWeek(),
			createViewMonthGrid(),
			createViewMonthAgenda(),
		],
		events: [
			{
				id: "1",
				title: "Event 1",
				start: Temporal.PlainDate.from("2023-12-16"),
				end: Temporal.PlainDate.from("2023-12-16"),
			},
		],
		plugins: [eventsService],
		callbacks: {
			onRender: () => {
				// get all events
				eventsService.getAll();
			},
		},
		// isDark: true,
	});

	return (
		<div>
			<ScheduleXCalendar calendarApp={calendar} />
		</div>
	);
}

export default CalendarApp;
