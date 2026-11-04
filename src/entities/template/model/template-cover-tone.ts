const TEMPLATE_COVER_TONES = [
	"bg-[#eaf0fb] dark:bg-muted",
	"bg-[#eaf4ee] dark:bg-muted",
	"bg-[#f6efe6] dark:bg-muted",
	"bg-[#eeeffc] dark:bg-muted",
	"bg-[#f3f3f2] dark:bg-muted",
];

export function getTemplateCoverTone(templateId: string) {
	let hash = 0;
	for (const char of templateId) {
		hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	}
	return TEMPLATE_COVER_TONES[hash % TEMPLATE_COVER_TONES.length];
}
