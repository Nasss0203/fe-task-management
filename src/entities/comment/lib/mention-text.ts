/**
 * Mention lưu trong comment dạng `@[Tên](user:<uuid>)` (BE đọc uuid để gửi thông báo).
 * Ô nhập hiện `@Tên` cho dễ đọc; đổi qua lại bằng các hàm dưới.
 */
const MENTION_TOKEN = /@\[([^\]\n]{1,100})\]\(user:([0-9a-f-]{36})\)/gi;

export interface MentionRef {
	id: string;
	name: string;
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

/** `@Tên` của những người đã chọn từ gợi ý → token; `@chữ` gõ tay giữ nguyên. */
export function displayToTokens(text: string, mentions: MentionRef[]): string {
	const byLength = byNameLength(mentions);

	return byLength.reduce(
		(result, mention) =>
			result.replaceAll(
				`@${mention.name}`,
				`@[${mention.name}](user:${mention.id})`,
			),
		text,
	);
}

/** `@abc` ngay trước con trỏ (đầu dòng hoặc sau khoảng trắng). */
export function findMentionQuery(
	text: string,
	caret: number,
): { start: number; search: string } | null {
	const match = text.slice(0, caret).match(/(?:^|\s)@([^\s@]{0,30})$/);

	return match ? { start: caret - match[1].length - 1, search: match[1] } : null;
}
