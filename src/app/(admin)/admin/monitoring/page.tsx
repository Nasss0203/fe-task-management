"use client";

import { MonitoringAlertFeed } from "@/components/admin/activity/monitoring-alert-feed";
import { MonitoringEventDetailPanel } from "@/components/admin/detail/monitoring-event-detail-panel";
import { MonitoringFilterBar } from "@/components/admin/filters/monitoring-filter-bar";
import { MonitoringAdminHeader } from "@/components/admin/header/monitoring-admin-header";
import { MonitoringServiceHealth } from "@/components/admin/health/monitoring-service-health";
import { MonitoringOverviewCards } from "@/components/admin/overview/monitoring-overview-cards";
import {
	adminMonitoringEvents,
	adminMonitoringServices,
	monitoringSnapshot,
} from "@/components/admin/shared/monitoring-admin.mock-data";
import type {
	MonitoringEvent,
	MonitoringEventStatus,
	MonitoringService,
} from "@/components/admin/shared/monitoring-admin.types";
import { matchesMonitoringDateFilter } from "@/components/admin/shared/monitoring-admin.utils";
import { MonitoringEventManagementTable } from "@/components/admin/table/monitoring-event-management-table";
import { useEffect, useMemo, useRef, useState } from "react";

export default function AdminMonitoringPage() {
	const [services] = useState<MonitoringService[]>(adminMonitoringServices);
	const [events, setEvents] = useState<MonitoringEvent[]>(
		adminMonitoringEvents,
	);
	const [selectedEvent, setSelectedEvent] = useState<MonitoringEvent | null>(
		null,
	);

	const [search, setSearch] = useState("");
	const [eventType, setEventType] = useState("all");
	const [severity, setSeverity] = useState("all");
	const [status, setStatus] = useState("all");
	const [time, setTime] = useState("all");

	const serviceHealthRef = useRef<HTMLDivElement | null>(null);
	const [serviceHealthHeight, setServiceHealthHeight] = useState<number>(0);

	useEffect(() => {
		if (!serviceHealthRef.current) return;

		const element = serviceHealthRef.current;

		const updateHeight = () => {
			setServiceHealthHeight(element.offsetHeight);
		};

		updateHeight();

		const observer = new ResizeObserver(() => {
			updateHeight();
		});

		observer.observe(element);

		return () => observer.disconnect();
	}, []);

	const filteredEvents = useMemo(() => {
		return events.filter((event) => {
			const keyword = search.toLowerCase();

			const matchesSearch =
				event.title.toLowerCase().includes(keyword) ||
				event.serviceName.toLowerCase().includes(keyword) ||
				event.description.toLowerCase().includes(keyword);

			const matchesType = eventType === "all" || event.type === eventType;
			const matchesSeverity =
				severity === "all" || event.severity === severity;
			const matchesStatus = status === "all" || event.status === status;
			const matchesTime = matchesMonitoringDateFilter(
				event.createdAt,
				time,
			);

			return (
				matchesSearch &&
				matchesType &&
				matchesSeverity &&
				matchesStatus &&
				matchesTime
			);
		});
	}, [events, search, eventType, severity, status, time]);

	const syncSelectedEvent = (nextEvents: MonitoringEvent[]) => {
		setSelectedEvent((prev: MonitoringEvent | null) => {
			if (!prev) return null;
			return nextEvents.find((event) => event.id === prev.id) ?? null;
		});
	};

	const updateEventStatus = (
		eventId: string,
		nextStatus: MonitoringEventStatus,
		resolutionNote?: string,
	) => {
		setEvents((prev: MonitoringEvent[]) => {
			const next: MonitoringEvent[] = prev.map((event) =>
				event.id === eventId
					? {
							...event,
							status: nextStatus,
							resolutionNote:
								resolutionNote ?? event.resolutionNote ?? null,
						}
					: event,
			);

			syncSelectedEvent(next);
			return next;
		});
	};

	const handleAcknowledge = (eventId: string) => {
		updateEventStatus(
			eventId,
			"ACKNOWLEDGED",
			"Đã ghi nhận và bắt đầu theo dõi.",
		);
	};

	const handleResolve = (eventId: string) => {
		updateEventStatus(
			eventId,
			"RESOLVED",
			"Đã đánh dấu xử lý xong từ màn monitoring.",
		);
	};

	const handleResetFilters = () => {
		setSearch("");
		setEventType("all");
		setSeverity("all");
		setStatus("all");
		setTime("all");
	};

	return (
		<div className='space-y-6 p-6'>
			<MonitoringAdminHeader />

			<MonitoringOverviewCards
				snapshot={monitoringSnapshot}
				services={services}
			/>

			<MonitoringFilterBar
				search={search}
				eventType={eventType}
				severity={severity}
				status={status}
				time={time}
				onSearchChange={setSearch}
				onEventTypeChange={setEventType}
				onSeverityChange={setSeverity}
				onStatusChange={setStatus}
				onTimeChange={setTime}
				onReset={handleResetFilters}
			/>

			<section className='grid gap-4 xl:grid-cols-3 xl:items-start'>
				<div
					ref={serviceHealthRef}
					className='xl:col-span-2 self-start'
				>
					<MonitoringServiceHealth services={services} />
				</div>

				<div className='self-start'>
					<MonitoringAlertFeed
						events={events}
						onView={setSelectedEvent}
						height={serviceHealthHeight}
					/>
				</div>
			</section>

			<MonitoringEventManagementTable
				events={filteredEvents}
				onView={setSelectedEvent}
				onAcknowledge={handleAcknowledge}
				onResolve={handleResolve}
			/>

			<MonitoringEventDetailPanel
				key={selectedEvent?.id ?? "monitoring-event-detail"}
				event={selectedEvent}
				onClose={() => setSelectedEvent(null)}
				onAcknowledge={handleAcknowledge}
				onResolve={handleResolve}
			/>
		</div>
	);
}
