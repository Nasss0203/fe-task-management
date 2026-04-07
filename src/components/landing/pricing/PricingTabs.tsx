"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { pricingData } from "./pricing.data";
import { PricingGrid } from "./PricingGrid";

export function PricingTabs() {
	return (
		<Tabs defaultValue='individuals' className='mt-10'>
			<div className='flex justify-center'>
				<TabsList className='h-auto rounded-xl border border-white/15 bg-white/[0.03] p-1 backdrop-blur-xl'>
					<TabsTrigger
						value='individuals'
						className='rounded-lg px-5 py-2.5 text-sm font-medium text-white/75 data-[state=active]:bg-violet-600 data-[state=active]:text-white'
					>
						Individuals & Small Teams
					</TabsTrigger>

					<TabsTrigger
						value='businesses'
						className='rounded-lg px-5 py-2.5 text-sm font-medium text-white/75 data-[state=active]:bg-violet-600 data-[state=active]:text-white'
					>
						Businesses & Enterprises
					</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value='individuals' className='mt-8'>
				<PricingGrid plans={pricingData.individuals} />
			</TabsContent>

			<TabsContent value='businesses' className='mt-8'>
				<PricingGrid plans={pricingData.businesses} />
			</TabsContent>
		</Tabs>
	);
}
