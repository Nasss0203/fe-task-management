export interface FeatureItem {
	id: string;
	title: string;
	description: string;
	iconName:
		| "file-text"
		| "database"
		| "users"
		| "shield"
		| "globe"
		| "layout-template"
		| "sparkles";
	badge: string;
	capabilities: string[];
}

export const CORE_FEATURES: FeatureItem[] = [
	{
		id: "pages-notes",
		title: "Pages & Notes",
		description:
			"Rich block documents with markdown, code snippets, nested pages, and real-time collaborative editing.",
		iconName: "file-text",
		badge: "Core Editor",
		capabilities: [
			"Block-based editor with markdown formatting shortcuts",
			"Infinite nested page hierarchy and knowledge trees",
			"Syntax-highlighted code blocks, tables, and callouts",
			"Live multiplayer typing and conflict-free sync",
		],
	},
	{
		id: "database-views",
		title: "Database & Views",
		description:
			"Structure information with custom properties and seamless Table, Board, List, and Calendar views.",
		iconName: "database",
		badge: "Structured Data",
		capabilities: [
			"Custom property types: Status, Select, Date, Number",
			"Multi-view switches: Table, Board, List, and Calendar",
			"Dynamic multi-condition filtering, sorting, and grouping",
			"Relational page linking between databases and documents",
		],
	},
	{
		id: "workspace-teamspaces",
		title: "Workspace & Teamspaces",
		description:
			"Organize squads into dedicated teamspaces with centralized directories, feeds, and pinned resources.",
		iconName: "users",
		badge: "Team Hub",
		capabilities: [
			"Dedicated teamspaces for company departments",
			"Workspace switcher with member directory management",
			"Centralized notifications and workspace inbox updates",
			"Customizable sidebar favorites and pinned pages",
		],
	},
	{
		id: "sharing-permissions",
		title: "Sharing & Permissions",
		description:
			"Protect confidential records with granular role-based permissions and secure page access control.",
		iconName: "shield",
		badge: "Access Control",
		capabilities: [
			"Role-based access: Owner, Admin, Member, Viewer",
			"Private personal drafts alongside shared spaces",
			"Granular page permission inheritance rules",
			"Workspace invitation tokens and access requests",
		],
	},
	{
		id: "publish-to-web",
		title: "Publish to Web",
		description:
			"Turn any page or documentation tree into a public website with unique subdomains in seconds.",
		iconName: "globe",
		badge: "Instant Sites",
		capabilities: [
			"One-click public site publishing with custom subdomain",
			"Optional inclusion of nested child pages and links",
			"Read-only global access with fast edge caching",
			"Instant republish updates with live synchronization",
		],
	},
	{
		id: "ai-assistant",
		title: "AI Assistant",
		description:
			"Context-aware intelligence to draft documents, summarize notes, brainstorm, and answer questions.",
		iconName: "sparkles",
		badge: "Intelligence",
		capabilities: [
			"Draft product specifications and engineering RFCs",
			"Summarize extensive meeting notes into action items",
			"Brainstorm ideas and organize workspace data",
			"Contextual Q&A on your internal documentation",
		],
	},
];

export type TemplatePreviewType =
	| "wiki"
	| "notes"
	| "knowledge"
	| "database-calendar"
	| "crm"
	| "handbook"
	| "research"
	| "planner"
	| "reading-list"
	| "directory";

export interface MarketingTemplate {
	id: string;
	slug: string;
	name: string;
	title: string;
	description: string;
	category: "Documentation" | "Knowledge Base" | "Database" | "Team" | "Personal";
	tags: string[];
	icon: string;
	previewType: TemplatePreviewType;
	variant?: string;
	featured?: boolean;
	popular?: boolean;
	included: string[];
	features: string[];
}

