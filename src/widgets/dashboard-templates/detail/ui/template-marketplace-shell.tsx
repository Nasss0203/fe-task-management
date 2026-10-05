"use client";

import React from "react";
import { AlertCircle, DollarSign, Globe, Lock, Shield, Sparkles, Store } from "lucide-react";
import type { PageTemplate } from "@/entities/template";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Separator } from "@/shared/ui/separator";

interface TemplateMarketplaceShellProps {
	template: PageTemplate;
}

export function TemplateMarketplaceShell({ template }: TemplateMarketplaceShellProps) {
	return (
		<div className='w-full space-y-6'>
			{/* Tab Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h2 className='text-lg font-semibold tracking-tight text-foreground'>
						Marketplace
					</h2>
					<p className='text-xs text-muted-foreground mt-0.5'>
						Sell or share this template with other users across the workspace and public ecosystem.
					</p>
				</div>
				<Badge
					variant='outline'
					className='bg-muted/30 text-muted-foreground border-border/70 text-[11px] gap-1 font-medium'
				>
					<Sparkles className='size-3 text-muted-foreground/70' />
					Design Preview
				</Badge>
			</div>

			{/* Main Grid: Listing Setup (Left) + Marketplace Summary (Right) */}
			<div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-6 lg:gap-8 items-start'>
				{/* Left Column: Listing Configuration Shell */}
				<div className='space-y-5'>
					{/* Status Card Banner */}
					<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<Store className='size-4 text-primary' />
								<h3 className='text-sm font-semibold text-foreground'>
									Listing status
								</h3>
							</div>
							<Badge
								variant='secondary'
								className='text-[10px] bg-muted text-muted-foreground border border-border/60'
							>
								Not listed
							</Badge>
						</div>

						<p className='text-xs text-muted-foreground leading-relaxed'>
							This template is currently only available in your workspace. Marketplace listing and global distribution are not configured yet.
						</p>

						<div className='pt-1'>
							<Button
								variant='outline'
								size='sm'
								disabled
								className='text-xs gap-1.5 opacity-60 cursor-not-allowed'
							>
								<Sparkles className='size-3.5' />
								Configure marketplace
								<Badge variant='secondary' className='text-[9px] px-1.5 py-0 ml-1'>
									Coming soon
								</Badge>
							</Button>
						</div>
					</div>

					{/* Pricing & Access Shell */}
					<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs'>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-2'>
								<DollarSign className='size-4 text-emerald-500' />
								<h3 className='text-sm font-semibold text-foreground'>
									Pricing & access model
								</h3>
							</div>
							<span className='text-[11px] text-muted-foreground italic'>
								Read-only preview
							</span>
						</div>

						<div className='space-y-4 text-xs'>
							{/* Access Type Radio Group (Disabled) */}
							<div className='space-y-2'>
								<Label className='text-xs font-medium text-foreground'>Access Type</Label>
								<div className='grid grid-cols-2 gap-3'>
									<label className='flex items-center gap-2.5 p-3 rounded-xl border border-primary/40 bg-primary/5 text-xs font-medium text-foreground opacity-80 cursor-not-allowed'>
										<input
											type='radio'
											name='access-type'
											defaultChecked
											disabled
											className='accent-primary'
										/>
										<span>Free (Open Access)</span>
									</label>

									<label className='flex items-center gap-2.5 p-3 rounded-xl border border-border/60 bg-muted/10 text-xs font-medium text-muted-foreground opacity-60 cursor-not-allowed'>
										<input
											type='radio'
											name='access-type'
											disabled
											className='accent-primary'
										/>
										<span>Paid Template</span>
									</label>
								</div>
							</div>

							{/* Price & Currency Form Inputs (Disabled) */}
							<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1'>
								<div className='space-y-1.5'>
									<Label className='text-xs font-medium text-foreground'>
										Price
									</Label>
									<Input
										disabled
										placeholder='—'
										className='h-9 text-xs opacity-60 cursor-not-allowed bg-muted/15'
									/>
								</div>

								<div className='space-y-1.5'>
									<Label className='text-xs font-medium text-foreground'>
										Currency
									</Label>
									<Input
										disabled
										value='USD ($)'
										readOnly
										className='h-9 text-xs opacity-60 cursor-not-allowed bg-muted/15'
									/>
								</div>
							</div>

							{/* Fee and Payout Calculations */}
							<div className='rounded-xl border border-border/60 bg-muted/15 p-3.5 space-y-2 text-xs'>
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Platform processing fee</span>
									<span className='text-muted-foreground font-mono'>Not available yet</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-muted-foreground'>Estimated creator earnings</span>
									<span className='text-muted-foreground font-mono'>Not available yet</span>
								</div>
							</div>
						</div>
					</div>

					{/* Licensing & Distribution Shell */}
					<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-3.5 shadow-xs'>
						<div className='flex items-center gap-2'>
							<Shield className='size-4 text-blue-500' />
							<h3 className='text-sm font-semibold text-foreground'>
								Licensing & distribution terms
							</h3>
						</div>

						<dl className='space-y-2 text-xs'>
							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Template license</dt>
								<dd className='text-foreground font-medium'>Standard Workspace License</dd>
							</div>
							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Public discovery</dt>
								<dd className='text-muted-foreground'>Requires Public visibility before listing</dd>
							</div>
							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Current template visibility</dt>
								<dd className='flex items-center gap-1.5 text-foreground font-medium capitalize'>
									{template.visibility === "PRIVATE" && <Lock className='size-3 text-muted-foreground' />}
									{template.visibility === "PUBLIC" && <Globe className='size-3 text-muted-foreground' />}
									{template.visibility.toLowerCase()}
								</dd>
							</div>
						</dl>
					</div>
				</div>

				{/* Right Column: Marketplace Summary Card */}
				<aside className='w-full space-y-4 lg:sticky lg:top-4'>
					<div className='rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs'>
						<h3 className='text-sm font-semibold text-foreground'>
							Marketplace summary
						</h3>

						<dl className='space-y-2.5 text-xs'>
							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Status</dt>
								<dd>
									<Badge
										variant='secondary'
										className='text-[10px] bg-muted text-muted-foreground border border-border/60'
									>
										Not listed
									</Badge>
								</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Access</dt>
								<dd className='text-foreground font-medium'>Not configured</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Price</dt>
								<dd className='text-foreground font-mono'>—</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Currency</dt>
								<dd className='text-foreground font-mono'>—</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>License</dt>
								<dd className='text-foreground font-mono'>—</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Published at</dt>
								<dd className='text-foreground font-mono'>—</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Total purchases</dt>
								<dd className='text-foreground font-mono'>—</dd>
							</div>

							<div className='flex items-center justify-between'>
								<dt className='text-muted-foreground'>Gross revenue</dt>
								<dd className='text-foreground font-mono'>—</dd>
							</div>
						</dl>

						<Separator className='border-border/60' />

						<div className='rounded-xl border border-border/60 bg-muted/20 p-3 text-[11px] text-muted-foreground flex items-start gap-2 leading-relaxed'>
							<AlertCircle className='size-3.5 shrink-0 text-muted-foreground/70 mt-0.5' />
							<span>
								Public marketplace discovery, paid transactions, and revenue tracking will become active when marketplace integration is rolled out.
							</span>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}
