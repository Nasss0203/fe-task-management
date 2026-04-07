export type PricingPlan = {
	id: string;
	name: string;
	description: string;
	price: string;
	priceSuffix: string;
	intro: string;
	features: string[];
};

export type PricingTabKey = "individuals" | "businesses";
