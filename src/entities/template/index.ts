export { templateApi } from "./api/template.api";
export {
	templateKeys,
	useInfiniteTemplates,
	useTemplateDetail,
	useTemplateVersions,
	useTemplatePreview,
	type UseInfiniteTemplatesOptions,
} from "./model/template.queries";
export {
	useCreateTemplateFromPage,
	usePublishTemplateVersion,
	useUseTemplate,
	useUpdateTemplate,
	useArchiveTemplate,
	useRestoreTemplate,
	type CreateTemplateFromPageInput,
	type PublishTemplateVersionInput,
	type UseTemplateInput,
	type UpdateTemplateInput,
} from "./model/template.mutations";
export type {
	PageTemplate,
	TemplateStatus,
	TemplateVisibility,
	TemplateListResponse,
	ListTemplatesParams,
	CreateTemplateFromPagePayload,
	TemplateVersion,
	TemplateVersionStatus,
	TemplateBlock,
	TemplatePreview,
	UseTemplatePayload,
	UseTemplateResponse,
	UpdateTemplatePayload,
} from "./model/template.types";
