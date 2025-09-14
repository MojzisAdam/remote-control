"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { AccentColorProvider } from "@/components/AccentColorProvider";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemeProvider
			attribute="class"
			defaultTheme="system"
			enableSystem={true}
			themes={["light", "dark", "system"]}
			disableTransitionOnChange={false}
		>
			<AccentColorProvider>{children}</AccentColorProvider>
		</NextThemeProvider>
	);
}
