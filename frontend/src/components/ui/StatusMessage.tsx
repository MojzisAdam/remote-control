import React, { HTMLAttributes } from "react";

interface StatusMessageProps extends HTMLAttributes<HTMLDivElement> {
	status?: string | null;
	className?: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ status, className = "", ...props }) => {
	return (
		<>
			{status && (
				<div
					className={`${className} font-medium text-sm text-blue-600`}
					{...props}
				>
					{status}
				</div>
			)}
		</>
	);
};

export default StatusMessage;
