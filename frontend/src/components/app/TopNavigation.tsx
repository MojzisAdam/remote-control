import { UserProfile } from "@/components/app/UserProfile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationIcon from "@/components/notifications/NotificationIcon";

export default function DashboardTopNav() {
	return (
		<div className="bg-gray-50 dark:bg-black flex items-center justify-center relative top-0 z-90">
			<div className="flex flex-col w-full">
				<header className="flex h-14 lg:h-[55px] items-center gap-4 border-b px-4 max-sm:px-2">
					<div>
						<SidebarTrigger />
					</div>
					<div className="flex justify-center items-center gap-8 ml-auto">
						<NotificationIcon />
						<UserProfile />
					</div>
				</header>
			</div>
		</div>
	);
}
