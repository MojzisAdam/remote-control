"use client";

import PageSettingsNavigation from "@/components/guest/Navigation";
import { Outlet } from "react-router-dom";

const GuestLayout: React.FC = () => {
	return (
		<div>
			<div className="min-h-screen relative antialiased bg-white dark:bg-black h-full w-full overflow-hidden">
				<PageSettingsNavigation />
				<div className="flex-grow flex items-center justify-center min-h-[80vh]">
					<div className="mt-8 mb-8 px-4 w-full flex items-center justify-center">
						<Outlet />
					</div>
				</div>
			</div>
		</div>
	);
};

export default GuestLayout;
