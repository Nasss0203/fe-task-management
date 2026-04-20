
import { StatItem } from "../shared/types";
import { StatCard } from "./stat-card";

type Props = {
	items: StatItem[];
};

export function StatsGrid({ items }: Props) {
	return (
		<section className='grid gap-4 md:grid-cols-2 2xl:grid-cols-3'>
			{items.map((item) => (
				<StatCard key={item.title} item={item} />
			))}
		</section>
	);
}