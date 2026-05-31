type CodeBlockProps = {
	code: string;
};

const CodeBlock = ({ code }: CodeBlockProps) => {
	return (
		<pre className='my-1 overflow-x-auto rounded-md bg-neutral-950 px-3 py-2 text-xs text-neutral-200'>
			<code>{code || "// Code"}</code>
		</pre>
	);
};

export default CodeBlock;