export const MARKETING_TEMPLATES: MarketingTemplate[] = [
	{
		id: "team-wiki",
		slug: "team-wiki",
		name: "Team Wiki",
		title: "Team Wiki",
		description:
			"Centralize team knowledge, guidelines, links, and shared documentation.",
		category: "Knowledge Base",
		tags: ["Team", "Documentation", "Wiki"],
		icon: "BookOpen",
		previewType: "wiki",
		featured: true,
		popular: true,
		included: [
			"Structured team pages",
			"Knowledge categories",
			"Quick navigation",
			"Reusable documentation sections",
		],
		features: [
			"Structured team pages",
			"Knowledge categories",
			"Quick navigation",
			"Reusable documentation sections",
		],
	},
	{
		id: "meeting-notes",
		slug: "meeting-notes",
		name: "Meeting Notes",
		title: "Meeting Notes",
		description:
			"Capture agendas, decisions, notes, and follow-up items in one place.",
		category: "Documentation",
		tags: ["Meetings", "Team", "Notes"],
		icon: "NotebookPen",
		previewType: "notes",
		featured: true,
		popular: true,
		included: [
			"Meeting agenda",
			"Discussion notes",
			"Decisions log",
			"Follow-up items",
		],
		features: [
			"Meeting agenda",
			"Discussion notes",
			"Decisions log",
			"Follow-up items",
		],
	},
	{
		id: "knowledge-base",
		slug: "knowledge-base",
		name: "Knowledge Base",
		title: "Knowledge Base",
		description:
			"Build an organized internal knowledge hub using pages and structured content.",
		category: "Knowledge Base",
		tags: ["Documentation", "Workspace", "Guides"],
		icon: "Library",
		previewType: "knowledge",
		featured: true,
		popular: true,
		included: [
			"Nested pages hierarchy",
			"Documentation structure",
			"Reference sections",
			"Team knowledge organization",
		],
		features: [
			"Nested pages hierarchy",
			"Documentation structure",
			"Reference sections",
			"Team knowledge organization",
		],
	},
	{
		id: "content-calendar",
		slug: "content-calendar",
		name: "Content Calendar",
		title: "Content Calendar",
		description:
			"Plan and organize content using structured database views.",
		category: "Database",
		tags: ["Content", "Database", "Calendar"],
		icon: "CalendarDays",
		previewType: "database-calendar",
		featured: false,
		popular: false,
		included: [
			"Content database",
			"Status properties",
			"Calendar view",
			"Content metadata",
		],
		features: [
			"Content database",
			"Status properties",
			"Calendar view",
			"Content metadata",
		],
	},
	{
		id: "crm",
		slug: "crm",
		name: "Simple CRM",
		title: "Simple CRM",
		description:
			"Track contacts and relationship information with a flexible database.",
		category: "Database",
		tags: ["Database", "Team", "Sales"],
		icon: "ContactRound",
		previewType: "crm",
		featured: false,
		popular: false,
		included: [
			"Contact database",
			"Custom properties",
			"Multiple views",
			"Structured notes",
		],
		features: [
			"Contact database",
			"Custom properties",
			"Multiple views",
			"Structured notes",
		],
	},
	{
		id: "company-handbook",
		slug: "company-handbook",
		name: "Company Handbook",
		title: "Company Handbook",
		description:
			"Create a shared home for company policies, culture, and team information.",
		category: "Team",
		tags: ["Team", "Documentation", "Culture"],
		icon: "Building2",
		previewType: "handbook",
		featured: false,
		popular: false,
		included: [
			"Company overview",
			"Policies & benefits",
			"Team guidelines",
			"Nested documentation",
		],
		features: [
			"Company overview",
			"Policies & benefits",
			"Team guidelines",
			"Nested documentation",
		],
	},
	{
		id: "research-notes",
		slug: "research-notes",
		name: "Research Notes",
		title: "Research Notes",
		description:
			"Organize sources, findings, notes, and references in a structured workspace.",
		category: "Personal",
		tags: ["Research", "Notes", "Personal"],
		icon: "Search",
		previewType: "research",
		featured: false,
		popular: false,
		included: [
			"Research pages",
			"Source tracking",
			"Structured notes",
			"Reference database",
		],
		features: [
			"Research pages",
			"Source tracking",
			"Structured notes",
			"Reference database",
		],
	},
	{
		id: "personal-planner",
		slug: "personal-planner",
		name: "Personal Planner",
		title: "Personal Planner",
		description:
			"Organize plans, notes, priorities, and personal information in one workspace.",
		category: "Personal",
		tags: ["Personal", "Productivity", "Planner"],
		icon: "LayoutDashboard",
		previewType: "planner",
		featured: false,
		popular: false,
		included: [
			"Personal dashboard",
			"Notes area",
			"Planning database",
			"Quick links",
		],
		features: [
			"Personal dashboard",
			"Notes area",
			"Planning database",
			"Quick links",
		],
	},
	{
		id: "reading-list",
		slug: "reading-list",
		name: "Reading List",
		title: "Reading List",
		description:
			"Track books, articles, notes, and reading progress with a simple database.",
		category: "Database",
		tags: ["Personal", "Database", "Reading"],
		icon: "BookMarked",
		previewType: "reading-list",
		featured: false,
		popular: false,
		included: [
			"Reading database",
			"Status tracking",
			"Notes & quotes",
			"Multiple views",
		],
		features: [
			"Reading database",
			"Status tracking",
			"Notes & quotes",
			"Multiple views",
		],
	},
	{
		id: "team-directory",
		slug: "team-directory",
		name: "Team Directory",
		title: "Team Directory",
		description:
			"Keep useful team information organized in a shared structured database.",
		category: "Team",
		tags: ["Team", "Database", "Directory"],
		icon: "Users",
		previewType: "directory",
		featured: false,
		popular: false,
		included: [
			"Member directory",
			"Roles and information",
			"Structured properties",
			"Team reference view",
		],
		features: [
			"Member directory",
			"Roles and information",
			"Structured properties",
			"Team reference view",
		],
	},
];

