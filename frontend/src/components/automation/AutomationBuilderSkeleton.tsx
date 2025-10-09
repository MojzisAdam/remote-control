import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

const AutomationBuilderSkeleton: React.FC = () => {
	return (
		<div className="min-h-[calc(100vh-120px)] flex">
			{/* Left sidebar skeleton */}
			<div className="w-72 lg:w-80 border-r bg-background flex flex-col">
				<ScrollArea className="flex-1">
					<div className="flex flex-col">
						{/* Automation details skeleton */}
						<Card className="m-2 lg:m-4">
							<CardHeader className="pb-2">
								<Skeleton className="h-4 w-32" />
							</CardHeader>
							<CardContent className="space-y-2">
								<Skeleton className="h-9 w-full" />
								<Skeleton className="h-9 w-full" />
							</CardContent>
						</Card>

						{/* Node palette skeleton */}
						<Card className="m-2 lg:m-4">
							<CardHeader className="pb-2">
								<Skeleton className="h-4 w-28" />
							</CardHeader>
							<CardContent className="space-y-2">
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
								<Skeleton className="h-8 w-full" />
							</CardContent>
						</Card>

						{/* Flow statistics skeleton */}
						<Card className="m-2 lg:m-4">
							<CardHeader className="pb-2">
								<Skeleton className="h-4 w-24" />
							</CardHeader>
							<CardContent className="space-y-1">
								<div className="grid grid-cols-2 gap-2">
									<div className="flex items-center justify-between">
										<Skeleton className="h-3 w-12" />
										<Skeleton className="h-5 w-6" />
									</div>
									<div className="flex items-center justify-between">
										<Skeleton className="h-3 w-12" />
										<Skeleton className="h-5 w-6" />
									</div>
								</div>
								<div className="flex items-center justify-between pt-1 border-t">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-5 w-6" />
								</div>
							</CardContent>
						</Card>

						{/* Validation status skeleton */}
						<Card className="m-2 lg:m-4">
							<CardHeader className="pb-2">
								<div className="flex items-center">
									<Skeleton className="w-3 h-3 mr-2 rounded-full" />
									<Skeleton className="h-4 w-12" />
								</div>
							</CardHeader>
							<CardContent>
								<Skeleton className="h-3 w-20" />
							</CardContent>
						</Card>

						{/* Quick Tips skeleton */}
						<Card className="m-2 lg:m-4">
							<CardHeader className="pb-2">
								<Skeleton className="h-4 w-20" />
							</CardHeader>
							<CardContent className="space-y-1">
								<div className="space-y-1">
									<Skeleton className="h-3 w-24" />
									<Skeleton className="h-3 w-32" />
									<Skeleton className="h-3 w-20" />
								</div>
							</CardContent>
						</Card>
					</div>
				</ScrollArea>

				{/* Action buttons skeleton */}
				<div className="p-2 lg:p-4 border-t bg-background">
					<div className="space-y-2">
						<div className="grid grid-cols-2 gap-1">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
						<div className="grid grid-cols-3 gap-1">
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
							<Skeleton className="h-8 w-full" />
						</div>
					</div>
				</div>
			</div>

			{/* Main canvas skeleton */}
			<div className="flex-1 relative">
				{/* Canvas content skeleton */}
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="space-y-4 text-center">
						<Skeleton className="h-16 w-16 rounded-full mx-auto" />
						<Skeleton className="h-4 w-32 mx-auto" />
						<Skeleton className="h-3 w-48 mx-auto" />
					</div>
				</div>

				{/* Toolbar skeleton */}
				<div className="absolute top-2 left-2 right-2 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2">
					<div className="flex items-center gap-1 flex-wrap">
						<Skeleton className="h-6 w-12" />
						<Skeleton className="h-6 w-16" />
						<Skeleton className="h-6 w-20 hidden lg:inline-flex" />
					</div>
					<div className="flex gap-1">
						<Skeleton className="h-8 w-16" />
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-16" />
						<Skeleton className="h-8 w-14" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default AutomationBuilderSkeleton;
