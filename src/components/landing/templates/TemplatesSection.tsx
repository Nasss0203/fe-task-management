import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import TemplateCard from "./TemplateCard";
import { templateItems } from "./template-data";

export default function TemplatesSection() {
	return (
		<section className='py-10 md:py-14'>
			<div className='mb-8 flex items-center justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight text-white md:text-3xl'>
						Templates
					</h1>
					<p className='mt-2 text-sm text-white/60 md:text-base'>
						Start faster with ready-made layouts for planning,
						meetings, and productivity.
					</p>
				</div>

				<Button
					variant='outline'
					className='h-11 rounded-xl border-white/15 bg-black/30 px-4 text-white hover:bg-white hover:text-black'
				>
					<Filter className='mr-2 h-4 w-4' />
					Filter
				</Button>
			</div>

			<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
				{templateItems.map((item) => (
					<TemplateCard key={item.id} item={item} />
				))}
			</div>
		</section>
	);
}