export const TEMPLATE_CATEGORIES = [
	"All",
	"Documentation",
	"Knowledge Base",
	"Database",
	"Team",
	"Personal",
] as const;

export interface AiCapability {
	id: string;
	title: string;
	description: string;
	examplePrompt: string;
	exampleResultTitle: string;
	exampleResultItems: string[];
}

export const AI_CAPABILITIES: AiCapability[] = [
	{
		id: "draft-specs",
		title: "Draft Specs & Documents",
		description:
			"Draft comprehensive specifications, RFCs, meeting agendas, and team announcements.",
		examplePrompt: "Draft an architecture spec for public page publishing with subdomains.",
		exampleResultTitle: "Architecture Spec: Public Site Publishing Engine",
		exampleResultItems: [
			"Overview: Edge routing middleware mapping hostnames to public page records",
			"Security: Read-only query filter guaranteeing isolation from private teamspaces",
			"Data Model: Page publication state, subdomain slug, and recursive child flag",
			"API: Endpoints for publish, republish, and unpublish with cache invalidation",
		],
	},
	{
		id: "summarize-notes",
		title: "Summarize Information",
		description:
			"Condense long technical discussions, meeting notes, and research into actionable takeaways.",
		examplePrompt: "Summarize our weekly product review and extract key action items.",
		exampleResultTitle: "Executive Summary & Key Takeaways",
		exampleResultItems: [
			"Decision: Adopt unified marketing container with standardized card anatomy",
			"Takeaway: Database multi-views (Table, Board, Calendar) prioritized for release",
			"Action: Update permission matrix in workspace settings modal",
			"Action: Publish new developer handbook to public subdomain",
		],
	},
	{
		id: "structure-database",
		title: "Organize Database Schemas",
		description:
			"Transform messy unstructured text and notes into clean relational database properties.",
		examplePrompt: "Suggest a database structure for our team content calendar.",
		exampleResultTitle: "Proposed Database Properties",
		exampleResultItems: [
			"Property 1: Title (Title) — Article or release headline",
			"Property 2: Status (Select) — Idea, Drafting, Review, Published",
			"Property 3: Author (Person) — Assigned team member",
			"Property 4: Release Date (Date) — Target publication schedule",
		],
	},
	{
		id: "brainstorm-ideas",
		title: "Brainstorm & Expand Ideas",
		description:
			"Generate outlines, creative perspectives, and structured brainstorming boards.",
		examplePrompt: "Brainstorm 4 high-impact use cases for our teamspace documentation.",
		exampleResultTitle: "Teamspace Documentation Use Cases",
		exampleResultItems: [
			"Engineering: Microservice API contracts and architecture RFCs",
			"Design: Component style guides, design tokens, and review notes",
			"Operations: Onboarding roadmaps and standard operating procedures (SOPs)",
			"Product: Customer research repository and quarterly feature briefs",
		],
	},
	{
		id: "answer-questions",
		title: "Answer Workspace Questions",
		description:
			"Query your internal team documentation, policies, and workspace records naturally.",
		examplePrompt: "What is our company policy on publishing public pages?",
		exampleResultTitle: "Workspace Policy Summary",
		exampleResultItems: [
			"Permission: Only Workspace Owners and Admins can publish public sites",
			"Scope: Public pages can include child pages via the recursive flag",
			"Subdomains: Subdomain slugs must be unique across the Taskmanly network",
			"Security: Private notes and unshared blocks remain completely protected",
		],
	},
];

