"use client";

import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { DashboardSideBar } from "@/components/app/SideBar";
import DashboardTopNav from "@/components/app/TopNavigation";
import EmailVerificationNotice from "@/components/app/EmailVerificationNotice";
import { Outlet } from "react-router-dom";

const AppLayout: React.FC = () => {
	const { user } = useAuth();

	return (
		<div>
			<SidebarProvider>
				<DashboardSideBar />
				<main className="w-full bg-white dark:bg-zinc-950 overflow-hidden">
					<DashboardTopNav />
					<div className="p-8 max-sm:px-4">
						{!user?.email_verified_at && <EmailVerificationNotice />}
						<Outlet />
					</div>
				</main>
			</SidebarProvider>
		</div>
	);
};

export default AppLayout;
