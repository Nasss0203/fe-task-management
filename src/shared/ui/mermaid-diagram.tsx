"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

interface MermaidDiagramProps {
	code: string;
}

export function MermaidDiagram({ code }: MermaidDiagramProps) {
	const id = `mermaid-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
	const { resolvedTheme } = useTheme();
	const [svg, setSvg] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!code.trim()) {
			setSvg("");
			setError(null);
			return;
		}

		let active = true;

		void import("mermaid").then(async ({ default: mermaid }) => {
			const styles = getComputedStyle(document.documentElement);
			const color = (name: string) =>
				styles.getPropertyValue(name).trim() || undefined;

			mermaid.initialize({
				startOnLoad: false,
				securityLevel: "strict",
				theme: "base",
				darkMode: resolvedTheme === "dark",
				fontFamily: getComputedStyle(document.body).fontFamily,
				themeVariables: {
					background: color("--background"),
					primaryColor: color("--card"),
					primaryTextColor: color("--foreground"),
					primaryBorderColor: color("--border"),
					secondaryColor: color("--muted"),
					tertiaryColor: color("--accent"),
					lineColor: color("--muted-foreground"),
					textColor: color("--foreground"),
					mainBkg: color("--card"),
					nodeBorder: color("--primary"),
					clusterBkg: color("--muted"),
					clusterBorder: color("--border"),
					edgeLabelBackground: color("--background"),
				},
			});

			try {
				const result = await mermaid.render(id, code);

				if (active) {
					setSvg(result.svg);
					setError(null);
				}
			} catch (renderError) {
				if (active) {
					setError(
						renderError instanceof Error
							? renderError.message
							: "Invalid diagram",
					);
				}
			}
		});

		return () => {
			active = false;
		};
	}, [code, id, resolvedTheme]);

	if (error) {
		return (
			<div
				role='alert'
				className='whitespace-pre-wrap rounded-md border border-destructive/40 bg-destructive/5 p-3 font-mono text-xs text-destructive'
			>
				{error}
			</div>
		);
	}

	if (!svg) return null;

	return (
		<div
			role='img'
			aria-label='Mermaid diagram'
			className='flex w-full justify-center overflow-x-auto [&_svg]:h-auto [&_svg]:max-w-full'
			dangerouslySetInnerHTML={{ __html: svg }}
		/>
	);
}
