import { DisplayType } from "../../utils/displayTypeUtils";
import { standardGraphColumns, standardTableColumns } from "./standard";
import { daitsuGraphColumns, daitsuTableColumns } from "./daitsu";
import { Device } from "../../api/devices/model";

export interface ChartColumn {
	value: string;
	label: string;
	color: string;
	unit: string;
	valueMap?: Record<string, string>;
}

export interface TableColumn {
	key: string;
	label: string;
}

export class ChartConstantsFactory {
	private static isDaitsuType(displayType: DisplayType): boolean {
		return displayType === DisplayType.DAITSU;
	}

	private static getTypeFromDeviceOrType(deviceOrType: DisplayType | Device): DisplayType {
		return typeof deviceOrType === "string" ? deviceOrType : (deviceOrType.display_type as DisplayType);
	}

	static getGraphColumns(deviceOrType: DisplayType | Device): ChartColumn[] {
		const type = this.getTypeFromDeviceOrType(deviceOrType);
		if (this.isDaitsuType(type)) {
			return daitsuGraphColumns;
		}
		return standardGraphColumns;
	}

	static getTableColumns(deviceOrType: DisplayType | Device): TableColumn[] {
		const type = this.getTypeFromDeviceOrType(deviceOrType);
		if (this.isDaitsuType(type)) {
			return daitsuTableColumns;
		}
		return standardTableColumns;
	}

	static getAvailableColumns(deviceOrType: DisplayType | Device): string[] {
		return this.getGraphColumns(deviceOrType).map((col) => col.value);
	}

	static getColumnColor(deviceOrType: DisplayType | Device, columnName: string): string {
		const columns = this.getGraphColumns(deviceOrType);
		const column = columns.find((col) => col.value === columnName);
		return column?.color || "#000000";
	}

	static getColumnLabel(deviceOrType: DisplayType | Device, columnName: string): string {
		const columns = this.getGraphColumns(deviceOrType);
		const column = columns.find((col) => col.value === columnName);
		return column?.label || columnName;
	}

	static getColumnUnit(deviceOrType: DisplayType | Device, columnName: string): string {
		const columns = this.getGraphColumns(deviceOrType);
		const column = columns.find((col) => col.value === columnName);
		return column?.unit || "";
	}

	static getColumnValueMap(deviceOrType: DisplayType | Device, columnName: string): Record<string, string> | undefined {
		const columns = this.getGraphColumns(deviceOrType);
		const column = columns.find((col) => col.value === columnName);
		return column?.valueMap;
	}

	static formatColumnValue(deviceOrType: DisplayType | Device, columnName: string, value: number | undefined): string {
		if (value === undefined || value === null) return "---";

		const valueMap = this.getColumnValueMap(deviceOrType, columnName);
		if (valueMap && valueMap[value.toString()]) {
			return valueMap[value.toString()];
		}

		const unit = this.getColumnUnit(deviceOrType, columnName);
		if (unit === "°C") {
			return `${value.toFixed(1)} °C`;
		} else if (unit === "%" || unit === "m3/h" || unit === "kW") {
			return `${value.toFixed(1)} ${unit}`;
		}

		return value.toString();
	}
}
