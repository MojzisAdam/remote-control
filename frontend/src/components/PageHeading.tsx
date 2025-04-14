import React from "react";

interface Device {
	own_name?: string;
	id: string;
}

interface PageHeadingProps {
	icon?: React.ComponentType<{ className?: string }>;
	heading: string;
	device?: Device | null;
	initialLoading: boolean;
}

const PageHeading: React.FC<PageHeadingProps> = ({ icon: Icon, heading, device, initialLoading }) => {
	return (
		<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full">
			<h1 className="text-2xl font-bold flex flex-wrap items-center gap-2 max-sm:text-xl">
				<div className="flex gap-2 items-center">
					{Icon && <Icon className="h-6 w-6 min-w-6 min-h-6" />}
					<span>{heading}</span>
				</div>
				{!initialLoading && device && (
					<span className="text-lg font-normal text-muted-foreground truncate max-w-full sm:max-w-md" title={device.own_name ? `- ${device.own_name} (${device.id})` : `- ${device.id}`}>
						{device.own_name ? `- ${device.own_name} (${device.id})` : `- ${device.id}`}
					</span>
				)}
			</h1>
		</div>
	);
};

export default PageHeading;
