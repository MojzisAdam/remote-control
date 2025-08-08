export enum DisplayType {
	RPI = 1,
	AMIT = 2,
	TYPE3 = 3,
}

export function getDisplayTypeName(displayType: number): string {
	switch (displayType) {
		case DisplayType.RPI:
			return "RPI";
		case DisplayType.AMIT:
			return "AMiT";
		case DisplayType.TYPE3:
			return "Daitsu";
		default:
			return "Unknown Display Type";
	}
}
