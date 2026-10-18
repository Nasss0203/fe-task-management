"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { Input } from "@/shared/ui/input";

export const MAX_LISTING_TAGS = 10;
const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Same normalization as the backend ("Project Mgmt" -> "project-mgmt"). */
export function normalizeListingTag(raw: string): string | null {
	const tag = raw
		.trim()
		.toLowerCase()
		.replace(/[\s_]+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
	return tag.length >= 2 && tag.length <= 32 && TAG_PATTERN.test(tag)
		? tag
		: null;
}

interface ListingTagsFieldProps {
	tags: string[];
	onChange: (tags: string[]) => void;
	disabled?: boolean;
	changed?: boolean;
}

export function ListingTagsField({
	tags,
	onChange,
	disabled,
	changed,
}: ListingTagsFieldProps) {
	const [draft, setDraft] = useState("");
	const [error, setError] = useState<string | null>(null);
	const full = tags.length >= MAX_LISTING_TAGS;

	const add = () => {
		if (!draft.trim()) return;
		const tag = normalizeListingTag(draft);
		if (!tag) {
			setError("Use 2–32 letters, numbers or dashes.");
			return;
		}
		if (!tags.includes(tag)) onChange([...tags, tag]);
		setDraft("");
		setError(null);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" || event.key === ",") {
			event.preventDefault();
			add();
		} else if (event.key === "Backspace" && !draft && tags.length > 0) {
			onChange(tags.slice(0, -1));
		}
	};

	return (
		<div className='flex flex-col gap-2'>
			<div className='flex items-center justify-between gap-2'>
				<label
					htmlFor='listing-tags-input'
					className='text-sm leading-none font-medium'
				>
					Tags
				</label>
				{changed ? (
					<span className='text-xs text-amber-600 dark:text-amber-400'>
						Applied when you release
					</span>
				) : (
					<span className='text-xs text-muted-foreground'>
						{tags.length}/{MAX_LISTING_TAGS}
					</span>
				)}
			</div>
			{tags.length > 0 && (
				<ul aria-label='Listing tags' className='flex flex-wrap gap-1.5'>
					{tags.map((tag) => (
						<li
							key={tag}
							className='inline-flex h-7 items-center gap-1 rounded-full border pl-2.5 pr-1 text-xs'
						>
							#{tag}
							<button
								type='button'
								disabled={disabled}
								aria-label={`Remove tag ${tag}`}
								onClick={() => onChange(tags.filter((value) => value !== tag))}
								className='inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50'
							>
								<X className='size-3' aria-hidden />
							</button>
						</li>
					))}
				</ul>
			)}
			<Input
				id='listing-tags-input'
				value={draft}
				disabled={disabled || full}
				onChange={(event) => {
					setDraft(event.target.value);
					setError(null);
				}}
				onKeyDown={onKeyDown}
				onBlur={add}
				placeholder={full ? "Tag limit reached" : "Add a tag and press Enter"}
				aria-invalid={Boolean(error)}
				aria-describedby='listing-tags-help'
				className='w-full sm:w-80'
			/>
			<p
				id='listing-tags-help'
				className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}
			>
				{error ?? "Buyers can search and filter by tag."}
			</p>
		</div>
	);
}
