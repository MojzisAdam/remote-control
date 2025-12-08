import React from "react";
import { Search } from "lucide-react";
import deviceErrors from "@/features/device-management/deviceErrors";
import { HoverClickPopover } from "@/components/ui/hover-popover";
import { DisplayType } from "@/utils/displayTypeUtils";

interface ErrorHintProps {
	errorCode: string | number;
	firmwareVersion?: number;
	displayType?: string;
}

const ErrorHint: React.FC<ErrorHintProps> = ({ errorCode, firmwareVersion = 813, displayType = DisplayType.RPI }) => {
	const errorCodeInt = parseInt(errorCode.toString(), 10);
	const firmwareVersionInt = parseInt(firmwareVersion.toString(), 10);

	const errorMessage = deviceErrors.error(errorCodeInt, firmwareVersionInt, displayType);
	const errorDescription = deviceErrors.errorDescribe(errorCodeInt, firmwareVersionInt, displayType);

	const displayErrorCode = deviceErrors.getDisplayErrorCode(errorCodeInt, displayType);

	return (
		<div className="flex items-center">
			{displayErrorCode}
			<HoverClickPopover
				content={
					<div className="whitespace-pre-wrap text-sm">
						{errorMessage}
						{errorDescription}
					</div>
				}
				className="max-w-md"
			>
				<span className="inline-flex ml-1 cursor-pointer">
					<Search size={16} />
				</span>
			</HoverClickPopover>
		</div>
	);
};

export default ErrorHint;
