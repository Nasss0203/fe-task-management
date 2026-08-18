import { useQuery } from "@tanstack/react-query";
import { LANDING_TEMPLATE_QUERY_KEY } from "./landing-template.types";
import {
	getLandingTemplateByIdApi,
	getLandingTemplatesApi,
} from "../api/landing-template.api";

export const useLandingTemplates = (params?: {
	ownedByMe?: boolean;
	status?: string;
	visibility?: string;
	page?: number;
	limit?: number;
}) => {
	const landingTemplatesQuery = useQuery({
		queryKey: [LANDING_TEMPLATE_QUERY_KEY.TEMPLATES, params],
		queryFn: () => getLandingTemplatesApi(params),
	});

	return {
		landingTemplatesQuery,
	};
};

export const useLandingTemplate = (id: string) => {
	const landingTemplateQuery = useQuery({
		queryKey: [LANDING_TEMPLATE_QUERY_KEY.TEMPLATE_DETAIL, id],
		queryFn: () => getLandingTemplateByIdApi(id),
		enabled: !!id,
	});

	return {
		landingTemplateQuery,
	};
};
