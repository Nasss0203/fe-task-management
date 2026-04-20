export type MonitoringServiceStatus = "HEALTHY" | "DEGRADED" | "DOWN";

export type MonitoringServiceCategory =
	| "API"
	| "DATABASE"
	| "QUEUE"
	| "MAIL"
	| "STORAGE"
	| "WEBHOOK";

export type MonitoringSeverity = "INFO" | "WARNING" | "CRITICAL";

export type MonitoringEventType =
	| "REQUEST_ERROR"
	| "QUEUE_FAILED"
	| "EMAIL_FAILED"
	| "WEBHOOK_FAILED"
	| "SYSTEM_LOG"
	| "ALERT";

export type MonitoringEventStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

export type MonitoringService = {
	id: string;
	name: string;
	category: MonitoringServiceCategory;
	status: MonitoringServiceStatus;
	uptimePercent: number;
	responseTimeMs: number;
	lastChecked: string;
	message: string;
	region?: string | null;
};

export type MonitoringEvent = {
	id: string;
	type: MonitoringEventType;
	severity: MonitoringSeverity;
	status: MonitoringEventStatus;
	title: string;
	serviceName: string;
	description: string;
	createdAt: string;
	actor: string;
	metadata: Record<string, unknown>;
	resolutionNote?: string | null;
};

export type MonitoringSnapshot = {
	apiUptimePercent: number;
	errorRatePercent: number;
	failedJobs: number;
	failedEmails: number;
	failedWebhooks: number;
	openAlerts: number;
	avgResponseTimeMs: number;
};
