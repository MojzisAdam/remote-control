import React from "react";
import { Search } from "lucide-react";
import deviceErrors from "@/utils/deviceErrors";
import { HoverClickPopover } from "@/components/ui/hover-popover";

interface ErrorHintProps {
	errorCode: string | number;
	firmwareVersion?: number;
}

const ErrorHint: React.FC<ErrorHintProps> = ({ errorCode, firmwareVersion = 813 }) => {
	const errorCodeInt = parseInt(errorCode.toString(), 10);
	const firmwareVersionInt = parseInt(firmwareVersion.toString(), 10);

	const errorMessage = deviceErrors.error(errorCodeInt, firmwareVersionInt);
	const errorDescription = deviceErrors.errorDescribe(errorCodeInt, firmwareVersionInt);

	return (
		<div className="flex items-center">
			{errorCodeInt}
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
