import { ReactNode } from "react";
import { AccentColorContext, useAccentColorState } from "@/hooks/useAccentColor";

interface AccentColorProviderProps {
	children: ReactNode;
}

export function AccentColorProvider({ children }: AccentColorProviderProps) {
	const accentColorState = useAccentColorState();

	return <AccentColorContext.Provider value={accentColorState}>{children}</AccentColorContext.Provider>;
}
