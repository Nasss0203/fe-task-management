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
				return <FileText className='h-4 w-4 text-foreground' />;
			case "database":
				return <Database className='h-4 w-4 text-foreground' />;
			case "users":
				return <Users className='h-4 w-4 text-foreground' />;
			case "shield":
				return <Shield className='h-4 w-4 text-foreground' />;
			case "globe":
				return <Globe className='h-4 w-4 text-foreground' />;
			case "layout-template":
				return <LayoutTemplate className='h-4 w-4 text-foreground' />;
			case "sparkles":
				return <Sparkles className='h-4 w-4 text-foreground' />;
			default:
				return <Sparkles className='h-4 w-4 text-foreground' />;
		}
	};

	const cardContent = (
		<div className='group relative h-full flex flex-col justify-between rounded-xl border border-border bg-card p-6 hover:border-foreground/20 transition-colors'>
			{/* Top Row: Icon Container Left + Badge Right */}
			<div>
				<div className='flex items-center justify-between'>
					<div className='h-9 w-9 rounded-lg border border-border/80 bg-secondary/70 text-foreground flex items-center justify-center shrink-0'>
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
				<h3 className='text-base font-semibold tracking-tight text-foreground mt-4'>
					{feature.title}
				</h3>

				{/* Description */}
				<p className='mt-1.5 text-sm text-muted-foreground leading-relaxed'>
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
