import { PageBlockItem } from "@/services/page_block/type";
import { useEffect, useState, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { html } from "@codemirror/lang-html";
import { python } from "@codemirror/lang-python";
import { css } from "@codemirror/lang-css";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { php } from "@codemirror/lang-php";
import { sql } from "@codemirror/lang-sql";
import { rust } from "@codemirror/lang-rust";
import { useTheme } from "next-themes";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type CodeBlockProps = {
	block: PageBlockItem;
	code: string;
	onUpdate: (block: PageBlockItem) => void;
};

const getContentObject = (block: PageBlockItem) => {
	if (
		block.content &&
		typeof block.content === "object" &&
		!Array.isArray(block.content)
	) {
		return block.content;
	}

	return {};
};

const LANGUAGES: Record<string, { name: string; ext: any }> = {
	typescript: { name: "TypeScript", ext: javascript({ jsx: true, typescript: true }) },
	javascript: { name: "JavaScript", ext: javascript({ jsx: true }) },
	html: { name: "HTML", ext: html() },
	css: { name: "CSS", ext: css() },
	json: { name: "JSON", ext: json() },
	markdown: { name: "Markdown", ext: markdown() },
	python: { name: "Python", ext: python() },
	java: { name: "Java", ext: java() },
	cpp: { name: "C++", ext: cpp() },
	php: { name: "PHP", ext: php() },
	sql: { name: "SQL", ext: sql() },
	rust: { name: "Rust", ext: rust() },
};

const CodeBlock = ({ block, code, onUpdate }: CodeBlockProps) => {
	const contentObj = getContentObject(block);
	const initialLang = (contentObj.language as string) || "typescript";

	const [value, setValue] = useState(code);
	const [lang, setLang] = useState(initialLang);
	const valueRef = useRef(code);
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		setValue(code);
		valueRef.current = code;
	}, [code]);

	useEffect(() => {
		setLang((contentObj.language as string) || "typescript");
	}, [contentObj.language]);

	const handleSave = () => {
		const currentValue = valueRef.current;
		if (currentValue === code && lang === initialLang) return;

		onUpdate({
			...block,
			content: {
				...contentObj,
				code: currentValue,
				language: lang,
			},
		});
	};

	const handleLanguageChange = (newLang: string) => {
		setLang(newLang);
		onUpdate({
			...block,
			content: {
				...contentObj,
				code: valueRef.current,
				language: newLang,
			},
		});
	};

	const extension = LANGUAGES[lang]?.ext || LANGUAGES.typescript.ext;

	return (
		<div className='my-1 w-full overflow-hidden rounded-md border border-border/70 text-sm flex flex-col group'>
			<div className='flex items-center justify-between bg-muted/30 px-3 py-1.5 border-b border-border/70 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100'>
				<Select value={lang} onValueChange={handleLanguageChange}>
					<SelectTrigger className="h-7 w-[130px] border-none bg-transparent shadow-none focus:ring-0 text-xs text-muted-foreground p-0">
						<SelectValue placeholder="Select Language" />
					</SelectTrigger>
					<SelectContent>
						{Object.entries(LANGUAGES).map(([key, info]) => (
							<SelectItem key={key} value={key} className="text-xs">
								{info.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			<CodeMirror
				value={value}
				onChange={(val) => {
					setValue(val);
					valueRef.current = val;
				}}
				onBlur={handleSave}
				extensions={[extension]}
				theme={resolvedTheme === "dark" ? "dark" : "light"}
				maxHeight="500px"
				basicSetup={{
					lineNumbers: true,
					foldGutter: true,
					highlightActiveLine: true,
					tabSize: 4,
				}}
			/>
		</div>
	);
};

export default CodeBlock;