export interface PricingPlan {
	id: string;
	code: string;
	name: string;
	badge?: string;
	priceMonthly: string;
	priceYearly: string;
	period: string;
	description: string;
	popular?: boolean;
	features: { name: string; included: boolean }[];
	cta: string;
	ctaVariant: "default" | "outline";
}

export const MARKETING_PRICING_PLANS: PricingPlan[] = [
	{
		id: "plan-free",
		code: "FREE",
		name: "Free",
		priceMonthly: "0đ",
		priceYearly: "0đ",
		period: "forever",
		description: "For individuals and small squads organizing notes and structured knowledge.",
		features: [
			{ name: "Up to 5 team members", included: true },
			{ name: "1 Teamspace", included: true },
			{ name: "100 MB file storage", included: true },
			{ name: "Unlimited pages, documents & blocks", included: true },
			{ name: "Database Table & List views", included: true },
			{ name: "Community support", included: true },
			{ name: "Public page publishing", included: false },
			{ name: "AI Assistant credits", included: false },
			{ name: "Advanced role permissions", included: false },
		],
		cta: "Get started free",
		ctaVariant: "outline",
	},
	{
		id: "plan-pro",
		code: "PRO",
		name: "Pro",
		badge: "Most Popular",
		priceMonthly: "99.000đ",
		priceYearly: "79.000đ",
		period: "per user / month",
		description: "For growing teams that need multi-view databases, public sites, and AI.",
		popular: true,
		features: [
			{ name: "Up to 25 team members", included: true },
			{ name: "5 Teamspaces", included: true },
			{ name: "10 GB file storage", included: true },
			{ name: "Unlimited pages & documents", included: true },
			{ name: "Full Database Views (Table, Board, Calendar)", included: true },
			{ name: "Public page publishing with custom subdomain", included: true },
			{ name: "Taskmanly AI Assistant included", included: true },
			{ name: "Role permissions (Admin, Member, Viewer)", included: true },
			{ name: "Priority email & chat support", included: true },
		],
		cta: "Start 14-day Pro trial",
		ctaVariant: "default",
	},
	{
		id: "plan-team",
		code: "TEAM",
		name: "Team",
		badge: "Scale & Control",
		priceMonthly: "249.000đ",
		priceYearly: "199.000đ",
		period: "per user / month",
		description: "For larger organizations requiring unlimited scale, security, and dedicated guidance.",
		features: [
			{ name: "Unlimited team members", included: true },
			{ name: "Unlimited Teamspaces", included: true },
			{ name: "100 GB file storage", included: true },
			{ name: "Advanced role permissions (RBAC)", included: true },
			{ name: "Unlimited public published sites", included: true },
			{ name: "Unlimited AI Assistant usage", included: true },
			{ name: "Audit logs & workspace activity history", included: true },
			{ name: "Dedicated customer success manager", included: true },
			{ name: "99.9% uptime SLA", included: true },
		],
		cta: "Get started with Team",
		ctaVariant: "outline",
	},
];

export const PRICING_FAQS = [
	{
		question: "Can I try Taskmanly before committing to a paid plan?",
		answer:
			"Yes! The Free plan is completely free forever with no credit card required. You can also start a 14-day free trial of the Pro plan at any time.",
	},
	{
		question: "What happens when I publish a page to the web?",
		answer:
			"When you publish a page, Taskmanly generates a secure public subdomain URL. Anyone with the link can view your formatted page and its nested child pages with fast edge caching.",
	},
	{
		question: "How does the AI Assistant work?",
		answer:
			"Taskmanly AI is integrated directly into your workspace. It can draft content, summarize documents, propose database schemas, and answer questions using your workspace context.",
	},
	{
		question: "Can I change or cancel my plan at any time?",
		answer:
			"Yes. You can upgrade, downgrade, or cancel your subscription at any time directly in your Workspace Billing settings.",
	},
	{
		question: "What payment methods are supported?",
		answer:
			"We support international credit cards via Stripe, as well as domestic Vietnamese bank QR transfers via SePay.",
	},
];
