import { cn } from "@/utils/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-md bg-[hsl(240_5.9%_10%/0.1)] dark:bg-[hsl(0_0%_98%/0.1)]", className)}
			{...props}
		/>
	);
}

export { Skeleton };
