/**
 * Mention lưu trong comment dạng `@[Tên](user:<uuid>)` (BE đọc uuid để gửi thông báo).
 * Ô nhập hiện `@Tên` cho dễ đọc; đổi qua lại bằng các hàm dưới.
 */
const MENTION_TOKEN = /@\[([^\]\n]{1,100})\]\(user:([0-9a-f-]{36})\)/gi;

export interface MentionRef {
	id: string;
	name: string;
	kind?: "user" | "page";
}

const PAGE_MENTION_TOKEN = /@\[([^\]\n]{1,100})\]\(page:([0-9a-f-]{36})\)/gi;

const ANY_MENTION_TOKEN = /@\[([^\]\n]{1,100})\]\((user|page):([0-9a-f-]{36})\)/gi;

const WORD_CHAR = /[\p{L}\p{N}_]/u;

export const pageMentionToken = (pageId: string) => `@[page](page:${pageId})`;

export function findPageMentionIds(body: string): string[] {
	return [
		...new Set(
			[...body.matchAll(PAGE_MENTION_TOKEN)].map((match) => match[2].toLowerCase()),
		),
	];
}

export function pageMentionsToDisplay(
	body: string,
	titles: Record<string, { title: string } | null | undefined>,
): { text: string; mentions: MentionRef[] } {
	const mentions: MentionRef[] = [];

	const text = body.replace(PAGE_MENTION_TOKEN, (token, _label: string, id: string) => {
		const page = titles[id.toLowerCase()];
		if (!page) return token;

		const name = page.title || "Untitled";
		mentions.push({ id: id.toLowerCase(), name, kind: "page" });
		return `@${name}`;
	});

	return { text, mentions };
}

export type MentionPart =
	| { type: "text"; text: string }
	| { type: "mention"; name: string; userId: string };

/** Tách nội dung thành chữ thường và mention để hiển thị. */
export function splitMentions(body: string): MentionPart[] {
	const parts: MentionPart[] = [];
	let last = 0;

	for (const match of body.matchAll(MENTION_TOKEN)) {
		const index = match.index ?? 0;

		if (index > last) parts.push({ type: "text", text: body.slice(last, index) });

		parts.push({ type: "mention", name: match[1], userId: match[2] });
		last = index + match[0].length;
	}

	if (last < body.length) parts.push({ type: "text", text: body.slice(last) });

	return parts;
}

/** Token → `@Tên` cho ô nhập, kèm danh sách mention để đổi ngược khi lưu. */
export function tokensToDisplay(body: string): {
	text: string;
	mentions: MentionRef[];
} {
	const mentions: MentionRef[] = [];

	const text = body.replace(MENTION_TOKEN, (_, name: string, id: string) => {
		mentions.push({ id, name });
		return `@${name}`;
	});

	return { text, mentions };
}

// Tên dài trước để "@Lan Anh" không bị "@Lan" ăn mất
function byNameLength(mentions: MentionRef[]): MentionRef[] {
	return [...new Map(mentions.map((m) => [m.name, m])).values()].sort(
		(a, b) => b.name.length - a.name.length,
	);
}

/** Tách chữ trong ô nhập thành chữ thường và `@Tên` đã chọn, để tô màu khi đang gõ. */
export function splitDisplayMentions(
	text: string,
	mentions: MentionRef[],
): { text: string; mention: boolean }[] {
	if (mentions.length === 0) return [{ text, mention: false }];

	const escaped = byNameLength(mentions).map((m) =>
		`@${m.name}`.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
	);

	// split với nhóm bắt: phần ở vị trí lẻ chính là mention
	return text
		.split(new RegExp(`(${escaped.join("|")})`, "g"))
		.map((part, index) => ({ text: part, mention: index % 2 === 1 }))
		.filter((part) => part.text !== "");
}

