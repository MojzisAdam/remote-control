export enum DisplayType {
	RPI = 1,
	AMIT = 2,
}

export function getDisplayTypeName(displayType: number): string {
	switch (displayType) {
		case DisplayType.RPI:
			return "RPI";
		case DisplayType.AMIT:
			return "AMiT";
		default:
			return "Unknown Display Type";
	}
}
