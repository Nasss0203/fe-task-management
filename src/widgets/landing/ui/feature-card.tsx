import {
	Database,
	FileText,
	Globe,
	LayoutTemplate,
	Shield,
	Sparkles,
	Users,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import type { FeatureItem } from "../data/marketing-data";

interface FeatureCardProps {
	feature: FeatureItem;
	href?: string;
}

export function FeatureCard({ feature, href }: FeatureCardProps) {
	const getIcon = () => {
		switch (feature.iconName) {
			case "file-text":
				return <FileText className='h-5 w-5 text-primary' />;
			case "database":
				return <Database className='h-5 w-5 text-primary' />;
			case "users":
				return <Users className='h-5 w-5 text-primary' />;
			case "shield":
				return <Shield className='h-5 w-5 text-primary' />;
			case "globe":
				return <Globe className='h-5 w-5 text-primary' />;
			case "layout-template":
				return <LayoutTemplate className='h-5 w-5 text-primary' />;
			case "sparkles":
				return <Sparkles className='h-5 w-5 text-primary' />;
			default:
				return <Sparkles className='h-5 w-5 text-primary' />;
		}
	};

	const cardContent = (
		<div className='group relative h-full flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-xs hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300'>
			{/* Top Row: Icon Container Left + Badge Right */}
			<div>
				<div className='flex items-center justify-between'>
					<div className='h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shrink-0 group-hover:scale-105 transition-transform duration-200'>
						{getIcon()}
					</div>

					{feature.badge && (
						<Badge
							variant='outline'
							className='h-6 px-2.5 rounded-md border-border/80 bg-muted/40 text-[11px] font-medium text-muted-foreground'
						>
							{feature.badge}
						</Badge>
					)}
				</div>

				{/* Title */}
				<h3 className='text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors mt-5'>
					{feature.title}
				</h3>

				{/* Description */}
				<p className='mt-2 text-sm text-muted-foreground leading-relaxed'>
					{feature.description}
				</p>
			</div>
		</div>
	);

	if (href) {
		return (
			<Link href={href} className='block h-full'>
				{cardContent}
			</Link>
		);
	}

	return cardContent;
}