export function storedMentionsInOrder(
	body: string,
	titles: Record<string, { title: string } | null | undefined>,
): MentionRef[] {
	return [...body.matchAll(ANY_MENTION_TOKEN)].flatMap(
		([, name, kind, rawId]): MentionRef[] => {
			const id = rawId.toLowerCase();

			if (kind === "user") return [{ id: rawId, name }];

			const page = titles[id];
			return page ? [{ id, name: page.title || "Untitled", kind: "page" }] : [];
		},
	);
}

export function mentionOrdinalAt(
	text: string,
	position: number,
	name: string,
): number {
	let count = 0;

	for (let at = text.indexOf("@"); at !== -1 && at < position; at = text.indexOf("@", at + 1)) {
		if (matchesMentionAt(text, at, name)) count += 1;
	}

	return count;
}

function matchesMentionAt(text: string, at: number, name: string): boolean {
	const startsWord = at === 0 || /\s/.test(text[at - 1]);
	const end = at + 1 + name.length;

	return (
		startsWord &&
		text.startsWith(name, at + 1) &&
		!WORD_CHAR.test(text.charAt(end))
	);
}

const sameTarget = (a: MentionRef, b: MentionRef) =>
	a.id.toLowerCase() === b.id.toLowerCase() && (a.kind ?? "user") === (b.kind ?? "user");

function toToken(mention: MentionRef): string {
	return mention.kind === "page"
		? pageMentionToken(mention.id)
		: `@[${mention.name}](user:${mention.id})`;
}

interface DisplayMention {
	start: number;
	end: number;
	mention: MentionRef;
}

function findDisplayMentions(text: string, mentions: MentionRef[]): DisplayMention[] {
	const queues = new Map<string, MentionRef[]>();

	for (const mention of mentions) {
		queues.set(mention.name, [...(queues.get(mention.name) ?? []), mention]);
	}

	const names = [...queues.keys()].sort((a, b) => b.length - a.length);
	const used = new Map<string, number>();
	const found: DisplayMention[] = [];
	let index = 0;

	for (let at = text.indexOf("@"); at !== -1; at = text.indexOf("@", index)) {
		const name = names.find((candidate) => matchesMentionAt(text, at, candidate));
		const queue = name ? (queues.get(name) ?? []) : [];
		const ordinal = name ? (used.get(name) ?? 0) : 0;
		const mention =
			queue[ordinal] ??
			(queue.length > 0 && queue.every((item) => sameTarget(item, queue[0]))
				? queue[0]
				: undefined);

		if (!name || !mention) {
			index = at + 1;
			continue;
		}

		used.set(name, ordinal + 1);
		index = at + 1 + name.length;
		found.push({ start: at, end: index, mention });
	}

	return found;
}

/** `@Tên` của những người/page đã chọn → token theo đúng thứ tự; `@chữ` khác giữ nguyên. */
export function displayToTokens(text: string, mentions: MentionRef[]): string {
	let result = "";
	let index = 0;

	for (const { start, end, mention } of findDisplayMentions(text, mentions)) {
		result += text.slice(index, start) + toToken(mention);
		index = end;
	}

	return result + text.slice(index);
}

export function markDisplayMentions(
	text: string,
	mentions: MentionRef[],
): { text: string; mention: boolean }[] {
	const parts: { text: string; mention: boolean }[] = [];
	let index = 0;

	for (const { start, end } of findDisplayMentions(text, mentions)) {
		if (start > index) parts.push({ text: text.slice(index, start), mention: false });
		parts.push({ text: text.slice(start, end), mention: true });
		index = end;
	}

	if (index < text.length) parts.push({ text: text.slice(index), mention: false });

	return parts;
}

/** `@abc` ngay trước con trỏ (đầu dòng hoặc sau khoảng trắng). */
export function findMentionQuery(
	text: string,
	caret: number,
): { start: number; search: string } | null {
	const match = text.slice(0, caret).match(/(?:^|\s)@([^\s@]{0,30})$/);

	return match ? { start: caret - match[1].length - 1, search: match[1] } : null;
}
