import React from "react";

interface ParameterDisplayProps {
	data: {
		reg_64?: number;
		reg_65?: number;
		reg_71?: number;
		reg_68?: number;
		reg_75?: number;
		reg_76?: number;
		reg_77?: number;
		reg_78?: number;
		reg_33?: number;
		reg_35?: number;
		reg_36?: number;
		reg_96?: number;
		reg_97?: number;
		reg_99?: number;
		reg_108?: number;
		reg_109?: number;
		reg_110?: number;
		reg_111?: number;
		reg_128?: number;
		reg_133?: number;
		reg_193?: number;
		reg_195?: number;
	};
}

const ParameterDisplay: React.FC<ParameterDisplayProps> = ({ data }) => {
	const parameterGroups = [
		{
			title: "Heating Parameters",
			parameters: {
				reg_64: {
					label: "Heating Setpoint",
					unit: "°C",
					multiplier: 0.1,
				},
				reg_65: {
					label: "Temperature Offset",
					unit: "°C",
					multiplier: 0.1,
				},
				reg_33: {
					label: "Min Heating Temp",
					unit: "°C",
					multiplier: 0.1,
				},
				reg_35: {
					label: "Max Heating Temp",
					unit: "°C",
					multiplier: 0.1,
				},
			},
		},
		{
			title: "Water Parameters",
			parameters: {
				reg_96: {
					label: "Water Temp Setpoint",
					unit: "°C",
					multiplier: 0.1,
				},
				reg_97: {
					label: "Water Hysteresis",
					unit: "°C",
					multiplier: 0.1,
				},
				reg_99: {
					label: "Water Economy Temp",
					unit: "°C",
					multiplier: 0.1,
				},
			},
		},
		{
			title: "Performance Settings",
			parameters: {
				reg_71: { label: "Compressor Speed", unit: "%", multiplier: 1 },
				reg_68: { label: "Fan Speed", unit: "%", multiplier: 1 },
				reg_75: { label: "Pump Speed", unit: "%", multiplier: 1 },
				reg_76: {
					label: "Efficiency Factor",
					unit: "",
					multiplier: 0.1,
				},
				reg_128: {
					label: "Outside Temp Comp",
					unit: "°C",
					multiplier: 0.1,
				},
			},
		},
		{
			title: "Timer Settings",
			parameters: {
				reg_77: { label: "Timer 1", unit: "min", multiplier: 1 },
				reg_78: { label: "Timer 2", unit: "min", multiplier: 1 },
				reg_108: {
					label: "Defrost Period",
					unit: "min",
					multiplier: 1,
				},
				reg_109: { label: "Boost Period", unit: "min", multiplier: 1 },
			},
		},
		{
			title: "Advanced Settings",
			parameters: {
				reg_110: {
					label: "Pressure Limit",
					unit: "bar",
					multiplier: 0.1,
				},
				reg_111: { label: "Flow Rate", unit: "l/min", multiplier: 0.1 },
				reg_133: {
					label: "Anti-Legionella Temp",
					unit: "°C",
					multiplier: 0.1,
				},
				reg_193: { label: "Power Limit", unit: "W", multiplier: 10 },
				reg_195: {
					label: "Energy Threshold",
					unit: "kWh",
					multiplier: 0.1,
				},
			},
		},
	];

	const formatValue = (
		value: number | undefined,
		multiplier: number,
		unit: string
	): string => {
		if (value === undefined) return "N/A";
		const convertedValue = value * multiplier;
		return `${convertedValue.toFixed(1)}${unit}`;
	};

	return (
		<div className="bg-white shadow-md rounded-lg p-4">
			<h2 className="text-xl font-bold mb-4">System Parameters</h2>

			<div className="space-y-6">
				{parameterGroups.map((group, index) => (
					<div key={index}>
						<h3 className="text-lg font-semibold mb-2 text-gray-700">
							{group.title}
						</h3>
						<div className="bg-gray-50 rounded-lg p-3">
							<table className="w-full">
								<tbody>
									{Object.entries(group.parameters).map(
										([key, param]) => (
											<tr
												key={key}
												className="border-b border-gray-200"
											>
												<td className="py-2 text-gray-600">
													{param.label}
												</td>
												<td className="py-2 text-right font-medium">
													{formatValue(
														data[
															key as keyof typeof data
														] as number,
														param.multiplier,
														param.unit
													)}
												</td>
											</tr>
										)
									)}
								</tbody>
							</table>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ParameterDisplay;
